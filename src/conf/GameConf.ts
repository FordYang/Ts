import ServerConf from "./ServerConf";

// 游戏配置
export default class GameConf {
    //--Game--------------------------------------------------------------------------------------------------------
    // 版本号
    static version: string = "1.0.0";
    // 客户端最低版本控制
    static login_version: string = "2.1.0";
    // 渠道名称
    static channel: string = "cyxt";
    // 是否为调试
    static isDebug: boolean = true;
    // 是否为本地
    static isLocal: boolean = true;
    // 本地地址
    static local_ip: string = "127.0.0.1";
    // 外网地址
    static outer_ip: string = "";
    //--DB--------------------------------------------------------------------------------------------------------
    // db地址
    static db_ip: string = "sh-cdb-qh83ks2s.sql.tencentcdb.com";
    // 数据库帐号
    static db_user: string = "sa";
    // 数据库密码
    static db_pwd: string = "mj123456";
    // 数据库名称
    static db_name: string = "cyxt";
    // 数据库端口
    static db_port: number = 60211;
    //--Gate--------------------------------------------------------------------------------------------------------
    // 网关服索引
    static gate_id: number = 1030;
    // 网关服名称
    static gate_name: string = "网关服";
    // 网关端口
    static gate_port: number = 7561;
    // 网关数据库接口
    static gate_db_port: number = 7807;
    // 网关IP地址
    static get gate_ip(): string 
    {
        return GameConf.isLocal ? GameConf.local_ip : GameConf.outer_ip;
    }
    //----------------------------------------------------------------------------------------------------------
    // 服务器列表
    static server_list: ServerConf[] = [];
    // 邮件开关
    static mailEnabled: boolean = true;
    /** 每日刷新时间 */
    public static everyDay: number = 0;
}
