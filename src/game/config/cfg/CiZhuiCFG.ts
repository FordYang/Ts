/**词缀 - 属性 */
export interface ICiZhuiCFG {
    /**词缀编号 */
    readonly attrtype: number;
    /**词缀名 */
    readonly name: string;
    /**代码 */
    readonly code: string;
    /**属性等级 */
    readonly type: number;
    /**排序 */
    readonly sort: number;
    /**战力增加 */
    readonly vcombat: number;
    /**限制位置 */
    readonly position: number;
    /**正常值/百分比 */
    readonly vtype: number;
}