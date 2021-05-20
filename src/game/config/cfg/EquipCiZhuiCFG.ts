/**词缀 */
export interface IEquipCiZhuiCFG {
    /**词缀编号 */
    readonly id: number;
    /**词缀名 */
    readonly name: string;
    /**词缀属性 */
    readonly attrtype: number;
    /**品质 */
    readonly quality: number;
    /**随机概率 */
    readonly gailv: number;
    /**等级 */
    readonly lvl: number;
    /**装备独有 */
    readonly position: number[];
    /**职业限制 */
    readonly profession: number;
    /**同一件装备出现最大条数 */
    readonly maxnum: number;
    /**词缀最大随机值 */
    readonly maxvalue: number;
    /**类型 */
    readonly vtype: number;
}