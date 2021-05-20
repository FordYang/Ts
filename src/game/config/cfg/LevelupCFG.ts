/**战士配置表 */
export interface ILevelupCFG {
    /**等级 */
    readonly id: number;
    /**所需经验值 */
    readonly exp: number;
    /**离线经验4小时（240分钟） */
    readonly addexp: number;
    /**离线金币4小时 */
    readonly addgold: number;
    /**5倍领取消耗元宝4小时 */
    readonly costyuanbao: number;
}