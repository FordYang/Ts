/**任务 */
export interface ITaskCFG {
    /**任务id */
    readonly id: number;
    /**任务icon */
    readonly icon: string;
    /**任务名称 */
    readonly name: string;
    /**任务描述 */
    readonly describe: string;
    /**奖励 */
    readonly reward: number[];
    /**任务目标类型 */
    readonly type: number;
    /**参数1 */
    readonly parameter1: number;
    /**参数2 */
    readonly parameter2: number;
}