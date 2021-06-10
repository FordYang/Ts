/**充值 */
export default interface ChongzhiCFG {
    /**标识 */
    readonly id: number;
    /**类型 */
    readonly type: number;
    /**礼包名称 */
    readonly name: string;
    /**消耗金额 */
    readonly rmb: number;
    /**原价 */
    readonly brmb: number;
    /**首次充值奖励 */
    readonly yuanbao: number;
    /**非首次充值 */
    readonly yuanbao2: number;
    /**获得金币 */
    readonly gold: number;
    /**物品1 */
    readonly item1: number[];
    /**礼包类型 1 金币 2 洗练石 3 书页 */
    readonly type2: number;
    /**消耗组 */
    readonly group: number;
    /**限购 */
    readonly maxnum: number;
    /**描述 */
    readonly describe: string;
    /**描述2 */
    readonly describe2: string;
}