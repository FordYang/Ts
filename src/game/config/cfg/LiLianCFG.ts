/**历练 */
export interface ILiLianCFG {
    /**id */
    readonly id: number;
    /**章节 */
    readonly headline: string;
    /**底板背景 */
    readonly bg_img: string;
    /**标题 */
    readonly title: string;
    /**章节描述 */
    readonly describe: string;
    /**是否解锁 */
    readonly unlock: boolean;
    /**推荐等级 */
    readonly lvl: string;
    /**章节的最后任务 */
    readonly endtask: number;
    /**子任务 */
    readonly task: number[];
}