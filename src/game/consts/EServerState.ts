/**服务器状态 */
export enum EServerState {
    /** // 流畅 */
    lower = 1,
    /** // 拥堵 */
    high = 2,
    /**  // 关闭 */
    close = 3,
}