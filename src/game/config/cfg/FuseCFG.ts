/**融合 */
export interface IFuseCFG {
    /**融合id */
    readonly id: number;
    /**类型 */
    readonly type: number;
    /**职业 */
    readonly title2: number;
    /**合成物品Id */
    readonly itemid: number;
    /**消耗 */
    readonly costgold: number;
    /**消耗材料1 */
    readonly needitem1: number[];
    /**消耗材料2 */
    readonly needitem2: number[];
}