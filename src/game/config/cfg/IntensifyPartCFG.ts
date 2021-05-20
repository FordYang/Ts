/**强化部位 */
export interface IIntensifyPartCFG {
    /**强化部位 */
    readonly id: number;
    /**强化消耗 */
    readonly name: number;
    /**生命加成 */
    readonly hp: number;
    /**最小物防 */
    readonly minac: number;
    /**最大物防 */
    readonly maxac: number;
    /**最小攻击 */
    readonly minatk: number;
    /**最大攻击 */
    readonly maxatk: number;
}