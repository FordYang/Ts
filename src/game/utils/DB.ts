import DBFrom from "./DBForm";
import DataUtil from "../gear/DataUtil";
import RedisUtil from "../gear/RedisUtil";
import Logger from '../gear/Logger';
import DBUtil from "../gear/DBUtil";
import { ErrorConst } from "../consts/ErrorConst";
import { EMailState } from "../consts/ERole";
import PayRecord from "../dbrecord/PayRecord";
import mysql from "mysql";

export default class DB {

    public static init() {

    };

    public static query(sql: string, callback?: (error: any, rows: any[]) => void, params?: any[]): void {
        if (DataUtil.isEmptyString(sql)) {
            let msg = `SQL错误:[SQL不能为空]!`
            Logger.warn(msg);
            callback?.(new Error(msg), null);
            return;
        }
        let tmpSql = mysql.format(sql, params);
        DBFrom.instance.query(tmpSql, callback);
    }
    /**更新登录信息 */
    public static updateLoginInfo(account: any, ip: any) {
        let sql = `UPDATE cy_account SET last_login_time = NOW() , login_ip='${ip}' WHERE account =${account};`;
        DB.query(sql, (error: any, rows: any) => {
        });
    }
    /**更新登录信息 */
    public static updateLastServer(account_id: string, server_id: number) {
        let sql = `UPDATE cy_account SET last_server_id='${server_id}' WHERE account_id ='${account_id}';`;
        DB.query(sql, (error: any, rows: any) => {
            // Logger.warn(`$游戏服:[${account_id}]刷新服务器${server_id}成功!`);
        });
    }
    /**刷新登录次数 */
    public static updateLoginTimes(logintimes: number, roleid: number) {
        let sql = `UPDATE cy_role SET logintimes=${logintimes} WHERE role_id ='${roleid}';`;
        DB.query(sql, (error: any, rows: any) => {
            // Logger.warn(`$游戏服:[${roleid}]刷新登录${logintimes}成功!`);
        });
    }
    /**帐号登录 */
    public static accountLogin(logininfo: { account: string, password: string, platform: number, ip: string, mac: string }, callback: (code: number, msg: string, data: any) => void): void {
        let account = logininfo.account;
        let password = logininfo.password;
        let ip = logininfo.ip == null ? "" : logininfo.ip;
        if (account == null || password == null) {
            Logger.warn(`$警告:[${account}:${password}]帐号或密码不能为空!`);
            callback(ErrorConst.FAILED, "帐号或密码不能为空", null);
            return;
        }
        let sql = mysql.format(`SELECT * FROM cy_account WHERE account_id = ?;`, [account]);
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, "登录数据库错误!", null);
                return;
            }
            if (rows.length > 0) {
                let data = rows[0];
                if (password == data.password_id) {
                    Logger.debug(`用户[${account}:${password}]登录帐号成功!`);
                    data.login_ip = ip;
                    DB.updateLoginInfo(data.account, ip);
                    callback(ErrorConst.SUCCEED, "登录成功", data);
                } else {
                    Logger.warn(`$警告:[${account}:${password}]登录帐号密码错误!`);
                    callback(ErrorConst.FAILED, "登录帐号密码错误", null);
                }
            }
            else {
                Logger.warn(`$警告:[${account}:${password}]登录帐号不存在!`);
                let msg = `登录帐号不存在`;
                if (logininfo.platform != 3) {
                    callback(ErrorConst.ACOUNT_ERROR, msg, null);
                } else {
                    callback(ErrorConst.FAILED, msg, null);
                }
            }
        })
    }
    /**帐号注册 */
    public static accountRegister(register_info: { account_id: string, password: string, platform_id: number, phone: string }, callback: (code: number, msg: string, data?: any) => void) {
        let phone = register_info.phone;
        let account_id = register_info.account_id;
        let password_id = register_info.password;
        let platform_id = register_info.platform_id;
        var sql = `SELECT * FROM cy_account WHERE account_id = "${account_id}";`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, `注册帐号:SQL错误,请稍候重试!`);
                return;
            }
            if (rows.length > 0) {
                callback(ErrorConst.FAILED, `帐号[${account_id}]已注册,请更换!`);
                return;
            } else {
                sql = `INSERT INTO cy_account(account_id, password_id, platform_id, phone, create_date) VALUES('${account_id}', '${password_id}','${platform_id}','${phone}', NOW());`;
                DB.query(sql, (error: any, rows: any) => {
                    if (error) {
                        callback(ErrorConst.FAILED, `注册帐号:插入失败,请稍候重试!`);
                        return;
                    }
                    callback(ErrorConst.SUCCEED, `帐号${account_id}注册成功!`);
                });
            }
        });
    }
    /**修改帐号密码 */
    static async accountChangePassword(data: any, callback: (code: number, msg: string) => void) {
        let account = data.account;
        let safecode = data.safecode;
        let password = data.password;
        let loginData: any = await RedisUtil.getValue(`${account}_login_data`);
        if (loginData) {
            loginData.password = password;
        }
        let sql = `UPDATE qy_account SET password = '${password}' WHERE account = '${account}' and safecode like '_:${safecode}';`;
        DB.query(sql, (error: any) => {
            if (error) {
                callback(ErrorConst.FAILED, `修改密码数据库错误,请稍候重试!`);
                return;
            } else {
                callback(ErrorConst.SUCCEED, `修改密码成功!`);
            }
        });
    };
    /**封禁账号列表 */
    static getFrozenList(callback: (code: number, rows: any) => void) {
        let sql = `SELECT frozen_ip FROM ip_frozen;`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            if (rows.length == 0) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    }
    /**封禁的角色Id */
    static getFrozenIpRoleid(ip: any, callback: (code: number, rows: any) => void) {
        var sql = `SELECT accountid FROM qy_account WHERE login_ip = '${ip}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            if (rows.length == 0) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            let accounts = '';
            for (const id of rows) {
                accounts = accounts + id.accountid + ',';
            }
            accounts = accounts.substr(0, accounts.length - 1);
            sql = `SELECT roleid FROM qy_role WHERE accountid IN (${accounts});`;
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    callback(ErrorConst.FAILED, []);
                    return;
                }
                if (rows.length == 0) {
                    callback(ErrorConst.FAILED, []);
                    return;
                }
                callback(ErrorConst.SUCCEED, rows);
            });
        });
    }
    /**封禁IP */
    static freezeIP = (accountid: any, callback: any) => {
        var sql = `SELECT login_ip FROM qy_account WHERE accountid = '${accountid}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED);
                return;
            }
            if (rows.length == 0) {
                callback(ErrorConst.FAILED);
                return;
            }
            let fip = rows[0].login_ip;
            sql = `SELECT * FROM ip_frozen WHERE frozen_ip = '${fip}';`;
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    callback(ErrorConst.FAILED);
                    return;
                }
                if (rows.length > 0) {
                    callback(ErrorConst.SUCCEED, 0);
                    return;
                }
                sql = `INSERT INTO ip_frozen(account_id, frozen_ip, frozen_time) VALUES('${accountid}', '${fip}', NOW());`;
                DB.query(sql, (error: any, rows: any) => {
                    if (error) {
                        callback(ErrorConst.FAILED);
                        return;
                    }
                    callback(ErrorConst.SUCCEED, fip);
                });
            });
        });
    }
    /**Mac封禁列表 */
    static getFrozenMacList = (callback: any) => {
        let sql = `SELECT mac FROM mac_frozen;`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            if (rows && rows.length == 0) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    }
    /**清除Mac封禁表 */
    static clearFrozenMacTabel(callback: (code: number, rows: any) => void) {
        let sql = `TRUNCATE mac_frozen;`
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, null);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    };
    /**获取mac的封禁角色Id */
    static getFrozenMacRoleid(mac: string, callback: (code: number, rows: any) => void) {
        var sql = `SELECT accountid FROM qy_account WHERE mac = '${mac}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            if (rows.length == 0) {
                callback(ErrorConst.FAILED, []);
                return;
            }
            let accounts = '';
            for (const id of rows) {
                accounts = accounts + id.accountid + ',';
            }
            accounts = accounts.substr(0, accounts.length - 1); //.splice(-1);
            sql = `SELECT roleid FROM qy_role WHERE accountid in (${accounts});`;
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    callback(ErrorConst.FAILED, []);
                    return;
                }
                if (rows.length == 0) {
                    callback(ErrorConst.FAILED, []);
                    return;
                }
                callback(ErrorConst.SUCCEED, rows);
            });
        });
    }
    /**封设备 */
    static freezeMAC = (info: any, callback: (code: number, msg: string, mac: string) => void) => {
        let account_id = info.account_id;
        let gm_role_id = info.gm_role_id;
        let sql = `SELECT mac FROM qy_account WHERE accountid = '${account_id}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, `禁设备:帐号[${account_id}]查询SQL错误!`, "");
                return;
            }
            if (rows.length < 1) {
                callback(ErrorConst.FAILED, `禁设备:帐号[${account_id}]已被封禁MAC!`, "");
                return;
            }
            let mac = rows[0].mac;
            sql = `SELECT * FROM mac_frozen WHERE mac = '${mac}';`;
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    callback(ErrorConst.FAILED, `禁设备:帐号[${account_id}]封禁已存在!`, "");
                    return;
                }
                if (rows.length > 0) {
                    callback(ErrorConst.FAILED, `禁设备:帐号[${account_id}]已封禁!`, mac);
                    return;
                }
                sql = `INSERT INTO mac_frozen(account_id,mac,gm_role_id) VALUES('${account_id}','${mac}','${gm_role_id}');`;
                DB.query(sql, (error: any, rows: any) => {
                    if (error) {
                        callback(ErrorConst.FAILED, `禁设备:帐号[${account_id}]插入:SQL错误!`, mac);
                        return;
                    }
                    callback(ErrorConst.SUCCEED, `禁设备:帐号[${account_id}]封禁成功!`, mac);
                });
            });
        });
    }
    /**解封帐号 */
    static unfreezeMAC = (info: any, callback: (code: number, msg: string, mac: string) => void) => {
        let account_id = info.account_id;
        let sql = `SELECT mac FROM qy_account WHERE accountid = '${account_id}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, `帐号${account_id}解封Mac,SQL错误!`, "");
                return;
            }
            if (rows.length < 1) {
                callback(ErrorConst.FAILED, `帐号${account_id}已解封!`, "");
                return;
            }
            let mac = rows[0].mac;
            let sql = `DELETE FROM mac_frozen WHERE account_id = '${account_id}';`;
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    callback(ErrorConst.FAILED, `帐号${account_id}解禁Mac:SQL错误!`, mac);
                    return;
                }
                callback(ErrorConst.SUCCEED, `帐号${account_id}解禁Mac成功!`, mac);
            });
        });
    }
    /**账号的服务器列表 */
    static getServerListByAccountId(accountid: any, callback: (code: number, rows: any) => void) {
        let sql = `SELECT * FROM qy_role WHERE accountid = ${accountid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, null);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    }
    /**获得角色列表 */
    static getRoleList(accountId: number, serverId: number, callback: (code: number, rows: any) => void) {
        let sql = `SELECT * FROM cy_role WHERE account_id = '${accountId}' AND server_id='${serverId}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, null);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    }
    /**查询账号有几个服务器 */
    static GetAccountServerNum(account_id: number, callBack: (err: any, data: any) => any) {
        let sql = `SELECT server_id FROM cy_role WHERE account_id='${account_id}'`;
        this.query(sql, function (err, rows) {
            if (err == ErrorConst.FAILED) {
                callBack(ErrorConst.FAILED, rows);
                return;
            }
            if (rows.length == 0) {
                callBack(ErrorConst.SUCCEED, rows);
                return;
            }
            callBack(ErrorConst.SUCCEED, rows);
        });
    }
    /**删除角色 */
    static removeRole(roleid: number, callback: (error: any, rows: any) => void) {
        let sql = `UPDATE cy_role SET state = 0 WHERE role_id=${roleid}`;
        DB.query(sql, callback);
    }
    /**查找名称合法性 */
    static searchPlayerName(roleName: string, serverId:number, callback: (error: any, rows: any) => void) 
    {
        let sql = `SELECT role_id FROM cy_role WHERE server_id='${serverId}' and role_name='${roleName}';`;
        DB.query(sql, (error: any, rows: any) => 
        {
            if (error) 
            {
                callback(ErrorConst.FAILED, 0);
                return;
            }
            callback(ErrorConst.SUCCEED, rows.length);
        });
    }
    /**插入角色 */
    static insertRole(roleInfo: any, callback: (code: number, roleId: number) => void) {
        let role_name = DataUtil.checkMYSQL(roleInfo.role_name);
        let sql = `SELECT * FROM cy_role WHERE (account = '${roleInfo.account}' OR hex(role_name) = hex('${role_name}')) AND server_id = '${roleInfo.server_id}';`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, 0);
                return;
            }
            let isInsert = true;
            if (rows.length > 0) {
                let roles = [];
                for (let row of rows) {
                    if (row.role_name == role_name) {
                        isInsert = false;
                        Logger.warn(`创建失败:角色名重复!`);
                        callback(ErrorConst.FAILED, rows.role_id);
                        return;
                    }
                    if (row.state != 0)
                        roles.push(row);
                }
                if (roles.length >= 3) {
                    isInsert = false;
                    Logger.warn(`创建角色:[${roleInfo.account}:${rows[0].role_name}]最多3角色`);
                    callback(ErrorConst.FAILED, rows[0].role_id);
                    return;
                }
            }
            if (isInsert) {/**可以创建 */
                sql = `INSERT INTO cy_role(account,account_id,server_id,role_name,profession,role_exp,role_level,mapid,state,logintimes,money,yuanbao,create_date,lastonline) 
                VALUES('${roleInfo.account}','${roleInfo.account_id}','${roleInfo.server_id}','${roleInfo.role_name}','${roleInfo.profession}',0,1,1001,1,0,0,0, NOW(), NOW());`;
                DB.query(sql, function (error: any, rows: any) {
                    if (error) {
                        callback(ErrorConst.FAILED, 0);
                        return;
                    }
                    if (rows.length < 1) {
                        Logger.warn(`创建角色:[${roleInfo.account}:${roleInfo.role_name}]不能多于一个!`);
                        callback(ErrorConst.FAILED, 0);
                        return;
                    }
                    callback(ErrorConst.SUCCEED, rows.insertId);
                });
            }
        });
    }
    /**刷新特权信息 */
    static updatePrerogativeSQL(roleid: number, prerogative: string) {
        var sql = `UPDATE cy_role SET prerogative = '${prerogative}' WHERE role_id =${roleid};`;
        DB.query(sql, (error: any, rows: any) => { });
    }
    /**刷新每日限购信息 */
    static updateDayMapSQL(roleid: number, dayMap: string) {
        var sql = `UPDATE cy_role SET dayMap = '${dayMap}' WHERE role_id =${roleid};`;
        DB.query(sql, (error: any, rows: any) => { });
    }
    /**登录角色 */
    static loginByRoleid(roleid: any, callback: (code: number, data: any) => void) {
        let sql = `SELECT * FROM cy_role WHERE role_id = ${roleid}`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, null);
                return;
            }
            if (rows.length > 0) {
                let data: any = rows[0];
                callback(ErrorConst.SUCCEED, data);
            }
            else {
                callback(ErrorConst.FAILED, null);
            }
        });
    };
    /**获取角色 */
    static getRoleByRoleId(roleid: any, callback: any) {
        let sql = `SELECT * FROM qy_role WHERE roleid = ${roleid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED);
                return;
            }
            if (rows.length <= 0) {
                callback(ErrorConst.FAILED);
                return;
            }
            let roleinfo = rows[0];
            callback(ErrorConst.SUCCEED, roleinfo);
        });
    }
    /**存档 */
    static savePlayerInfo(roleid: any, roleInfo: any, callback: (code: number, msg: string) => void) {
        let obj: any = {};
        obj.role_name = roleInfo.role_name;
        obj.mapid = roleInfo.mapid;
        obj.money = roleInfo.money;
        obj.combat = roleInfo.combat;
        obj.yuanbao = roleInfo.yuanbao;
        obj.role_exp = roleInfo.role_exp;
        obj.skilldata = roleInfo.skilldata;
        obj.role_level = roleInfo.role_level;
        obj.state = roleInfo.state;
        obj.setting = roleInfo.setting;
        obj.logintimes = roleInfo.logintimes;
        obj.profession = roleInfo.profession;
        obj.blackSmith = roleInfo.blackSmith;
        obj.intensify = roleInfo.intensify;
        obj.mapUnlock = roleInfo.mapUnlock;
        obj.guideStage = roleInfo.guideStage;
        obj.prerogative = roleInfo.prerogative;
        obj.yyshop = roleInfo.yyshop;
        obj.bag = roleInfo.bag;
        obj.zhenbaoId = roleInfo.zhenbaoId;
        obj.taskReceived = roleInfo.taskReceived;
        obj.xilian = roleInfo.xilian;
        obj.dayMap = roleInfo.dayMap;
        obj.jijin = roleInfo.jijin;
        obj.energy = roleInfo.energy;
        obj.duihuanma = roleInfo.duihuanma;
        // obj.lastonline = new Date();
        //`FROM_UNIXTIME(${Math.ceil(GameUtil.gameTime / 1000)})`;
        let sql = DBUtil.createUpdate("cy_role", obj, {
            role_id: roleid
        });
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                let info = DB.errorInfo(error);
                callback(ErrorConst.FAILED, info);
                return;
            }
            callback(ErrorConst.SUCCEED, "");
        });
    };
    /**刷新背包 */
    static updateBagSQL(bagInfo: string, roleid: number) {
        var sql = `UPDATE cy_role SET bag = '${bagInfo}' WHERE role_id =${roleid};`;
        DB.query(sql, (error: any, rows: any) => { });
    }
    /**缓存背包 */
    static saveItemsInfo(bagSql: string, callback: (code: number, msg: string) => void) {
        DB.query(bagSql, (error: any, rows: any) => {
            if (error) {
                let info = DB.errorInfo(error);
                callback(ErrorConst.FAILED, info);
                return;
            }
            callback(ErrorConst.SUCCEED, "");
        });
    };
    /**缓存背包 */
    static deleteItemsInfo(roleid: number, itemUid: number, callback: (code: number, msg: string) => void) {
        let sql = `DELETE FROM cy_item WHERE roleid =${roleid} AND uuid=${itemUid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                let info = DB.errorInfo(error);
                callback(ErrorConst.FAILED, info);
                return;
            }
            callback(ErrorConst.SUCCEED, "");
        });
    };
    /**刷新属性 */
    public static updateRoleAttr(roleId: number, attrList: string[], params: any[], callback?: (code: ErrorConst) => void): void {
        DB.updateFiexd("cy_role", attrList, { role_id: roleId }, params).then((result) => {
            callback?.(result.code);
        })
    }
    public static async updateFiexd(table: string, fixedList: string[], condition: { [key: string]: any }, params: any[]): Promise<{ code: number, rows: any }> {
        let valueObj: { [fiexdName: string]: any } = {};
        let len = fixedList.length;
        for (let i: number = 0; i < len; i++) {
            valueObj[fixedList[i]] = params[i];
        }
        let sql = DBUtil.createUpdate(table, valueObj, condition);

        return new Promise((resolve) => {
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    resolve({ code: ErrorConst.DB_ERROR, rows });
                    return;
                }
                resolve({ code: ErrorConst.SUCCEED, rows });
            });
        });
    }
    public static async update(table: string, fixedObj: { [fixedName: string]: any }, conditionObj: { [key: string]: any }): Promise<{ code: number, rows: any }> {
        let sql = DBUtil.createUpdate(table, fixedObj, conditionObj);

        return new Promise((resolve) => {
            DB.query(sql, (error: any, rows: any) => {
                if (error) {
                    resolve({ code: ErrorConst.DB_ERROR, rows });
                    return;
                }
                resolve({ code: ErrorConst.SUCCEED, rows });
            });
        });
    }
    // 好友
    static getFriends(roleid: any, callback: (code: number, friendsList: any) => void) { //state=1 已验证的好友  state=0未验证的好友
        var sql = `SELECT * FROM qy_friends WHERE ((roleidA = '${roleid}' OR roleidB = '${roleid}') AND state = 1) OR (roleidB = '${roleid}' AND state = 0);`;
        let friendsList: any = [];
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED, friendsList);
                return;
            }
            if (Array.isArray(rows) == false) {
                callback(ErrorConst.FAILED, friendsList);
            }
            if (rows.length <= 0) {
                callback(ErrorConst.FAILED, friendsList);
            } else {
                for (const info of rows) {
                    if (info.roleidA == roleid) {
                        friendsList.push({
                            friendid: info.id,
                            roleid: info.roleidB,
                            name: info.nameB,
                            resid: info.residB,
                            relive: info.reliveB,
                            level: info.levelB,
                            race: info.raceB,
                            sex: info.sexB,
                            accountid: info.accountidB,
                            state: info.state,
                        });
                    } else if (info.roleidB == roleid) {
                        friendsList.push({
                            friendid: info.id,
                            roleid: info.roleidA,
                            name: info.nameA,
                            resid: info.residA,
                            relive: info.reliveA,
                            level: info.levelA,
                            race: info.raceA,
                            sex: info.sexA,
                            accountid: info.accountidA,
                            state: info.state,
                        });
                    }
                }
                callback(ErrorConst.SUCCEED, friendsList);
            }
        });
    }
    /**查找 */
    static searchPlayerItem(roleId: number, callback: any) {
        let sql = `SELECT * FROM cy_item WHERE roleid =${roleId};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                callback(ErrorConst.FAILED);
                return;
            }
            callback(ErrorConst.SUCCEED, rows);
        });
    }
    /** 获取服务器所有玩家基本信息 */
    public static getRoleBaseInfoByServerId(serverId: number, role_id: number, callback: (err: any, rows: { role_id: number, role_name: string, server_id: number }[]) => void): void {
        let condiObj: { server_id?: number, role_id?: number } = {};
        if (serverId) {
            condiObj.server_id = serverId;
        }
        if (role_id) {
            condiObj.role_id = role_id;
        }
        let sql = DBUtil.createSelect("cy_role", ["role_id", "role_name", "server_id"], condiObj);
        DB.query(sql, callback);
    }
    public static getRoleBaseInfoByRoleId(roleId: number, callback: (err: any, rows: any) => void): void {
        DB.getRoleInfoByRoleId(roleId, ["role_id", "role_name", "server_id"], callback);
    }
    public static getRoleInfoByRoleId(roleId: number, fixedList: string[], callback: (err: any, rows: any) => void): void {
        let condiObj: any = { role_id: roleId };
        let sql = DBUtil.createSelect("cy_role", fixedList, condiObj);
        DB.query(sql, callback);
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 托管
    public static selectOffTrustList(roleId: number): Promise<any> {
        return new Promise((resolve) => {
            let sql = DBUtil.createSelect("cy_trust", ["*"], { role_id: roleId });
            DB.query(sql, (err, rows) => {
                if (err) {
                    resolve({ code: ErrorConst.FAILED });
                }
                else {
                    resolve({ code: ErrorConst.SUCCEED, rows });
                }
            });
        });
    }
    /**  */
    public static insertOffTrustGainList(roleId: number, gainList: any[]): void {
        let delSql = DBUtil.createDelete("cy_trust", { role_id: roleId });
        DB.query(delSql, (err) => {
            if (err) {
                return;
            }
            if (gainList) {
                let insterSql = DBUtil.createInsertList("cy_trust", gainList);
                if (insterSql) {
                    DB.query(insterSql);
                }
            }
        });
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 邮件
    // 读取玩家邮件
    public static getRoleMail(serverId: number, toRoleId: number, callback: (error: any, rows: any[]) => void) 
    {
        let sql = `select * from cy_mail where serverId=${serverId} and toRoleId=${toRoleId} and state<>${EMailState.DEL}`;
        DB.query(sql, callback);
    }

    public static getRoleNewMail(serverId: number, toRoleId: number, callback: (error: any, rows: any[]) => void) 
    {
        let sql = `select * from cy_mail where serverId=${serverId} and toRoleId=${toRoleId} and state=${EMailState.NEW}`;
        DB.query(sql, callback);
    }

    public static setMailFlag(mailId: number, state: EMailState, callback?: (code: ErrorConst) => void): void {
        DB.updateFiexd("cy_mail", ["state"], { mailId: mailId }, [state]).then((result) => {
            if (callback) {
                callback(result.code);
            }
        });
    }
    
    /**写入邮件 */
    public static insertMail(mailData: any): Promise<{ code: ErrorConst, data?: any }> 
    {
        if (mailData)
        {
            let sql = DBUtil.createInsert("cy_mail", mailData);
            return new Promise((resolve) => 
            {
                DB.query(sql, (error: any, result: any) => 
                {
                    if (error) 
                    {
                        resolve({ code: ErrorConst.FAILED });
                        return;
                    }
                    resolve({ code: ErrorConst.SUCCEED, data: result });
                });
            });
        }
        
        return Promise.resolve({code:ErrorConst.FAILED});
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 支付
    public static insertPayOrder(payrecord: PayRecord, callback: (code: ErrorConst) => void): void {
        let sql = DBUtil.createInsert("cy_pay", payrecord);
        DB.query(sql, (error: any, rows: any) => {
            if (callback) {
                if (error) {
                    callback(ErrorConst.FAILED);
                    return;
                }
                callback(ErrorConst.SUCCEED);
            }
        });
    }
    /** 获取充值订单 */
    static getPayRecordByOrder(orderId: number, callback: (error: any, rows: any[]) => void) {
        let sql = DBUtil.createSelect("cy_pay", ["*"], { cp_order_no: orderId });
        DB.query(sql, callback);
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    /**管理后台查询 */
    public static searchRoleByRoleid(role_id: number, callback: (error: any, rows: any[]) => void) {
        let sql = DBUtil.createSelect("cy_role", ["*"], { role_id: role_id });
        DB.query(sql, (error: any, rows: any) => {
            if (callback) {
                if (error) {
                    callback(ErrorConst.FAILED, null);
                    return;
                }
                callback(ErrorConst.SUCCEED, rows);
            }
        });
    }
    /**封禁账号 */
    public static freezeAccount(account_id: string, callback: (error: any, msg: string) => void) {
        let sql = `UPDATE cy_account SET state=${1} WHERE account_id='${account_id}';`;
        DB.query(sql, (error: any) => {
            if (callback) {
                if (error) {
                    callback(ErrorConst.FAILED, "账号封禁失败");
                    return;
                }
                callback(ErrorConst.SUCCEED, "账号封禁成功");
            }
        });
    }
    /**解封账号 */
    public static unfreezeAccount(account_id: string, callback: (error: any, msg: string) => void) {
        let sql = `UPDATE cy_account SET state=${0} WHERE account_id='${account_id}';`;
        DB.query(sql, (error: any) => {
            if (callback) {
                if (error) {
                    callback(ErrorConst.FAILED, "账号解封失败");
                    return;
                }
                callback(ErrorConst.SUCCEED, "账号解封成功");
            }
        });
    }
    /**排行榜 */
    public static searchRankingByCode(server_id: string, callback: (error: any, rows: any[]) => void) {
        let sql = `SELECT * FROM cy_pay;`;
        DB.query(sql, (error: any, rows: any[]) => {
            if (callback) {
                if (error) {
                    callback(ErrorConst.FAILED, rows);
                    return;
                }
                callback(ErrorConst.SUCCEED, rows);
            }
        });
    }
    /**查找数据库 */
    public static searchMine(serverid: number): Promise<{ code: ErrorConst, rows?: any }> {
        let sql = DBUtil.createSelect("cy_mine", ['*'], { serverid: serverid });
        return new Promise((resolve) => {
            DB.query(sql, (error: any, result: any) => {
                if (error) {
                    resolve({ code: ErrorConst.FAILED });
                    return;
                }
                resolve({ code: ErrorConst.SUCCEED, rows: result });
            });
        });
    }
    /**查找数据库 */
    public static selectMine(sql: string): Promise<{ code: ErrorConst, rows?: any }> {
        return new Promise((resolve) => {
            DB.query(sql, (error: any, result: any) => {
                if (error) {
                    resolve({ code: ErrorConst.FAILED });
                    return;
                }
                resolve({ code: ErrorConst.SUCCEED, rows: result });
            });
        });
    }
    /**刷新体力 */
    public static updatePlayerEnergy(sql: string) {
        DB.query(sql, (error: any, result: any) => {
            if (error) {
                Logger.log("刷新体力失败");
                return;
            }
            // Logger.log("刷新体力成功");
        });
    }
    /**玩家实名情况 */
    public static getAuthorList(): Promise<{ code: ErrorConst, rows?: any }> {
        let condiObj: { isauthor?: number } = {};
        /**查找已经实名的玩家 */
        condiObj.isauthor = 1;
        let sql = DBUtil.createSelect("cy_account", ['*'], condiObj);
        return new Promise((resolve) => {
            DB.query(sql, (error: any, result: any) => {
                if (error) {
                    resolve({ code: ErrorConst.FAILED });
                    return;
                }
                resolve({ code: ErrorConst.SUCCEED, rows: result });
            });
        });
    }
    /**--写记录------------------------------------------------------------------------------------------------------- */
    public static setRecordProp(data: { roleid: number, serverid: number, itemid: number, itemname: string, count: number, totalCount: number }) {
        let sql = `INSERT INTO cy_record_prop(roleid,serverid,itemid,itemname,count,totalCount,update_date) 
        VALUES(${data.roleid},${data.serverid},${data.itemid},'${data.itemname}',${data.count},${data.totalCount},NOW());`;
        DB.query(sql, () => { });
    }
    /**金币流水 */
    public static setRecordMoney(data: { roleid: number, serverid: number, totalValue: number, changeValue: number, record: string, state: number }) {
        let sql = `INSERT INTO cy_record_money(roleid,serverid,totalValue,changeValue,record,state,update_date) VALUES(${data.roleid},${data.serverid},${data.totalValue},${data.changeValue},'${data.record}',${data.state},NOW());`;
        DB.query(sql, () => { });
    }
    /**元宝流水 */
    public static setRecordYuanbao(data: { roleid: number, serverid: number, totalValue: number, changeValue: number, record: string, state: number }) {
        let sql = `INSERT INTO cy_record_yuanbao(roleid,serverid,totalValue,changeValue,record,state,update_date) VALUES(${data.roleid},${data.serverid},${data.totalValue},${data.changeValue},'${data.record}',${data.state},NOW());`;
        DB.query(sql, () => { });
    }
    /**缓存被删除的物品 ***主要是装备缓存*** */
    public static setRecordItem(sql: string) { DB.query(sql, () => { }); }


    /**错误反馈 */
    static errorInfo(error: any): string {
        if (error.sqlMessage) {
            return error.sqlMessage;
        }
        if (error.message) {
            return error.message;
        }
        if (error.code) {
            return error.code;
        }
        return "未知";
    }
}