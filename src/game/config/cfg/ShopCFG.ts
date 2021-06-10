/**商店 */
export interface IShopCFG {
    /**商店id */
    readonly id: number;
    /**名称 */
    readonly name: string;
    /**物品名称 */
    readonly items: number;
    /**单次贩卖数量 */
    readonly oncenum: number;
    /**货币类型 1金币 2元宝 3充值兑换：填物品id */
    readonly currencytype: number;
    /**原始价格 */
    readonly price: number;
    /**折扣 */
    readonly offprice: number;
    /**打折标签 */
    readonly slabel: number;
    /**每日限购 */
    readonly maxnum: number;
    /** 职业限制  */
    readonly profession:number;
    /** 等级限制 */
    readonly lve:number;
}