import ChongzhiConfig from "../config/ChongzhiConfig";
import { EItemKey } from "../consts/EItem";
import { ErrorConst } from "../consts/ErrorConst";
import DataUtil from "../gear/DataUtil";
import DB from "../utils/DB";

export default class PayRecord
{
    public cp_order_no:number;
    public order_no:string;
    public server_id:number;
    public role_id:number;
    public product_id:number;
    public product_name:string;
    public money:number;
    /** 订单状态  0：未完成   1：已完成  */
    public create_date:Date;
    public finish_date:number;

    public init1(orderId:number, serverId:number, roleId:number, productId:number):void
    {
        this.cp_order_no = orderId;
        this.server_id = serverId;
        this.role_id = roleId;
        this.product_id = productId;

        let chongzhiCfg = ChongzhiConfig.instance.getRecordById(productId);
        this.product_name = chongzhiCfg.name;
        this.money = chongzhiCfg.rmb;
        this.create_date = new Date();
        this.finish_date = null;
    }

    public getRewardObj(callback:(code:ErrorConst, rewards:{itemId:number, count:number, quality:number}[])=>void):void
    {
        DB.getRoleInfoByRoleId(this.role_id, ["role_id", "server_id", "role_name", "pay", "payshouchong"], (err, rows)=>
        {
            if (err)
            {
                callback(ErrorConst.DB_ERROR, null);

                return;
            }
            let record = rows[0];
            let payshouchonglist = record?.["payshouchong"] || [];

            let result:{itemId:number, count:number, quality:number}[]= [];
            let shouchongset:Set<number> = new Set(payshouchonglist);
            
            let chongzhiCfg = ChongzhiConfig.instance.getRecordById(this.product_id);
            if (chongzhiCfg.type == 1)
            {
                if (shouchongset.has(this.product_id))
                {
                    if (chongzhiCfg.yuanbao2)
                    {
                        result.push({itemId:EItemKey.itemid_103037, count:chongzhiCfg.yuanbao2, quality:0});
                    }
                }
                else
                {
                    if (chongzhiCfg.yuanbao)
                    {
                        result.push({itemId:EItemKey.itemid_103037, count:chongzhiCfg.yuanbao, quality:0});
                    }
                }

                shouchongset.add(this.product_id);
                DB.updateRoleAttr(this.role_id, ["payshouchong"], [DataUtil.toJson([...shouchongset.values()])]);
            }

            let rewards = chongzhiCfg.item1;
            if (rewards)
            {
                for (let i:number = 0; i < rewards.length; i+= 2)
                {
                    let obj = {itemId:rewards[i], count:rewards[i + 1], quality:1};
                    result.push(obj);
                }
            }
    
            if (chongzhiCfg.gold)
            {
                // 金币
                result.push({itemId:EItemKey.itemid_103035, count:chongzhiCfg.gold, quality:1});
            }

            callback(ErrorConst.SUCCEED, result);
        });
    }
}