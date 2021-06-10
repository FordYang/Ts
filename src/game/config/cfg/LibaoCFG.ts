
/**兑换 */
export interface ILibaoCFG {
    /**礼包对应的id */
    readonly id: string;
    /**名称 */
    readonly name: string;
    /**使用等级 */
    readonly lev: number;
    /**获取金币 */
    readonly gold: number;
    /**获取元宝 */
    readonly yuanbao: number;
    /**道具1 */
    readonly item1: number;
    /**数量 */
    readonly num1: number;
    /**道具2 */
    readonly item2: number;
    /**数量 */
    readonly num2: number;
    /**道具3 */
    readonly item3: number;
    /**数量 */
    readonly num3: number;
    /**道具4 */
    readonly item4: number;
    /**数量 */
    readonly num4: number;
    /**道具5 */
    readonly item5: number;
    /**数量 */
    readonly num5: number;
}