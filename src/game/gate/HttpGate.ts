import ServerMgr from "./ServerMgr";
import DB from "../utils/DB";
import Http from "../utils/Http";
import express, { json, urlencoded } from "express";
import { Express, Request, Response } from "express";
import DataUtil from "../gear/DataUtil";
import Logger from "../gear/Logger";
import GameConf from "../../conf/GameConf";
import GameUtil from "../core/GameUtil";
import { ErrorConst } from "../consts/ErrorConst";
import GateTokenMgr from "./GateTokenMgr";
import FrozenIPMgr from "./FrozenIPMgr";
import FrozenMacMgr from "./FrozenMacMgr";
import Server from "./Server";
import MailRecord from "../dbrecord/MailRecord";
import GateDB from "./GateDB";
import DBForm from "../utils/DBForm";
import mysql from "mysql";
import OperateMgr from "./OperateMgr";
import { EServerState } from "../consts/EServerState";
import DateUtil from "../gear/DateUtil";

export default class HttpGate {
    /**引用自身  */
    public static readonly instance = new HttpGate();
    /**账号注册列表 */
    AccountRegisterList: any = {};

    createList: any = {};
    chargeActivityState: any = {}; // 充值活动是否开启的状态 
    payUserKey: string = "";
    reportKey: string[] = [];
    /**设置跨域请求 */
    app: Express;
    constructor() {
        this.app = express();
        this.app.use(function (req: Request, res: Response, next: any) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Expose-Headers", "'Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1');
            res.header("Content-Type", "application/json;charset=utf-8");
            next();
        });
        this.app.use(json({ limit: "10mb" }));
        this.app.use(urlencoded({ limit: "10mb", extended: true }));
    }
    /**--Client------------------------------------------------------------------------------------------------------------ */
    /**转客户端版本 */
    private cli_version(req: any, res: any) {
        Http.reply(res, {
            code: ErrorConst.SUCCEED,
            version: GameConf.login_version
        });
    }

    /**注册请求 */
    private register(req: any, res: any) {
        if (GameUtil.isClose) {
            Http.reply(res, {
                code: ErrorConst.NET_ERROR,
                msg: "游戏关服维护中,请稍候注册!"
            });
            return;
        }
        let version = req.query.version;
        if (DataUtil.checkVersion(version, GameConf.login_version) < 0) {
            let info = `您的游戏端版本号${version}过低,为更好的游戏体验请退出游戏自动升级!`;
            Http.reply(res, {
                code: ErrorConst.VERSION_LOWER,
                msg: info,
                data: { token: "" },
            });
            return;
        }
        let account_id = req.query.account_id;
        if (DataUtil.isEmptyString(account_id)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的账号渠道凭证`,
                data: {},
            });
            return;
        }
        let platform_id = DataUtil.numberBy(req.query.platform_id);
        if (isNaN(platform_id)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的渠道类型`,
                data: {}
            });
            return;
        }
        let password = req.query.password;
        if (DataUtil.isEmptyString(password)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的账号密码`,
                data: {},
            });
            return;
        }
        let phoneid = req.query.phone;
        if (this.AccountRegisterList[account_id]) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `已注册`
            });
            return;
        }
        let ip = this.getClientIP(req, res);
        if (FrozenIPMgr.instance.checkIP(ip)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `禁止注册`
            });
            return;
        }

        let nowtime = Date.now();
        this.AccountRegisterList[account_id] = {
            account_id: account_id,
            password: password,
            phoneid: phoneid,
            reqtime: nowtime,
        }
        DB.accountRegister({
            account_id: account_id,
            password: password,
            platform_id: 0,
            phone: phoneid
        }, (code: number, msg: string) => {
            delete this.AccountRegisterList[account_id];
            if (code == ErrorConst.SUCCEED) {
                this.onLoginByAccountId(true, account_id, password, platform_id, res, ip, null);
            } else {
                Http.reply(res, {
                    code: code,
                    msg: msg
                });
            }
        });
    }

    /**玩家登录 */
    private login(req: express.Request, res: express.Response): void {
        // let sql = `select * from cy_record_item`;
        // DB.query(sql, (error, rows) => {
        //     if (rows && rows.length > 0) {
        //         for (let row of rows) {
        //             if (!row.itemname) {
        //                 let itemid = row.itemId;
        //                 let iC = ItemConfig.instance.getItemCfgById(itemid);
        //                 if (iC) {
        //                     let sql1 = `update cy_record_item set itemname = '${iC.name}' where uuid = ${row.uuid};`;
        //                     DB.query(sql1);
        //                 }
        //             }
        //         }
        //     }
        //     console.log("");
        // });
        if (GameUtil.isClose) {
            Http.reply(res, {
                code: ErrorConst.NET_ERROR,
                msg: "游戏关服维护中,请稍候登录!"
            });
            return;
        }
        let version = String(req.query.version);
        let account_id = String(req.query.account_id);
        let password_id = String(req.query.password_id);
        let platform_id = Number(req.query.platform_id);
        let ip = this.getClientIP(req, res);
        let mac = String(req.query.mac);
        if (DataUtil.checkVersion(version, GameConf.login_version) < 0) {
            let info = `您的游戏端版本号${version}过低,为更好的游戏体验请退出游戏自动升级!`;
            Http.reply(res, {
                code: ErrorConst.VERSION_LOWER,
                msg: info,
                data: { token: "" },
            });
            return;
        }
        if (!account_id) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的账号渠道凭证`,
                data: {},
            });
            return;
        }
        if (!password_id) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的密码凭证`,
                data: {},
            });
            return;
        }
        if (isNaN(platform_id)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `无效的渠道类型`,
                data: {}
            });
            return;
        }

        if (FrozenIPMgr.instance.checkIP(ip)) {
            Logger.warn(`登录:帐号[${account_id}]登录失败:被禁IP[${ip}]`);
            Http.reply(res, {
                code: ErrorConst.IP_FORBIDDEN,
                msg: "您的帐号IP被冰结!"
            });
            return;
        }

        if (FrozenMacMgr.instance.checkMAC(mac)) {
            Logger.warn(`登录:帐号[${account_id}]登录失败:被禁MAC[${mac}]`);
            Http.reply(res, {
                code: ErrorConst.MAC_FORBIDDEN,
                msg: "您的帐号MAC被冰结!"
            });
            return;
        }

        // Logger.debug(`登录:玩家[${account_id}]读表登录...`);
        this.onLoginByAccountId(false, String(account_id), String(password_id), platform_id, res, ip, mac);
    }

    /**自动登录 */
    private onLoginByAccountId(isRegister: boolean, account_id: string, password_id: string, platform_id: number, res: express.Response, ip: string, mac: string): void {
        let infoObj = {
            account: account_id,
            password: password_id,
            platform: platform_id,
            ip: ip,
            mac: mac,
        };
        DB.accountLogin(infoObj, (code: number, msg: string, data: any) => {
            let result: any = {
                code: code,
                msg: msg
            };
            if (code == ErrorConst.SUCCEED) {
                result.data = {
                    account: data.account,
                    account_id: data.account_id,
                    lastServerId: data.last_server_id,
                    createDate: data.create_date,
                    register: isRegister,
                    token: GateTokenMgr.shared.makeSecret(data.account_id)
                };
                Http.reply(res, result);
            }
            else if (code == ErrorConst.ACOUNT_ERROR) {
                /**帮玩家注册账号 */
                DB.accountRegister({
                    account_id: account_id,
                    password: password_id,
                    platform_id: platform_id,
                    phone: ""
                }, (code: number, msg: string) => {
                    if (code == ErrorConst.SUCCEED) {
                        this.onLoginByAccountId(true, account_id, password_id, platform_id, res, ip, mac);
                    } else {
                        Logger.debug(`登录:玩家[${account_id}]注册失败[${msg}]`);
                        Http.reply(res, result);
                    }
                });
            } else {
                Http.reply(res, result);
                Logger.debug(`玩家[${account_id}]读表登录失败[${code}]`);
            }
        });
    }

    /**获取服务器列表 */
    private getServerList(req: any, res: any) {
        let serverList = ServerMgr.instance.getServerList();
        let serverlist = [];
        let keys = Object.keys(serverList);
        for (let key of keys) {
            serverlist.push(serverList[Number(key)]);
        }

        let result: any = {};
        let data: any = {
            serverList: serverlist,
            historyList: []
        }
        let account_id = req.query.account_id;
        DB.GetAccountServerNum(account_id, (code: any, rows: any) => {
            if (code == ErrorConst.SUCCEED) {
                for (let row of rows) {
                    if (data.historyList.indexOf(row.server_id) == -1)
                        data.historyList.push(row.server_id);
                }
            }
            // Logger.debug(`读取服务器列表完成!`);
            result.code = code;
            result.data = data;
            Http.reply(res, result);
        });
    }

    /**获得角色列表 */
    private getRoleList(req: any, res: any) {
        let accountId = req.query.account_id;
        if (accountId == null) {
            Http.reply(res,
                {
                    code: ErrorConst.FAILED,
                    msg: `获得角色列表:帐号参数错误!`,
                });
            return;
        }
        let serverId = req.query.server_id;

        let server = ServerMgr.instance.getServer(serverId);
        if (!server) {
            Http.reply(res,
                {
                    code: ErrorConst.FAILED,
                    msg: `服务器不存在！`,
                });
            return;
        }
        else if (server.status === EServerState.close) {
            Http.reply(res,
                {
                    code: ErrorConst.FAILED,
                    msg: `服务器维护中！`,
                });
            return;
        }

        let result: any = {
            code: ErrorConst.SUCCEED,
            data: { roleList: [] },
            lastRid: 0
        };

        DB.getRoleList(accountId, serverId, (code: any, rows: any) => {
            if (code == ErrorConst.SUCCEED) {
                let time = 0;
                for (let row of rows) {
                    if (row.state != 0) {
                        let player = {
                            role_id: row.role_id,
                            role_name: row.role_name,
                            role_level: row.role_level,
                            server_id: row.server_id,
                            account: row.account,
                            account_id: row.account_id,
                            profession: row.profession,
                            create_date: row.create_date
                        }
                        result.data.roleList.push(player);
                        let date = new Date(row.lastonline);
                        if (time < date.getTime()) {
                            time = date.getTime();
                            result.lastRid = row.role_id;
                        }
                    }
                }
                DB.updateLastServer(accountId, serverId);
            }
            // Logger.debug(`玩家[${accountId}:${serverId}]读取角色列表完成[${code}]`);
            result.code = code;
            Http.reply(res, result);
        });
    }

    /**通过连接 获取客户端ip */
    private getClientIP(req: any, res: any): string {
        var ip = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        ip = ip.replace(/::ffff:/, '');
        if (ip.split(',').length > 0) {
            ip = ip.split(',')[0];
        }
        return ip;
    }

    /**创建角色 */
    private createRole(req: any, res: any) {
        if (GameUtil.isClose) {
            Http.reply(res, {
                code: ErrorConst.NET_ERROR,
                msg: "游戏关服维护中,请稍候注册角色!"
            });
            return;
        }
        let account = req.query.account;
        let account_id = req.query.account_id;
        let server_id = req.query.server_id;
        let role_name = req.query.role_name;
        let profession = req.query.profession;
        let namelimit = ['江湖', '如来', '第一人'];
        if (role_name.length < 1) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `角色名称过短`,
                roleid: 0,
            });
            return;
        }
        for (let ln of namelimit) {
            if (role_name.indexOf(ln) != -1) {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `非法角色名称`,
                    roleid: 0,
                });
                Logger.warn(`创建角色:[${account_id}:${role_name}]角色名非法!`);
                return;
            }
        }
        let checkname = GameUtil.checkLimitWord(role_name);
        if (!checkname) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `角色名称已存在`,
                roleid: 0,
            });
            Logger.warn(`创建角色:[${account_id}:${role_name}]角色名不合要求!`);
            return;
        }
        DB.searchPlayerName(role_name, server_id, (code: any, len: number) => 
        {
            if (code == ErrorConst.SUCCEED && len === 0) 
            {
                let roleData = {
                    account: account,
                    account_id: account_id,
                    server_id: server_id,
                    role_name: role_name,
                    profession: profession
                };
                let nowtime = Date.now();
                let createTime = this.createList[account * 10000 + server_id];
                if (createTime != null && (nowtime - createTime) < 10 * 1000) {
                    res.end();
                    Logger.warn(`创建角色:[${account}:${role_name}]超时返回!`);
                    return;
                }
                this.createList[account * 10000 + server_id] = nowtime;
                DB.insertRole(roleData, (code: any, roleId: any) => {
                    delete this.createList[account * 10000 + server_id];
                    Http.reply(res, {
                        code: code,
                        msg: `创建角色${code == ErrorConst.SUCCEED ? "成功" : "失败"}`,
                        roleid: roleId,
                    });
                    Logger.debug(`创建角色:[${account}:${role_name}]${code == 0 ? "成功" : "失败"}`);
                });
            } else {
                Http.reply(res, {
                    code: ErrorConst.ROLE_NAME_EXIST,
                    msg: `角色名称已存在`,
                    roleid: 0,
                });
                Logger.warn(`创建角色:[${account_id}:${role_name}]角色名称已存在!`);
            }
        });
    }

    /**删除角色 */
    private removeRole(req: any, res: any) {
        // 角色索引
        let role_id = parseInt(req.query.role_id);
        if (isNaN(role_id)) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `删除角色:角色索引无效!`,
            });
            return;
        }
        DB.removeRole(role_id, (error: any, rows: any) => {
            if (error) {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `删除角色:数据库错误!`,
                });
                return;
            }
            let affectedRows: number = DataUtil.numberBy(rows.affectedRows, 0);
            if (affectedRows < 1) {
                Http.reply(res, {
                    code: ErrorConst.SUCCEED,
                    msg: `删除角色:无此角色[${role_id}]!`,
                });
                return;
            }
            let changedRows: number = DataUtil.numberBy(rows.changedRows, 0);
            if (changedRows < 1) {
                Http.reply(res, {
                    code: ErrorConst.SUCCEED,
                    msg: `删除角色:[${role_id}]已被删除，无需再删!`,
                });
                return;
            }
            Http.reply(res, {
                code: ErrorConst.SUCCEED,
                msg: `删除角色:[${role_id}]成功!`,
            });
        });
    }

    /**注册服务器 */
    private registerServer(req: express.Request, res: express.Response): void {
        let id = Number(req.query.id);
        let name = String(req.query.name);
        let ip = String(req.query.ip);
        let game_port = Number(req.query.game_port);
        let http_port = Number(req.query.http_port);
        ServerMgr.instance.serverReg(id, name, ip, game_port, http_port);
        Http.reply(res,
            {
                code: ErrorConst.SUCCEED,
                // tokens: TokenMgr.shared.getAllToken(),
            });
    };

    /**更新公告 */
    private updateNotice(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let ntitle = reqParam.title;
        let ncontent = reqParam.content;
        if (!ntitle) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "标题填写错误！"
            });
            return;
        }
        if (!ncontent) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "公告填写错误！"
            });
            return;
        }
        let sql = `INSERT INTO cy_notice(title, type, server_id, content, create_date) VALUES('${ntitle}',1,0000,'${ncontent}',NOW());`;
        DBForm.instance.asyncQuery(sql);
        Http.reply(res, {
            code: ErrorConst.SUCCEED,
            msg: "公告发布成功！"
        });
    }

    /**查询通知 */
    private getNotice(req: any, res: any) {
        GateDB.searchNoticeInfo().then((data) => {
            Http.reply(res, {
                code: ErrorConst.SUCCEED,
                msg: `通知查询成功!`,
                notice: data.rows
            });
        });
    }

    /**发送邮件 */
    private sendMail(req: any, res: express.Response) {
        if (GameUtil.isClose) {
            Http.reply(res,
                {
                    code: ErrorConst.FAILED,
                    msg: `游戏已关服,不能发送邮件!`
                });
            return;
        }
        let queryObj = req.query;
        let server_id = queryObj.server_id ?? 0;
        let role_id = queryObj.role_id ?? 0;
        let role_name = queryObj.role_name ?? "";
        let title = queryObj.title ?? "";
        let content = queryObj.content ?? "";
        let rewards = queryObj.rewards ?? "";//[{itemId:number, quality:number, count:number}]
        let serverList: Server[] = [];

        if (!title) {
            Http.reply(res, { code: ErrorConst.FAILED, msg: `发送邮件:Title参数错误` });
            return;
        }

        if (rewards) 
        {
            let tmpobj = DataUtil.jsonBy(rewards);
            if (!tmpobj) 
            {
                Http.reply(res, { code: ErrorConst.FAILED, msg: `发送邮件:奖励JSON错误:${rewards}` });
                return;
            }
        }

        // let plist: Promise<{ code: ErrorConst, data?: any }>[] = [];
        GateDB.getRoleBaseInfoByServerId(server_id, role_id, role_name).then((rows) => 
        {
            if (rows.length > 0) 
            {
                let mailDataList:MailRecord[] = [];
                for (let row of rows) 
                {
                    let mailData = MailRecord.createNewMail(row.role_id, row.server_id, 0, "系统", title, content, rewards);
                    mailDataList.push(mailData);
                }
                GateDB.insertMailList(mailDataList).then((data1) => 
                {
                    if (server_id) 
                    {
                        let server = ServerMgr.instance.getServer(server_id);
                        if (server) 
                        {
                            serverList.push(server);
                        }
                    }
                    else 
                    {
                        serverList.push(...ServerMgr.instance.getServerList());
                    }

                    let data = { to_role_id: role_id };//, title, content, rewards 
                    for (let server of serverList) 
                    {
                        server.send("/send_mail", data);
                    }

                    // let failedCount: number = 0;
                    // for (let data of datalist) 
                    // {
                    //     if (data.code !== ErrorConst.SUCCEED) 
                    //     {
                    //         failedCount++;
                    //     }
                    // }

                    Http.reply(res, data1);//{ code: ErrorConst.SUCCEED, msg: `成功：${datalist.length - failedCount} 失败：${failedCount}` }
                });
            }
            else {
                Http.reply(res, { code: ErrorConst.FAILED});
            }
        });
    }

    private searchMail(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let server_id: number = Number(reqParam.server_id) ?? 0;
        let to_role_id: number = Number(reqParam.to_role_id) ?? 0;
        let from_role_id: number = Number(reqParam.from_role_id) ?? 0;
        let start_idx: number = Number(reqParam.start_idx) ?? 0;
        let end_idx: number = Number(reqParam.end_idx) ?? 0;

        let conditionlist: string[] = [];
        if (server_id) {
            conditionlist.push(`serverId=${mysql.escape(server_id)}`);
        }
        if (to_role_id) {
            conditionlist.push("toRoleId=" + mysql.escape(to_role_id));
        }
        // if (from_role_id) {
        //     conditionlist.push("fromRoleId=" + mysql.escape(from_role_id));
        // }

        if (!server_id && !to_role_id && !from_role_id) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `缺少必要参数!`
            });
            return;
        }

        let limitSql: string = "";
        if (start_idx || end_idx) {
            limitSql = "limit " + mysql.escape(start_idx) + (end_idx ? "," + mysql.escape(end_idx) : '');
        }
        else {
            limitSql = "limit 50";
        }

        let conditionSql = conditionlist.length > 0 ? "where " + conditionlist.join(" AND ") : "";

        let sql = `select * from cy_mail ${conditionSql} ${limitSql}`;
        let p1 = DBForm.instance.asyncQuery(sql);

        let sql1 = `select count(*) as total from cy_mail ${conditionSql}`;
        let p2 = DBForm.instance.asyncQuery(sql1);

        Promise.all([p1, p2]).then((values) => {
            let recordlist = values[0].data;
            Http.reply(res,
                {
                    code: ErrorConst.SUCCEED,
                    data:
                    {
                        data: recordlist, total: (values[1]?.data?.[0].total)
                    }
                });
        });
    }

    private sendNotice(req: express.Request, res: express.Response): void {
        let reqParam = req.query;
        let server_id: number = Number(reqParam.server_id) ?? 0;
        let role_id: number = Number(reqParam.role_id) ?? 0;
        let msg = String(reqParam.msg);

        if (!msg) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `缺少必要参数！msg`
            });
            return;
        }

        let serverlist = server_id ? [ServerMgr.instance.getServer(server_id)] : ServerMgr.instance.getServerList();
        if (serverlist) {
            let data = { role_id, msg };
            for (let server of serverlist) {
                server?.send("/send_notice", data);
            }
            Http.reply(res, {
                code: ErrorConst.SUCCEED,
            });
        }
        else {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `服务器未找到！${server_id}`
            });
            return;
        }
    }

    /**账号验证  */
    private verifyAccount(req: express.Request, res: express.Response) {
        let accountid = req.query.accountid as string;
        let token = req.query.token as string;

        let isLogin: boolean = GateTokenMgr.shared.verifyAccount(accountid, token);
        res.end(DataUtil.toJson(
            {
                code: isLogin ? ErrorConst.SUCCEED : ErrorConst.FAILED
            }, '{}')
        );
    }
    /** 支付查询 */
    private searchPay(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let server_id: number = Number(reqParam.server_id) ?? 0;
        let role_id: number = Number(reqParam.role_id) ?? 0;
        let role_name: string = reqParam.role_name as string ?? "";
        let product_id: number = Number(reqParam.product_id) ?? 0;
        let order_no: string = reqParam.order_no as string ?? "";
        let cp_order_no: string = reqParam.cp_order_no as string ?? "";
        let start_date: string = reqParam.start_date as string ?? "";
        let end_date: string = reqParam.end_date as string ?? "";
        let start_idx: number = Number(reqParam.start_idx) ?? 0;
        let end_idx: number = Number(reqParam.end_idx) ?? 0;

        let conditionlist: string[] = [];
        conditionlist.push("!isnull(order_no)");
        conditionlist.push("cy_pay.role_id=cy_role.role_id")
        if (server_id) {
            conditionlist.push(`cy_pay.server_id=${mysql.escape(server_id)}`);
        }
        if (role_id) {
            conditionlist.push("cy_pay.role_id=" + mysql.escape(role_id));
        }
        if (role_name) {
            conditionlist.push("cy_role.role_name=" + mysql.escape(role_name));
        }
        if (product_id) {
            conditionlist.push("cy_pay.product_id=" + mysql.escape(product_id));
        }
        if (order_no) {
            conditionlist.push("cy_pay.order_no=" + mysql.escape(order_no));
        }
        if (cp_order_no) {
            conditionlist.push("cy_pay.cp_order_no=" + mysql.escape(cp_order_no));
        }
        if (start_date) {
            conditionlist.push("cy_pay.finish_date>=" + mysql.escape(start_date));
        }
        if (end_date) {
            conditionlist.push("cy_pay.finish_date<=" + mysql.escape(end_date));
        }

        let limitSql: string = "";
        if (start_idx || end_idx) {
            limitSql = "limit " + mysql.escape(start_idx) + (end_idx ? "," + mysql.escape(end_idx) : '');
        }
        else {
            limitSql = "limit 50";
        }

        let conditionSql = conditionlist.length > 0 ? "where " + conditionlist.join(" AND ") : "";

        let sql = `select cy_pay.cp_order_no, cy_pay.order_no, cy_pay.server_id, cy_pay.role_id, cy_role.role_name, cy_pay.product_id, cy_pay.product_name, cy_pay.money, cy_pay.finish_date from cy_pay, cy_role ${conditionSql} ${limitSql}`;
        let p1 = DBForm.instance.asyncQuery(sql);

        let sql1 = `select sum(cy_pay.money) as totalMoney, count(*) as totalPage from cy_pay, cy_role ${conditionSql}`;
        let p2 = DBForm.instance.asyncQuery(sql1);

        Promise.all([p1, p2]).then((values) => {
            let recordlist = values[0].data;
            if (recordlist) {
                for (let record of recordlist) {
                    record.finish_date = DateUtil.format_2(new Date(record.finish_date));
                }
            }
            Http.reply(res,
                {
                    code: ErrorConst.SUCCEED,
                    data:
                    {
                        data: recordlist, totalMoney: (values[1]?.data?.[0].totalMoney), totalPage: (values[1]?.data?.[0].totalPage)
                    }
                });
        });
    }
    //--未开放-------------------------------------------------------------------------------------------------------------------
    /**封IP */
    private frozenIP(req: any, res: any) {
        let fip = req.query.frozen_ip;
        if (!fip) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `封禁失败，需要有效的frozen_ip参数!`
            });
            return;
        }
        let ip = this.getClientIP(req, res);
        let list = ServerMgr.instance.getServerList();
        let find = false;
        for (let serverid in list) {
            let server = list[serverid];
            if (server.net_ip == ip) {
                find = true;
                break;
            }
        }
        if (!find) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `${fip}尝试攻击服务器的封IP!`
            });
            return;
        }
        FrozenIPMgr.instance.addFrozenIP(fip);
        //通知当前IP下的所有玩家下线
        DB.getFrozenIpRoleid(fip, (ret: any, ipList: any) => {
            if (ret == ErrorConst.SUCCEED) {
                let roleList = [];
                for (let ip of ipList) {
                    roleList.push(ip.roleid);
                }
                ServerMgr.instance.sendAllServer('/kicked_out', {
                    roleids: roleList,
                });
            }
        });
        Http.reply(res, {
            code: ErrorConst.SUCCEED,
            msg: `封禁${fip}成功!`
        });
    }
    /**解封IP */
    private unfrozenIP(req: any, res: any) {
        let fip = req.query.frozen_ip;
        let ip = this.getClientIP(req, res);
        let list = ServerMgr.instance.getServerList();
        let find = false;
        for (let serverid in list) {
            let server = list[serverid];
            if (server.net_ip == ip) {
                find = true;
                break;
            }
        }
        if (!find) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `${fip}尝试攻击服务器的解封IP!`
            });
            return;
        }
        FrozenIPMgr.instance.removeFrozenIP(fip);
        Http.reply(res, {
            code: ErrorConst.SUCCEED,
            msg: `解封${fip}成功!`
        });
    }
    /**封设备 */
    private frozenMAC(req: any, res: any) {
        let account_id = req.query.account_id;
        let gm_role_id = req.query.gm_role_id;
        if (!gm_role_id) {
            gm_role_id = 0;
        }
        DB.freezeMAC({
            account_id: account_id,
            gm_role_id: gm_role_id
        }, (code: number, msg: string, mac: string) => {
            if (mac && mac.length > 0) {
                FrozenMacMgr.instance.addFrozenMAC(mac);
                DB.getFrozenMacRoleid(mac, (ret: any, rows: any) => {
                    if (ret == ErrorConst.SUCCEED) {
                        let roleList = [];
                        for (let data of rows) {
                            roleList.push(data.roleid);
                        }
                        ServerMgr.instance.sendAllServer('/kicked_out', {
                            roleids: roleList,
                        });
                    }
                });
            }
            Http.reply(res, {
                code: code,
                msg: msg
            });
        });
    }
    /**解封设备 */
    private unfrozenMAC(req: any, res: any) {
        let account_id = req.query.account_id;
        DB.unfreezeMAC({
            account_id: account_id
        }, (code: number, msg: string, mac: string) => {
            if (code == ErrorConst.SUCCEED) {
                FrozenMacMgr.instance.removeFrozenMAC(mac);
                Http.reply(res, {
                    code: code,
                    msg: msg
                });
            }
        });
    }
    /**提交异常日志 */
    private report(req: any, res: any) {
        let params = req.body;
        let roleId = params.roleId;
        let msg = params.msg;
        msg.replace("\'", "\\\'");
        msg.replace("\"", "\\\"");
        if (this.reportKey.indexOf(msg) != -1) {
            Http.reply(res, {
                code: 1
            })
            return;
        }
        let version = params.version ?? "";
        let platfrom = params.platform;
        let ip = this.getClientIP(req, res);
        Http.reply(res, {
            code: 0
        })
        Logger.warn(`$前端异常:角色索引[${roleId}]\n消息:${msg},\n版本:${version},平台:${platfrom},IP:${ip}`);
        this.reportKey.push(msg);
    }
    /**全部玩家存档 */
    private saveAll(req: any, res: any) {
        let server_id = req.query.server_id; // 0 则全服存档
        if (!server_id) {
            server_id = 0;
        }
        let server_list = [];
        if (server_id == 0) {
            let servers = ServerMgr.instance.getServerList();
            for (let key in servers) {
                server_list.push(servers[key]);
            }
        } else {
            let server = ServerMgr.instance.getServer(server_id);
            if (server) {
                server_list.push(server);
            }
        }
        if (server_list.length < 1) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `全部存档:找不到未开闭的服务器!`
            });
            return;
        }
        let total = server_list.length;
        let count = 0;
        let msg = ``;
        let list: any[] = [];
        for (let server of server_list) {
            Http.sendget(server.net_ip, server.http_port, '/save_all', {}, (success: boolean, data: any) => {
                count++;
                msg += `${msg.length < 1 ? `` : `,`}${data.msg}`;
                list.push(data);
                if (count == total) {
                    Http.reply(res, {
                        code: data.code,
                        msg: msg,
                        data: list
                    });
                }
            });
        }
    }
    /**关服 */
    private close(req: any, res: any) {
        GameUtil.isClose = true;
        let server_id = Number(req.query.server_id); // 0 则全服公告
        if (!server_id) {
            server_id = 0;
        }
        let server_list = [];
        if (server_id == 0) {
            let servers = ServerMgr.instance.getServerList();
            for (let key in servers) {
                server_list.push(servers[key]);
            }
        } else {
            let server = ServerMgr.instance.getServer(server_id);
            if (server) {
                server_list.push(server);
            }
        }
        if (server_list.length < 1) {
            let msg = `关服:找不到未开闭的服务器!`;
            Logger.info(msg);
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: msg
            });
            return;
        }
        let total = server_list.length;
        let count = 0;
        let msg = ``;
        let list: any[] = [];
        for (let server of server_list) {
            Logger.info(`正在关闭服务器:${server.name}`);
            Http.sendget(server.net_ip, server.http_port, '/close', {
            }, (success: boolean, data: any) => {
                count++;
                msg += `${msg.length < 1 ? `` : `,`}${data.msg}`;
                list.push(data);
                if (count == total) {
                    Logger.info(`服务器关闭完成:${server.name}`);
                    Http.reply(res, {
                        code: data.code,
                        msg: msg,
                        data: list
                    });
                }
            });
        }
    }
    /**--配合管理后台----------------------------------------------------------------------------------------------------------------------- */
    private searchRoleByRoleid(req: any, res: any) {
        let role_id = req.query.role_id;
        let role_name = req.query.role_name;
        let sData: any = {};
        if (role_id) sData.role_id = role_id;
        if (role_name) sData.role_name = role_name;
        if (!role_id && !role_name) {
            Http.reply(res, {
                code: ErrorConst.SUCCEED,
                msg: `请输入角色昵称或者角色ID`
            });
            return;
        }
        GateDB.searchRoleInfo(sData).then((data) => {
            if (data.code == ErrorConst.SUCCEED) {
                if (data.rows && data.rows.length > 0) {
                    let roleinfo: any = data.rows[0];
                    let roelData = {
                        '角色ID：': roleinfo.role_id,
                        '角色账号：': roleinfo.account,
                        '角色昵称：': roleinfo.role_name,
                        '游戏服务器：': roleinfo.server_id,
                        '角色名称：': roleinfo.role_level,
                        '角色经验：': roleinfo.role_exp,
                        '角色金币：': roleinfo.money,
                        '角色元宝：': roleinfo.yuanbao,
                        '角色所在地图：': roleinfo.mapid,
                        '角色职业：': roleinfo.profession,
                        '上次登录时间：': roleinfo.lastonline
                    };
                    Http.reply(res, {
                        code: ErrorConst.SUCCEED,
                        msg: `查询成功`,
                        data: roelData,
                    });
                } else {
                    Http.reply(res, {
                        code: ErrorConst.FAILED,
                        msg: `角色不存在`,
                        data: null,
                    });
                }
            } else {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `查询数据错误`,
                    data: null,
                });
            }
        });
    }
    /**封禁账号 */
    private frozenAccount(req: any, res: any) {
        let account_id = req.query.account_id;
        DB.freezeAccount(account_id, (code: number, msg: string) => {
            Http.reply(res, {
                code: code,
                msg: msg
            });
        });
    }
    /**解封账号 */
    private unfrozenAccount(req: any, res: any) {
        let account_id = req.query.account_id;
        DB.unfreezeAccount(account_id, (code: number, msg: string) => {
            Http.reply(res, {
                code: code,
                msg: msg
            });
        });
    }
    /**查询排行 */
    private searchRankingByCode(req: any, res: any) {
        let server_id = req.query.server_id;
        DB.searchRankingByCode(server_id, (code: number, rows: any[]) => {
            if (code == ErrorConst.SUCCEED) {
                if (rows && rows.length > 0) {
                    rows.sort((a, b) => { return b.money - a.money });
                    let test: any[] = [];
                    test = rows.slice(0, 10);
                }
            } else {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `查询失败，出错了！`
                });
                return;
            }
        });
    }
    /**--渠道汇总--------------------------------------------------------------------------------------------------------------------------------------------- */
    private getSummaryOnDay(req: any, res: any) {
        let __data = OperateMgr.instance.getSummaryOnDay();
        Http.reply(res, {
            code: ErrorConst.SUCCEED,
            data: DataUtil.toJson(__data, "{}")
        });
        // console.log("getSummaryOnDay", DataUtil.toJson(__data, "{}"));
    }
    //--------------------------------------
    private searchOnlineSt: number = 0;
    // 查询在线
    private getOnline(req: express.Request, res: express.Response): void {
        if (Date.now() - this.searchOnlineSt < 3000) {
            Http.reply(res,
                {
                    code: ErrorConst.FAILED,
                    data:
                    {
                        msg: "请求太频繁，稍后重试。"
                    }
                });
        }
        this.searchOnlineSt = Date.now();

        let queryObj = req.query;
        let serverId: number = Number(queryObj.serverId) || 0;
        let date: string = queryObj.date as string || "";
        // let endDate:string = queryObj.endDate as string || "";

        let conditionlist: string[] = [];
        if (serverId) {
            conditionlist.push("serverId=" + mysql.escape(serverId));
        }
        else {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                data:
                {
                    msg: "缺少ServerId参数"
                }
            });
            return;
        }

        if (date) {
            let startDate = new Date(date);
            startDate.setHours(0, 0, 0);
            let endDate = new Date(date);
            endDate.setHours(23, 59, 59);

            conditionlist.push("date>=" + mysql.escape(startDate));
            conditionlist.push("date<=" + mysql.escape(endDate));
        }
        else {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                data:
                {
                    msg: "缺少date参数"
                }
            });
            return;
        }

        let conditionSql = conditionlist.length > 0 ? "where " + conditionlist.join(" AND ") : "";
        let sql = `select online, trust, date from cy_online ${conditionSql} ORDER BY date DESC`;
        DBForm.instance.asyncQuery(sql).then(data => {
            if (data.err) {
                Http.reply(res, {
                    code: ErrorConst.DB_ERROR,
                    data:
                    {

                    }
                });
                return;
            }

            let list: any[] = [];
            let rows: { online: number, trust: number, date: Date }[] = data.data;
            for (let row of rows) {
                list.push({ online: row.online, trust: row.trust, date: DateUtil.format_2(new Date(row.date)) });//
            }

            Http.reply(res, {
                code: ErrorConst.SUCCEED,
                data:
                {
                    data: list
                }
            });
        });
    }
    /**查找金币流水 */
    private searchRecordByJB(req: express.Request, res: express.Response) {
        this.searchRecord(1, req, res);
    }
    /**查找元宝流水 */
    private searchRecordByYB(req: express.Request, res: express.Response) {
        this.searchRecord(2, req, res);
    }
    /**查找道具流水 */
    private searchRecordByProp(req: express.Request, res: express.Response) {
        this.searchRecord(3, req, res);
    }
    /**查找背包 */
    private searchPlayerBag(req: express.Request, res: express.Response) {
        this.searchRecord(4, req, res);
    }

    /**元宝记录 */
    private searchRecord(type: number, req: express.Request, res: express.Response) {
        if (GameUtil.isClose) {
            Http.reply(res, {
                code: ErrorConst.NET_ERROR,
                msg: "游戏关服维护中,请稍候注册角色!"
            });
            return;
        }
        let reqParam = req.query;
        let roleid: number = Number(reqParam.role_id) ?? 0;
        let serverid: number = Number(reqParam.server_id) ?? 0;
        let start_date: string = reqParam.start_date as string ?? "";
        let end_date: string = reqParam.end_date as string ?? "";
        let start_idx: number = Number(reqParam.start_idx) ?? 0;
        let end_idx: number = Number(reqParam.end_idx) ?? 0;
        /**道具 */
        let itemid: number = Number(reqParam.itemid) ?? 0;
        /**道具名称 */
        let itemname: string = reqParam.itemname as string ?? "";

        let conditionlist: string[] = [];
        if (roleid) {
            conditionlist.push(`roleid=${mysql.escape(roleid)}`);
        }
        if (serverid) {
            conditionlist.push(`serverid=${mysql.escape(serverid)}`);
        }
        if (start_date) {
            conditionlist.push("update_date >= " + mysql.escape(start_date));
        }
        if (end_date) {
            conditionlist.push("update_date <= " + mysql.escape(end_date));
        }
        if (itemid) {
            conditionlist.push(`itemid=${mysql.escape(itemid)}`);
        }
        if (itemname) {
            conditionlist.push(`itemname=${mysql.escape(itemname)}`);
        }
        let limitSql: string = "";
        if (start_idx || end_idx) {
            limitSql = "limit " + mysql.escape(start_idx) + (end_idx ? "," + mysql.escape(end_idx) : '');
        } else {
            limitSql = "limit 50";
        }
        let conditionSql = conditionlist.length > 0 ? "where " + conditionlist.join(" AND ") : "";
        let sql = "";
        let sql1 = "";
        if (type == 1) {
            sql = `select * from cy_record_money ${conditionSql} ${limitSql}`;
            sql1 = `select count(*) as totalPage from cy_record_money ${conditionSql}`;
        } else if (type == 2) {
            sql = `select * from cy_record_yuanbao ${conditionSql} ${limitSql}`;
            sql1 = `select count(*) as totalPage from cy_record_yuanbao ${conditionSql}`;
        } else if (type == 3) {
            sql = `select * from cy_record_prop ${conditionSql} ${limitSql}`;
            sql1 = `select count(*) as totalPage from cy_record_prop ${conditionSql}`;
            if (!serverid) {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `请输入要查询得服务器!`
                });
                return;
            }
        } else if (type == 4) {
            sql = `select * from cy_item ${conditionSql} ${limitSql}`;
            sql1 = `select count(*) as totalPage from cy_item ${conditionSql}`;
            if (!roleid) {
                Http.reply(res, {
                    code: ErrorConst.FAILED,
                    msg: `请输入要查询得角色!`
                });
                return;
            }
        } else {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: `查询错误!`
            });
            return;
        }
        let p1 = DBForm.instance.asyncQuery(sql);
        let p2 = DBForm.instance.asyncQuery(sql1);
        Promise.all([p1, p2]).then((values) => {
            let recordlist = values[0].data;
            if (recordlist) {
                for (let record of recordlist) {
                    record.update_date = DateUtil.format_2(new Date(record.update_date));
                }
            }
            Http.reply(res, {
                code: ErrorConst.SUCCEED,
                data: {
                    data: recordlist, totalPage: (values[1]?.data?.[0].totalPage)
                }
            });
        });
    }
    /**查询战斗力分布人数 */
    private searchPlayersByCombat(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let state: number = reqParam.state ? Number(reqParam.state) : 1;
        let serverid: number = reqParam.serverid ? Number(reqParam.serverid) : 0;
        if (!state && state != 0) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "请确认查询的玩家状态!"
            });
            return;
        }
        if (!serverid) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "请确认查询的服务器!"
            });
            return;
        }
        let eRet: any = {};
        if (!eRet.co0) eRet.co0 = 0;
        if (!eRet.co1) eRet.co1 = 0;
        if (!eRet.co2) eRet.co2 = 0;
        if (!eRet.co3) eRet.co3 = 0;
        if (!eRet.co4) eRet.co4 = 0;
        if (!eRet.co5) eRet.co5 = 0;
        if (!eRet.co6) eRet.co6 = 0;
        if (!eRet.co7) eRet.co7 = 0;
        if (!eRet.co8) eRet.co8 = 0;
        if (!eRet.co9) eRet.co9 = 0;
        if (!eRet.co10) eRet.co10 = 0;
        if (!eRet.co11) eRet.co11 = 0;
        if (!eRet.co12) eRet.co12 = 0;
        if (!eRet.co13) eRet.co13 = 0;
        if (!eRet.co14) eRet.co14 = 0;
        if (!eRet.co15) eRet.co15 = 0;
        if (!eRet.co16) eRet.co16 = 0;
        let sql = `select combat from cy_role where state = ${state} and server_id = ${serverid} and combat is not null;`;
        DBForm.instance.asyncQuery(sql).then((rows) => {
            if (rows && rows.data) {
                for (let row of rows.data) {
                    if (row.combat <= 1000) {/**1-1000 */
                        eRet.co0 += 1;
                    } else if (row.combat <= 2000) {/**1001-2000 */
                        eRet.co1 += 1;
                    } else if (row.combat <= 3000) {/**2001-3000 */
                        eRet.co2 += 1;
                    } else if (row.combat <= 4000) {/**3001-4000 */
                        eRet.co3 += 1;
                    } else if (row.combat <= 5000) {/**4001-5000 */
                        eRet.co4 += 1;
                    } else if (row.combat <= 6000) {/**5001-6000 */
                        eRet.co5 += 1;
                    } else if (row.combat <= 7000) {/**6001-7000 */
                        eRet.co6 += 1;
                    } else if (row.combat <= 8000) {/**7001-8000 */
                        eRet.co7 += 1;
                    } else if (row.combat <= 9000) {/**8001-9000 */
                        eRet.co8 += 1;
                    } else if (row.combat <= 10000) {/**9001-10000 */
                        eRet.co9 += 1;
                    } else if (row.combat <= 15000) {/**10001-15000 */
                        eRet.co10 += 1;
                    } else if (row.combat <= 20000) {/**15001-20000 */
                        eRet.co11 += 1;
                    } else if (row.combat <= 25000) {/**20001-25000 */
                        eRet.co12 += 1;
                    } else if (row.combat <= 30000) {/**25001-30000 */
                        eRet.co13 += 1;
                    } else if (row.combat <= 35000) {/**30001-35000 */
                        eRet.co14 += 1;
                    } else if (row.combat <= 40000) {/**35001-40000 */
                        eRet.co15 += 1;
                    } else {
                        eRet.co16 += 1;
                    }
                }

                let data: any = { data: [] };
                data.data.push(eRet);
                Http.reply(res, {
                    code: ErrorConst.SUCCEED,
                    msg: `查询成功!`,
                    data: data
                });
                return;
            }
        });
    }

    private searchRegRole(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let server_id: number = Number(reqParam.server_id) ?? 0;
        let start_date: string = reqParam.start_date as string ?? "";
        let end_date: string = reqParam.end_date as string ?? "";

        if (!start_date && !end_date) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "缺少必要参数! start_date, end_date"
            });
        }

        let conditionlist: string[] = [];
        if (server_id) {
            conditionlist.push(`server_id=${mysql.escape(server_id)}`);
        }
        if (start_date && end_date) {
            conditionlist.push("date(create_date) >= " + mysql.escape(start_date));
            conditionlist.push("date(create_date) <= " + mysql.escape(end_date));
        }
        else {
            conditionlist.push("date(create_date) = " + mysql.escape(start_date));
        }

        let conditionSql = conditionlist.length > 0 ? "where " + conditionlist.join(" AND ") : "";

        let sql = `select server_id, count(*) total from cy_role ${conditionSql} group by server_id;`
        DBForm.instance.asyncQuery(sql).then((rows) => {
            Http.reply(res,
                {
                    code: ErrorConst.SUCCEED,
                    data: { data: rows?.data }
                });
        });
    }

    /**查询等级分布人数 */
    private searchPlayersByLevel(req: express.Request, res: express.Response) {
        let reqParam = req.query;
        let state: number = reqParam.state ? Number(reqParam.state) : 1;
        let serverid: number = reqParam.serverid ? Number(reqParam.serverid) : 0;
        if (!state && state != 0) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "请确认查询的玩家状态!"
            });
            return;
        }
        if (!serverid) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: "请确认查询的服务器!"
            });
            return;
        }

        let eRet: any = {};
        if (!eRet.lv0) eRet.lv0 = 0;
        if (!eRet.lv1) eRet.lv1 = 0;
        if (!eRet.lv2) eRet.lv2 = 0;
        if (!eRet.lv3) eRet.lv3 = 0;
        if (!eRet.lv4) eRet.lv4 = 0;
        if (!eRet.lv5) eRet.lv5 = 0;
        if (!eRet.lv6) eRet.lv6 = 0;
        if (!eRet.lv7) eRet.lv7 = 0;
        if (!eRet.lv8) eRet.lv8 = 0;
        if (!eRet.lv9) eRet.lv9 = 0;
        if (!eRet.lv10) eRet.lv10 = 0;
        if (!eRet.lv11) eRet.lv11 = 0;
        if (!eRet.lv12) eRet.lv12 = 0;
        if (!eRet.lv13) eRet.lv13 = 0;
        if (!eRet.lv14) eRet.lv14 = 0;
        let sql = `select role_level from cy_role where state = ${state} and server_id = ${serverid};`;
        DBForm.instance.asyncQuery(sql).then((rows: any) => {
            if (rows && rows.data) {
                for (let row of rows.data) {
                    if (row.role_level <= 5) {/**1-5 */
                        eRet.lv0 += 1;
                    } else if (row.role_level <= 10) {/**6-10 */
                        eRet.lv1 += 1;
                    } else if (row.role_level <= 15) {/**11-15 */
                        eRet.lv2 += 1;
                    } else if (row.role_level <= 20) {/**16-20 */
                        eRet.lv3 += 1;
                    } else if (row.role_level <= 25) {/**21-25 */
                        eRet.lv4 += 1;
                    } else if (row.role_level <= 30) {/**26-30 */
                        eRet.lv5 += 1;
                    } else if (row.role_level <= 35) {/**31-35 */
                        eRet.lv6 += 1;
                    } else if (row.role_level <= 40) {/**36-40 */
                        eRet.lv7 += 1;
                    } else if (row.role_level <= 45) {/**41-45 */
                        eRet.lv8 += 1;
                    } else if (row.role_level <= 50) {/**46-50 */
                        eRet.lv9 += 1;
                    } else if (row.role_level <= 55) {/**51-55 */
                        eRet.lv10 += 1;
                    } else if (row.role_level <= 60) {/**56-60 */
                        eRet.lv11 += 1;
                    } else if (row.role_level <= 65) {/**61-65 */
                        eRet.lv12 += 1;
                    } else if (row.role_level <= 70) {/**66-70 */
                        eRet.lv13 += 1;
                    } else {
                        eRet.lv14 += 1;
                    }
                }

                let data: any = { data: [] };
                data.data.push(eRet);
                Http.reply(res, {
                    code: ErrorConst.SUCCEED,
                    msg: `查询成功!`,
                    data: data
                });
                return;
            }
        });
    }

    /** */
    private authorPlayer(req: express.Request, res: express.Response) {
        let query = req.query;
        if (!query.pid) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: '无效的渠道ID，请联系客服'
            });
            return;
        }
        if (!query.uid) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: '无效的账号身份，请联系客服'
            });
            return;
        }
        if (!query.name) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: '姓名不合法，请重新输入'
            });
            return;
        }
        if (!query.id_number) {
            Http.reply(res, {
                code: ErrorConst.FAILED,
                msg: '身份证不合法，请重新输入'
            });
            return;
        }
        if (!query.notify_url) {
            query.notify_url = 'https://bzyx.cn/author_player_result';
        }

        let parma: any = {
            pid: query.pid,
            uid: query.uid,
            name: query.name,
            id_number: query.id_number,
            notify_url: query.notify_url,
        }

        Http.sendPost("dev-sdk.jingyougz.com", '/api/v2/fcm/open_commit', parma, (data: any) => {
            console.log("author_player", data);
        });
    }

    /**收到实名回调 */
    private authorPlayerResult(req: express.Request, res: express.Response) {
        let bodyObj = req.body;
        let paramObj = req.query;
        console.log("authorPlayerResult", bodyObj, paramObj);
        if (bodyObj) {
            let server_list = [];
            let servers = ServerMgr.instance.getServerList();
            for (let key in servers) {
                server_list.push(servers[key]);
            }
            /**验证同步到各个服务器 */
            let total = server_list.length;
            let count = 0;
            for (let server of server_list) {
                Logger.info(`实名认证开始同步:${server.name}`);
                Http.sendget(server.net_ip, server.http_port, '/author', {
                    uid: bodyObj.uid, state: bodyObj.real_name_auth_status
                }, (success: boolean, data: any) => {
                    count++;
                    if (count == total) {
                        Logger.info(`实名认证同步成功:${server.name}`);
                    }
                });
            }
            /**修改认证的值 认证成功 */
            if (bodyObj.real_name_auth_status == 3) {
                let sql = `UPDATE cy_account SET isauthor = 1 WHERE account = ${bodyObj.uid};;`;
                DB.query(sql);
            }
        }
        Http.reply(res, {
            code: ErrorConst.SUCCEED
        });
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------
    // 启动Http服务
    start(port: number) {
        let list: { [key: string]: (req: any, res: any) => void } = {
            /**------------------------client--------------------------- */
            /**客户端版本 */
            ['cli_version']: this.cli_version.bind(this),
            /**客户端版本 */
            ['notice']: this.getNotice.bind(this),
            // 注册帐号
            ['register']: this.register.bind(this),
            // 登录帐号
            ["login"]: this.login.bind(this),
            // 获取服务器列表
            ['server_list']: this.getServerList.bind(this),
            // 获取角色列表
            ["role_list"]: this.getRoleList.bind(this),
            // 创建角色
            ['create_role']: this.createRole.bind(this),
            // 移除角色,不依除表
            ['remove_role']: this.removeRole.bind(this),
            /**------------------------server--------------------------- */
            // 发送邮件
            ["send_mail"]: this.sendMail.bind(this),
            ['search_mail']: this.searchMail.bind(this),
            // 系统通知
            ['send_notice']: this.sendNotice.bind(this),
            // 支付查询
            ["search_pay"]: this.searchPay.bind(this),
            /**　校验账号是否登录 */
            ["verify_account"]: this.verifyAccount.bind(this),
            // 全部玩家存档
            ["save_all"]: this.saveAll.bind(this),
            // 关服
            ["close"]: this.close.bind(this),
            /**向网关注册 */
            ['register_server']: this.registerServer.bind(this),
            /**更新公告 */
            ['update_notice']: this.updateNotice.bind(this),
            /**--暂未开放------------------------------------------------------ */
            // 封禁IP
            ['frozen_ip']: this.frozenIP.bind(this),
            // 解封IP
            ['unfrozen_ip']: this.unfrozenIP.bind(this),
            // 封禁MAC
            ['frozen_mac']: this.frozenMAC.bind(this),
            // 解封MAC
            ['unfrozen_mac']: this.unfrozenMAC.bind(this),
            /**--管理后台------------------------------------------------------------ */
            ['search_role']: this.searchRoleByRoleid.bind(this),
            // 封禁IP
            ['frozen_account']: this.frozenAccount.bind(this),
            // 解封IP
            ['unfrozen_account']: this.unfrozenAccount.bind(this),
            // 查询排行
            ['search_ranking']: this.searchRankingByCode.bind(this),
            /**查询今日汇总 */
            ['summary_onday']: this.getSummaryOnDay.bind(this),
            /** 查询在线 */
            ['get_online']: this.getOnline.bind(this),
            /**金币流水 */
            ['get_money_record']: this.searchRecordByJB.bind(this),
            /**元宝流水 */
            ['get_yuanbao_record']: this.searchRecordByYB.bind(this),
            /**元宝流水 */
            ['get_prop_record']: this.searchRecordByProp.bind(this),
            /**玩家背包数据 */
            ['get_player_bag']: this.searchPlayerBag.bind(this),
            // 查询道具信息
            // ['search_item']: this.searchItem.bind(this),
            /**等级分布 */
            ['search_level']: this.searchPlayersByLevel.bind(this),
            /**战力分布 */
            ['search_combat']: this.searchPlayersByCombat.bind(this),
            /** 查询注册玩家 */
            ['search_reg_role']: this.searchRegRole.bind(this),
            /**实名认证 */
            ['author_player']: this.authorPlayer.bind(this),
            ['author_player_result']: this.authorPlayerResult.bind(this)
        };

        for (let key in list) {
            this.app.get('/' + key, list[key]);
            this.app.post('/' + key, list[key]);
        }

        // 解决当FormData表单上传数据POST接收不到参数
        this.app.post("/report", this.report.bind(this));
        this.app.listen(port);
    }
}
