/**地图信息配置 */
export interface IMapInfoCFG {
    /**地图编号 */
    id: number;
    /**名字 */
    name: string;
    /**目标所在点 */
    point: number;
    /**地图icon */
    icon: string;
    /**用来传送用的 */
    mapid: number;
    /**地图类型 1城镇 2野外 3副本 4boss 5传送点 */
    type: number;
    /**推荐等级 */
    level: string;
    /**推荐战力 */
    limitpower: number;
    /**怪物信息 */
    monsterdesc: string;
    /**掉落信息 */
    dropdesc: string;
    /**地图介绍 */
    mapdesc: string;
}