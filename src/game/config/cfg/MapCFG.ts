export default class MapCFG
{
    /**地图编号 */
    readonly id: number;
    /**名字 */
    readonly name: string;
    /**地图icon */
    readonly icon: string;
    /**地图类型战斗/中立 */
    readonly type: number;
    /**战斗力限制 */
    readonly limitpower: number;
    /**场景中怪物 */
    readonly monster: [];
    /**最大怪物刷新数量 */
    readonly maxmonsters: number;
    /**怪物品质概率 */
    readonly quality:number[];
    /**boss的id */
    readonly boss: number;
    /**boss重生时间 */
    readonly reborn: number;
    /**重生地图 */
    readonly rebornmap: number;
    /**路线 */
    readonly jiugongge: [];
    /**地图描述 */
    readonly introduce: string;
    /**地图等级 */
    readonly level: number;
    /**怪物信息 */
    readonly desc2: string;
    /**推荐防御 */
    readonly fdesc: string;
    /**推荐固减 */
    readonly pdesc: string;
    /**掉落信息1 */
    readonly dropdesc1: string;
    /**掉落信息2 */
    readonly dropdesc2: string;
    /**掉落信息3 */
    readonly dropdesc3: string;

    /** 地图大小【0:行, 1:列】 */
    readonly size:number[];

    //---------------------------------------------------------------
    /** 总概率 */
    mMonsterTotalRate:number;
}