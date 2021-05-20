/**
 * 命令行工具用于开发调试
 */
import readline from "readline";
import Logger from "../gear/Logger";
import ServerMgr from "./ServerMgr";
export default class GateCmd {
    static shared = new GateCmd();
    readline: any;

    constructor() {
    }
    // 启动
    launch() {
        this.readline = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.readline.on('line', function (line: any) {
            let cmd: string = line.trim()
            let params = cmd.split(" ");
            if (params.length > 0) {
                cmd = params.shift();
            }
            switch (cmd) {
                case "mem":
                    let rss = process.memoryUsage().rss;
                    let mem = (rss / (1024 * 1024)).toFixed(2) + 'm';
                    Logger.debug(`内存使用:${mem}`);
                    break;
                case "close":
                    Logger.info(`服务器关闭功能未实现!`);
                    break;
                case 'save_all':
                    Logger.info(`服务器存档功能未实现!`);
                    break;
                case "num":
                    Logger.log(ServerMgr.instance.player_num + "/" + ServerMgr.instance.trust_num);
                    break;
                default:
                    Logger.debug(`无效的命令:[${cmd}]!`);
                    break;
            }
        });
        this.readline.on("close", () => {
            Logger.debug('命令行关闭');
            process.exit(0);
        });
    }
}