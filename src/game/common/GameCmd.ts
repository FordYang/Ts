/**
 * 命令行工具用于开发调试
 */
import readline from "readline";
import Logger from "../gear/Logger";
import GameUtil from "../core/GameUtil";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import Launch from "../core/Launch";
import { hotUpdate } from "../../utils/HotUpdate";
import ConfigEntry from "../config/ConfigEntry";
import CmdID from "../network/CmdID";
import MailMgr from "../mgr/MailMgr";

export default class GameCmd {
    static shared = new GameCmd();
    readline: any;
    constructor() 
    {

    }

    // 启动
    launch() 
    {
        this.readline = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.readline.on('line', function (line: any) 
        {
            let params = line.trim().split(" ");
            for (let i = params.length - 1; i >= 0; i--)
            {
                params[i] = params[i].trim();
                if (!params[i])
                {
                    params.splice(i, 1);
                }
            }
            if (params.length === 0) 
            {
                return;
            }

            let cmd = params.shift();
            switch (cmd) 
            {
                case "mem":
                    let rss = process.memoryUsage().rss;
                    let mem = (rss / (1024 * 1024)).toFixed(2) + 'm';
                    Logger.debug(`内存使用:${mem}`);
                    break;
                case "clear_task":
                    break;
                case "close":
                    Launch.shared.close();
                    break;
                case 'save_all':
                    Logger.info(`服务器[${GameUtil.serverName}]正在存档!`);
                    break;
                case "num":
                    Logger.info(PlayerMgr.shared.getPlayerNum() + "/" + PlayerMgr.shared.getPlayerNumPeak() + "/" + PlayerMgr.shared.getTrustNum());
                    break;
                case "notice":
                    PlayerMgr.shared.broadcast(CmdID.s2c_sys_notice, {type:Number(params[0]), msg:params[1]});
                    break;
                case "hot_update":
                    // params 加载的完整路径比如 hot_update ./game/mgr/RankMgr
                    hotUpdate(params);
                    break;
                case "load_table":
                    ConfigEntry.instance.hotUpdate();
                    break;
                case 'fightlog':
                    PlayerMgr.shared.traceFightPoint();
                    break;
                case 'add_item':
                    let roleId = Number(params[0]);
                    let itemId = Number(params[1]);
                    let count = Number(params[2]);
                    let player = PlayerMgr.shared.getPlayerByRoleId(roleId);
                    if (player)
                    {
                        player.addItem(itemId, count, 'GM发放');
                    }
                    console.log('发放成功');
                    break;
                case 'send_mail':
                    MailMgr.instance.sendSysMail(446, "充值奖励", "充值奖励", [{"itemId":103039,"count":1,"quality":3}]);
                    // MailMgr.instance.sendSysMail(471, "充值奖励", "充值奖励", [{"itemId":103039,"count":1,"quality":3}]);
                    // MailMgr.instance.sendSysMail(471, "充值奖励", "充值奖励", [{"itemId":103039,"count":1,"quality":3}]);
                    // MailMgr.instance.sendSysMail(471, "充值奖励", "充值奖励", [{"itemId":103039,"count":1,"quality":3}]);
                    console.log('邮件发送成功');
                    break;
                case 'reset_day':
                    PlayerMgr.shared.resetDay();
                    break;
                case 'task_reset':
                    PlayerMgr.shared.testTaskReset();
                    Logger.debug(`任务重置完成`);
                    break;
                case 'task_set':
                    let taskId = Number(params[0]);
                    PlayerMgr.shared.testTaskSet(taskId);
                    Logger.debug(`设置任务完成`);
                    break;
                default:
                    Logger.debug(`无效的命令:[${cmd}]!`);
                    break;
            }
        });
        this.readline.on("close", () => 
        {
            Logger.debug('命令行关闭');
            process.exit(0);
        });
    }
}