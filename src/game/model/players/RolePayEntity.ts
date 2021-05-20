import GameConf from "../../../conf/GameConf";
import ChongzhiConfig from "../../config/ChongzhiConfig";
import { ERichesType } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import CyObject from "../../core/CyObject";
import GameUtil from "../../core/GameUtil";
import PayRecord from "../../dbrecord/PayRecord";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

export default class RolePayEntity extends CyObject {
    private player: Player;

    /** 首冲领取状态   0：未首充  1：首充未领取   2：已领取 */
    public shouchong: number;

    public isPay: boolean = false;

    private buyDate: string;
    /**  */
    private everyBuyMap: { [shopId_itemId: string]: number };
    private buyMap: { [shopId_itemId: string]: number };
    /** 购买的Type=1的列表ID */
    private shouchongIdSet: Set<number>;

    constructor(player: Player) {
        super();

        this.player = player;

        this.shouchongIdSet = new Set();

        this.player.on(CmdID.c2s_pay_req, this.onReqPay);
    }

    public setShouChongState(value: number): void {
        this.shouchong = value;

        DB.updateRoleAttr(this.player.roleid, ["pay"], [this.serializeDB()]);
    }

    /** 前端请求充值 */
    private onReqPay = (bodyObj: { chongzhiId: number }) => {
        let orderId = GameUtil.nextId();

        let record = new PayRecord();
        record.init1(orderId, this.player.serverid, this.player.roleid, bodyObj.chongzhiId);
        DB.insertPayOrder(record, (code) => {
            if (code == ErrorConst.SUCCEED) {
                this.player.send(CmdID.s2c_pay_req_ack, { code: ErrorConst.SUCCEED, orderId: orderId, chongzhiId: bodyObj.chongzhiId });
                // if (GameConf.isDebugPay)
                // this.payOk(record);
            }
            else {
                this.player.traceClient("订单写入错误。");
            }
        });
    }

    /** 充值成功，发奖励 */
    public payOk(payRecord: PayRecord): void {
        this.saveIsPay(true);

        let currentDate = new Date();
        let day = `${currentDate.getFullYear()}_${currentDate.getMonth()}_${currentDate.getDate()}`;

        if (this.buyDate != day) {
            this.everyBuyMap = {};
            this.buyDate = day;
        }


        let chongzhiCfg = ChongzhiConfig.instance.getRecordById(payRecord.product_id);

        if (chongzhiCfg.type === 2) {
            this.everyBuyMap["pay_" + payRecord.product_id] = (this.everyBuyMap["pay_" + payRecord.product_id] || 0) + 1;
        }
        else {
            this.buyMap["pay_" + payRecord.product_id] = (this.buyMap["pay_" + payRecord.product_id] || 0) + 1;
        }

        if (chongzhiCfg.gold) {
            this.player.addMoney(ERichesType.Money, chongzhiCfg.gold, "充值");
        }

        if (chongzhiCfg.item1) {
            if (chongzhiCfg.type == 5 && chongzhiCfg.type2 == 1) {
                /**转到下面礼包使用 */
            } else {
                let len = chongzhiCfg.item1.length;
                for (let i: number = 0; i < len; i += 2) {
                    this.player.addItem(chongzhiCfg.item1[i], chongzhiCfg.item1[i + 1], "充值", false, null, true);
                }
            }
        }

        if (chongzhiCfg.type == 1) {
            (this.shouchong === 0) && (this.shouchong = 1);
            if (this.shouchongIdSet.has(payRecord.product_id)) {
                if (chongzhiCfg.yuanbao2) {
                    this.player.addMoney(ERichesType.Yuanbao, chongzhiCfg.yuanbao2, "充值");
                }
            }
            else {
                if (chongzhiCfg.yuanbao) {
                    this.player.addMoney(ERichesType.Yuanbao, chongzhiCfg.yuanbao, "充值");
                }
            }
            this.shouchongIdSet.add(payRecord.product_id);
            DB.updateRoleAttr(this.player.roleid, ["payshouchong"], [this.serializeShouChongClient()]);
        } else if (chongzhiCfg.type == 3) {
            /**特权充值 */
            this.player.onRechargePrerogativeByMoney(chongzhiCfg);
        } else if (chongzhiCfg.type == 4) {
            if(chongzhiCfg.id == 4001){
                /**基金充值 */
                this.player.onBuyJijin();
            }else if(chongzhiCfg.id == 4002){
                /**基金充值 */
                this.player.onBagExpend(4);
            }
        } else if (chongzhiCfg.type == 5) {
            if (chongzhiCfg.type2 == 1) {
                /**直接使用礼包 */
                let len = chongzhiCfg.item1.length;
                for (let i: number = 0; i < len; i += 2) {
                    this.player.bag.useItem(chongzhiCfg.item1[i], 1);
                }
            }
            let _key = chongzhiCfg.id;
            this.player.recordZhenbaoId(_key.toString());
        }
        this.player.changeDayRechargeMap(chongzhiCfg);
        DB.updateRoleAttr(this.player.roleid, ["pay"], [this.serializeDB()]);

        this.player.send(CmdID.s2c_pay_succeed, { orderId: payRecord.cp_order_no, chongzhiId: payRecord.product_id });
    }

    private saveIsPay(isPay: boolean): void {
        if (isPay !== this.isPay) {
            this.isPay = isPay;

            this.player.send(CmdID.s2c_first_pay);
        }
    }

    //----------------------------------------------------------------------------------------------------------------
    public deserializeDB(paystr: string, shouchongstr: string, isPay: boolean): void {
        let buyObj = DataUtil.jsonBy(paystr);

        this.buyDate = buyObj?.date || 0;
        this.everyBuyMap = buyObj?.everyBuy || {};
        this.buyMap = buyObj?.buy || {};
        this.shouchong = buyObj?.shouchong ?? 0;
        this.isPay = isPay;

        let idList: number[] = DataUtil.jsonBy(shouchongstr);
        if (idList) {
            for (let id of idList) {
                this.shouchongIdSet.add(id);
            }
        }
    }

    public serializeDB(): string {
        let buyObj = { date: this.buyDate, everyBuy: this.everyBuyMap, buy: this.buyMap, shouchong: this.shouchong };
        return DataUtil.toJson(buyObj);
    }

    public serializeClient(): string {
        let buyObj = { date: this.buyDate, buy: Object.assign({}, this.everyBuyMap, this.buyMap), shouchong: this.shouchong };
        return DataUtil.toJson(buyObj);
    }

    public serializeShouChongClient(): string {
        return DataUtil.toJson([...this.shouchongIdSet.values()]);
    }

    //---------------------------------------------------------------------------------------------------------------
    protected onDestroy() {
        this.player.on(CmdID.c2s_pay_req, this.onReqPay);

        super.onDestroy();
    }
}