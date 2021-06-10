import GameConf from "../../conf/GameConf";
import { TEE } from "../../utils/TEE";
import { ErrorConst } from "../consts/ErrorConst";
import { ESystemNoticeType } from "../consts/ESystemNoticeType";
import GameEvent from "../consts/GameEvent";
import Logger from "../gear/Logger";
import AuthorMgr from "../mgr/AuthorMgr";
import EveryDayMgr from "../mgr/EveryDayMgr";
import GlobalEnvMgr from "../mgr/GlobalEvnMgr";
import MailMgr from "../mgr/MailMgr";
import { OnlineStatMgr } from "../mgr/OnlineStatMgr";
import RankMgr from "../mgr/RankMgr";
import Player from "../model/playerObj/Player";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import AgentMgr from "../network/AgentMgr";
import CmdID from "../network/CmdID";
import EventTool from "./EventTool";
import GameUtil from "./GameUtil";
import Signal from "./Signal";


/**
 * 启动模块
 *      起始模块，初始化各个管理器，启动游戏主逻辑循环
 */
export default class Launch {
    static shared = new Launch();

    //--------------------------------------------------------------------------------------------------
    /** 秒 */
    private frameT: number = 0;
    private frameSec: number = 0;
    private frameMin: number = 0;

    constructor() {
        // 每秒4帧
        GameUtil.frameTime = 1000 / 4;
        // 主逻辑循环
    }

    mainloop() 
    {
        let currentT: number = process.uptime();

        let dt = currentT - this.frameT;
        // 玩家管理
        PlayerMgr.shared.update(dt);
        this.frameT = currentT;

        if (currentT - this.frameSec >= 1) 
        {
            this.frameSec = currentT;

            PlayerMgr.shared.update_sec();
            EventTool.emit(GameEvent.ENTER_FRAME_SEC);

            if (currentT - this.frameMin >= 60) 
            {
                this.frameMin = currentT;
    
                PlayerMgr.shared.update_min();
                AgentMgr.shared.update_min();
    
                EventTool.emit(GameEvent.ENTER_FRAME_MIN);
            }
        }
    }

    /**启动 */
    start() {
        this.frameMin = this.frameSec = this.frameT = 0;

        setInterval(this.mainloop.bind(this), GameUtil.frameTime);

        // 玩家模块
        PlayerMgr.shared.launch();

        AgentMgr.shared.launch();
        Logger.info('角色模块加载完毕！');

        Signal.instance.launch();
        Logger.info(`每日重置管理加载完毕`);

        GlobalEnvMgr.start();

        OnlineStatMgr.start();

        RankMgr.instance.readDB();

        /**实名管理 */
        AuthorMgr.instance.launch();
    }

    //--------------------------------------------------------------------------------------------------

    private saved: boolean = true;
    // 全部存档
    public saveAll(isClose: boolean, overCallback: (msg: string) => void, playerCallBack?: (player: Player) => void): void {
        if (this.saved) {
            this.saved = false;

            let p1 = PlayerMgr.shared.saveAll(isClose, playerCallBack);
            let p2 = GlobalEnvMgr.saveDB();
            let p3 = RankMgr.instance.saveDB();

            Promise.all([p1, p2, p3]).then((values) => {
                this.saved = true;

                overCallback(values[0]);
            });
        }
        else {
            overCallback("存档中。。。");
        }
    }

    // 关服
    public close(callback?: (msg: string) => void): void {
        if (GameUtil.isClose === false) {
            GameUtil.isClose = true;

            let time: number = 30;
            /**给前端发通知 */
            PlayerMgr.shared.broadcast(CmdID.s2c_sys_notice, { type: ESystemNoticeType.PAO_MA_DENG, msg: time + "秒后关闭服务器" });
            let timeId = setInterval(() => {
                time--;
                if (time === 0) {
                    clearInterval(timeId);

                    this.saveAll(true, (msg: string) => {
                        AgentMgr.shared.close();
                        callback?.(msg);
                        Logger.info(msg);
                    },
                        (player) => {
                            player.dbDirty = false;
                            player.destroy();
                        });
                }
                else {
                    PlayerMgr.shared.broadcast(CmdID.s2c_sys_notice, { type: ESystemNoticeType.PAO_MA_DENG, msg: time + "秒后关闭服务器" });
                }
            }, 1000);
        }
    }
}