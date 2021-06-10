import ChongzhiConfig from "../config/ChongzhiConfig";
import { ErrorConst } from "../consts/ErrorConst";
import PayRecord from "../dbrecord/PayRecord";
import Logger from "../gear/Logger";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import DB from "../utils/DB";
import MailMgr from "./MailMgr";

export default class PayMgr {
    public static readonly instance: PayMgr = new PayMgr();

    //--------------------------------------------------------------------------------------

    /* 获取随机的20位的订单号 */
    getRandomOrderid20() {
        let second = Date.now();
        let random = Math.floor(900000 * Math.random()) + 100000;
        let orderid = 'E' + second + '' + random;
        return orderid;
    }

    getAgentOrderid20() {
        let second = Date.now();
        let random = Math.floor(900000 * Math.random()) + 100000;
        let orderid = 'A' + second + '' + random;
        return orderid;
    }

    /** 充值成功 */
    public payOk(cpOrderNo: number, orderNo: string, amount: number, callback: (code: ErrorConst, msg: string) => void): void {
        DB.getPayRecordByOrder(cpOrderNo, (err, rows) => {
            if (err) {
                callback(ErrorConst.DB_ERROR, "数据库错误");
                return;
            }

            if (rows.length > 0) {
                let record: PayRecord = new PayRecord();
                Object.assign(record, rows[0]);

                if (record.money != amount)
                {
                    callback(ErrorConst.FAILED, "充值金额不对");
                    return;
                }

                let st = new Date(record.create_date);
                // if (Date.now() - st.getTime() > 300000)
                // {
                //     callback(ErrorConst.PAY_ORDER_PAST);
                //     return;
                // }
                // else 
                if (record.finish_date) {
                    callback(ErrorConst.PAY_ORDER_PAST, "订单已支付");
                    return;
                }
                else {
                    DB.updateFiexd("cy_pay", ["order_no", "finish_date"], { cp_order_no: cpOrderNo }, [orderNo, new Date()]).then((result) => {
                        if (result.code == ErrorConst.SUCCEED) {
                            // 下发奖励
                            Logger.log("充值成功，下发奖励。");

                            DB.updateRoleAttr(record.role_id, ["is_pay"], [true]);

                            let player = PlayerMgr.shared.getPlayerByRoleId(record.role_id);
                            if (player) {
                                let chongzhiCfg = ChongzhiConfig.instance.getRecordById(record.product_id);
                                if (chongzhiCfg.type == 1) {
                                    player.payEntity.setShouChongState(1);
                                }

                                player.payOk(record);

                                callback(ErrorConst.SUCCEED, "在线发放成功成功");
                                return;
                            }
                            else {
                                // 邮件发
                                record.getRewardObj((code: ErrorConst, rewards) => {
                                    if (code == ErrorConst.SUCCEED) {

                                        MailMgr.instance.sendSysMail(record.role_id, "充值奖励", "充值奖励", rewards);
                                        callback(ErrorConst.SUCCEED, "邮件发送成功");

                                        return;
                                    }
                                    else {
                                        callback(code, "离线玩家充值信息写入失败");
                                        return;
                                    }
                                });
                            }
                        }
                        else {
                            callback(result.code, "支付定单写入失败");
                            return;
                        }
                    })
                }
            }
            else {
                callback(ErrorConst.PAY_ORDER_NOT_EXIST, "未找到充值定单号：" + cpOrderNo + "/" + orderNo);
                return;
            }
        });
    }
}