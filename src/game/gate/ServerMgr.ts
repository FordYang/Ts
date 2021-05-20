import Http from "../utils/Http";
import DB from "../utils/DB";
import DataUtil from "../gear/DataUtil";
import Logger from "../gear/Logger";
import GameConf from "../../conf/GameConf";
import Server from "./Server";
import { ErrorConst } from "../consts/ErrorConst";
import { EServerState } from "../consts/EServerState";
import GameTokenMgr from "../mgr/GameTokenMgr";
import GateTokenMgr from "./GateTokenMgr";

// 游戏服务器管理
export default class ServerMgr {
    public static readonly instance = new ServerMgr();

    //----------------------------------------------------------------------------------------------

    private serverMap: { [sid: number]: Server };

    constructor() {
        this.serverMap = {};
    }

    //----------------------------------------------------------------------------------------------

    launch() {
        // 初始化服务器列表
        let server_list = GameConf.server_list;
        for (let index = 0; index < server_list.length; index++) {
            let conf = server_list[index];
            let server = new Server();
            server.readConf(conf);
            this.serverMap[server.sid] = server;
        }

        this.pingAllServer();
        setInterval(this.pingAllServer, 60000);
    }


    //----------------------------------------------------------------------------------------------
    private pingAllServer = () => 
    {
        Object.values(this.serverMap).forEach((server) => 
        {
            Http.sendget(server.net_ip, server.http_port, "/ping_game", null, (success: boolean, data: { code: ErrorConst, sid: number, playernum: number, trustnum:number, idlist: string[] }) => 
            {
                if (success) 
                {
                    if (data && data.code === ErrorConst.SUCCEED)
                    {
                        server.isOpen = true;
                        server.ping(data.playernum || 0, data.trustnum ?? 0);
                        GateTokenMgr.shared.reActive(data.idlist);
                    }
                    else
                    {
                        server.isOpen = false;
                    }
                }
                else 
                {
                    Logger.debug(`游戏服[${server.net_ip}:${server.name}]断开连接`);

                    // if (server.status === EServerState.close) 
                    // {
                    //     this.delServer(server);
                    // }
                    server.isOpen = false;
                }
            });
        });
    }

    /**服务器标识 */
    public serverReg(id: number, name: string, ip: string, game_port: number, http_port: any): boolean 
    {
        Logger.info(`游戏服注册:[${id}:${name}]外网地址[${ip}:${game_port}]HTTP端口[${http_port}]`);

        let server = this.getServer(id);
        if (server) 
        {
            server.parse(id, name, ip, game_port, http_port);
            server.registered();
        }
        else 
        {
            server = new Server();
            server.parse(id, name, ip, game_port, http_port);
            server.registered();
            this.serverMap[server.sid] = server;
        }
        server.isOpen = true;

        return true;
    }

    public getServer(serverId:number): Server 
    {
        return this.serverMap[serverId];
    }

    public delServer(server: Server): void 
    {
        delete this.serverMap[server.sid];
    }

    /**获得服务器列表 */
    public getServerList() 
    {
        return Object.values(this.serverMap);
    }

    /**发送所有的服务器 */
    sendAllServer(event: string, data: any, callback?: (success: boolean, data: any) => void) {
        let index = 0;
        let total = DataUtil.getLength(this.serverMap);
        for (let key in this.serverMap) {
            let server = this.serverMap[key];
            Http.sendget(server.net_ip, server.http_port, event, data, (success: boolean, data: any) => {
                index++;
                if (index == total) {
                    if (callback) {
                        callback(true, data);
                    }
                }
            });
        }
    }

    //----------------------------------------------------------------------------------------------
    /**统计玩家数量 */
    public get player_num(): number {
        let serverlist = Object.values(this.serverMap);
        let total = 0;
        for (let server of serverlist) {
            total += server.player_num;
        }
        return total;
    }

    public get trust_num():number
    {
        let serverlist = Object.values(this.serverMap);
        let total = 0;
        for (let server of serverlist) {
            total += server.trust_num;
        }
        return total;
    }
}
