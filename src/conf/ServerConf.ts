
/**
 * 游戏服务器配置
 */
export default class ServerConf {
    /** // 服务器索引 */
    public readonly id: number;
    /** 服务器类型 */
    public readonly type: string = "game";
    /** // 服务器名称 */
    public readonly name: string;

    /** //socketip */
    public readonly game_ip: string;
    /** // SOCKET端口 */
    public readonly game_port: number;
    /** // CLI端口 */
    public readonly cli_port: number;
    /** // HTTP端口 */
    public readonly http_port: number;

    constructor(id: number, name: string, game_ip: string, game_port: number, cli_port: number, http_port: number) {
        this.id = id;
        this.name = name;

        this.game_ip = game_ip;
        this.game_port = game_port;
        this.cli_port = cli_port;
        this.http_port = http_port;
    }

    toGate() {
        return {
            id: this.id,
            name: this.name,
            ip: this.game_ip,
            game_port: this.game_port,
            http_port: this.http_port,
        };
    }
}