export default interface DropCFG
{
    /**掉落编号 */
    readonly id: number;
    /**名称 */
    readonly name: string;
    /**检索次数，决定掉几个装备的可能 */
    readonly picks: number;
    /**不掉任何物品概率 */
    nodrop: number;
    /**金币掉落上下浮动20% */
    gold: number;
    /**金币掉落概率比重 */
    prob: number;
    /**武器 */
    item1: [];
    /**武器比重 */
    prob1: number;
    /**武器品质 */
    gailv1: [];
    /**装备 */
    item2: [];
    /**装备比重 */
    prob2: number;
    /**装备品质 */
    gailv2: [];
    /**药水 */
    item3: [];
    /**药水比重 */
    prob3: number;
    /**书籍 */
    item4: [];
    /**书籍比重 */
    prob4: number;
    /**杂物 */
    item5: [];
    /**杂物比重 */
    prob5: number;
    /**其他 */
    item6: [];
    /**其他比重 */
    prob6: number;

    //-------------------------------------------------------------------------------------------
    mTotalProb:number;
}