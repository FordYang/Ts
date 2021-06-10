import { ErrorConst } from "../consts/ErrorConst";
import DBUtil from "../gear/DBUtil";
import DB from "../utils/DB";

export default class GateDB {
    /** 获取服务器所有玩家基本信息 */
    public static getRoleBaseInfoByServerId(serverId: number, role_id: number, role_name: string): Promise<{ role_id: number, role_name: string, server_id: number }[]> {
        return new Promise((resolve) => {
            let condiObj: { server_id?: number, role_id?: number, role_name?: string } = {};
            if (serverId) {
                condiObj.server_id = serverId;
            }
            if (role_id) {
                condiObj.role_id = role_id;
            }
            if (role_name) {
                condiObj.role_name = role_name;
            }
            let sql = DBUtil.createSelect("cy_role", ["role_id", "role_name", "server_id"], condiObj);
            DB.query(sql, (err, rows) => {
                if (err) {
                    resolve([]);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**写入邮件 */
    public static insertMailList(mailDataList: any[]): Promise<{ code: ErrorConst, data?: any }> 
    {
        if (mailDataList && mailDataList.length > 0)
        {
            let sql = DBUtil.createInsertList("cy_mail", mailDataList);
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

    /**查找角色信息 */
    public static searchRoleInfo(roleData: any): Promise<{ code: ErrorConst, rows?: any }> {
        let sql = DBUtil.createSelect("cy_role", ['*'], roleData);
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

    /**查找角色信息 */
    // public static searchYBRecordByRoleid(search:string): Promise<{ code: ErrorConst, rows?: any }> {
    //     let sql = DBUtil.createSelect("cy_record_yuanbao", ["*"], search);
    //     return new Promise((resolve) => {
    //         DB.query(sql, (error: any, result: any) => {
    //             if (error) {
    //                 resolve({ code: ErrorConst.FAILED });
    //                 return;
    //             }
    //             resolve({ code: ErrorConst.SUCCEED, rows: result });
    //         });
    //     });
    // }

    /**查找数据库 */
    public static searchServerPay(): Promise<{ code: ErrorConst, rows?: any }> {
        let sql = DBUtil.createSelect("cy_pay", ['*'], []);
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

    /**查找通知 */
    public static searchNoticeInfo(): Promise<{ code: ErrorConst, rows?: any }> {
        //    let condiObj: {  type?: number} = {};
        //    condiObj.type = 2;
        let sql = DBUtil.createSelect("cy_notice", ['*'], []);
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
}