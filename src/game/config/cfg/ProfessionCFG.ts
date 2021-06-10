/**职业配置 */
export interface IProfessionCFG {
    /**职业编号 */
    readonly id: number;
    /**职业名字 */
    readonly name: string;
    /**图标 */
    readonly icon: string;
    /**职业提示 */
    readonly tips: string;
    /**是否英雄职业 */
    readonly ishero: boolean;
    /**开放状态1、开放中2、未开放3、制作中 */
    readonly unlock: number;
    /**初始等级 */
    readonly level: number;
    /**生命 */
    readonly hp: number;
    /**生命成长 */
    readonly g_hp: number;
    /**法力 */
    readonly mp: number;
    /**法力成长 */
    readonly g_mp: number;
    /**最小攻击 */
    readonly minzs: number;
    /**最小攻击成长 */
    readonly g_minzs: number;
    /**最大攻击 */
    readonly maxzs: number;
    /**最大攻击加成 */
    readonly g_maxzs: number;
    /**最小法攻 */
    readonly minfs: number;
    /**最小法攻加成 */
    readonly g_minfs: number;
    /**最大法攻 */
    readonly maxfs: number;
    /**最大法攻加成 */
    readonly g_maxfs: number;
    /**最小术攻 */
    readonly minds: number;
    /**最小术攻加成 */
    readonly g_minds: number;
    /**最大术攻 */
    readonly maxds: number;
    /**最大术攻加成 */
    readonly g_maxds: number;
    /**最小防御 */
    readonly minac: number;
    /**最小防御 */
    readonly g_minac: number;
    /**最大防御 */
    readonly maxac: number;
    /**最大防御加成 */
    readonly g_maxac: number;
    /**攻击速度 */
    readonly atkspeed: number;
    /**人物行走等待 */
    readonly walkwait: number;
    /**普攻 */
    readonly skill: number;
    /**职业技能 */
    readonly skillid: number[];
    /**出身地图 */
    readonly mapid: number;
    /**初始道具 */
    readonly items: [],
    /**职业描述 */
    readonly describe: string;
}