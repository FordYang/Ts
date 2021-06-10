import ServerConf from "../../conf/ServerConf";
import { EServerState } from "../consts/EServerState";
import Http from "../utils/Http";

/**
 * 服务器信息类
 * 
 * state服务器状态：1：正常，2：拥挤
 */
export default class Server {
    /**id */
    sid: number;
    /**名称 */
    name: string;
    /**ip地址 */
    net_ip: string;
    /**ws端口 */
    net_port: number;
    /**http端口 */
    http_port: number;
    /**玩家数量 */
    public player_num: number = 0;
    public trust_num:number = 0;
    /**状态 */
    private state: number;

    public isOpen:boolean = true;

    constructor() 
    {
        this.sid = 0;
        this.net_ip = "127.0.0.1";
        this.net_port = 8561;
        this.http_port = 8911;
        this.name = '未知服务器';
        this.player_num = 0;
        this.trust_num = 0;
        this.state = EServerState.lower;
    }

    public get status():EServerState
    {
        if (this.isOpen)
        {
            return this.state;
        }
        return EServerState.close;
    }

    /** 读配置 */
    public readConf(conf: ServerConf): void {
        this.sid = Number(conf.id);
        this.name = conf.name;
        this.net_ip = conf.game_ip;
        this.net_port = conf.game_port;
        this.http_port = conf.http_port;
    }

    public parse(id: number, name: string, ip: string, game_port: number, http_port: number): void {
        this.sid = id;
        this.name = name;
        this.net_ip = ip;
        this.net_port = game_port;
        this.http_port = http_port;
    }

    public registered(): void 
    {
        this.updateState();
    }

    public ping(playernum: number, trustnum:number) 
    {
        this.player_num = playernum;
        this.trust_num = trustnum;

        this.updateState();
    }

    public updateState(): void 
    {
        if (this.player_num >= 300) 
        {
            this.state = EServerState.high;
        }
        else 
        {
            this.state = EServerState.lower;
        }
    }

    public send(path: string, data: any) {
        return new Promise<{ success: boolean, data: any }>((resolve) => {
            Http.sendget(this.net_ip, this.http_port, path, data, (success: boolean, data: any) => {
                resolve({ success: success, data: data });
            });
        });
    }
}