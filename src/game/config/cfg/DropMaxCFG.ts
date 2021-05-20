/**掉落限制 */
export interface DropMaxCFG 
{
    /**掉落物品Id */
    readonly id: number;
    /**掉落物品 */
    readonly name: string;
    /**掉落限制 */
    readonly maxnum: number;
    /**掉落限制 */
    readonly maxnumtest: number;
    /**等级影响系数 */
    readonly lel: number[];
    /**上下随机浮动 */
    readonly suiji: number;
}
