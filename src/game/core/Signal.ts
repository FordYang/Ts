import GameUtil from "./GameUtil";
import Http from "../utils/Http";
import Logger from "../gear/Logger";
import GameConf from "../../conf/GameConf";
import { ErrorConst } from "../consts/ErrorConst";
import GameEvent from "../consts/GameEvent";
import EventTool from "./EventTool";

export default class Signal {
    public static instance = new Signal();
    //-------------------------------------------------------------------------------------------------------------------------
    private regSt: number = 0;
    private gatePingSt: number = 0;

    constructor() 
    {
        EventTool.on(GameEvent.ENTER_FRAME_SEC, this.checkOnline);
    }

    public launch():void
    {
        this.registerServer();
    }

    /**是否在线 */
    private checkOnline = () => 
    {
        if (Date.now() - this.regSt > 5000) 
        {
            this.regSt = Date.now();
            //3分钟
            if (Date.now() - this.gatePingSt > 120000) 
            {
                this.registerServer();
            }
        }
    }

    public gatePing(): void 
    {
        this.gatePingSt = Date.now();
    }

    // 向网关服务器发起Http请求
    private sendToGate(cmdstr: string, data: any, callback: (success: any, data: any) => void): void 
    {
        Http.sendget(GameConf.gate_ip, GameConf.gate_port, cmdstr, data, callback);
    }

    // 向网关注册游戏服务器
    private registerServer(): void 
    {
        if (!GameUtil.isClose)
        {
            let params = GameUtil.serverConf.toGate();
            this.sendToGate("/register_server", params, (success: any, data: any) => 
            {
                if (success) 
                {
                    if (data.code == ErrorConst.SUCCEED) 
                    {
                        this.gatePingSt = Date.now();
    
                        Logger.debug(`游戏服[${GameUtil.serverId}:${GameUtil.serverName}]建立连接`);
                    }
                }
            });
        }
    }
}