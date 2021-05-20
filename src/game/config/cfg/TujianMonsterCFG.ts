import { AttachAttrCFG } from './AttachAttrCFG';
/** 图鉴 */
export interface TujianMonsterCFG extends AttachAttrCFG {
    /** Key */
    readonly key: number;
    /** ID */
    readonly id: number;
    /** 地图ID */
    readonly mapid: number;
    /** 地图分类 */
    readonly mapname: string;
    /** 怪物ID */
    readonly monster: number;
    /** 怪物名称 */
    readonly name: string;
    /** 白，绿，蓝，紫，橙，红 */
    readonly lvl: number;
    /** 升级条件 */
    readonly killnum: number;
    /** 积分 */
    readonly integral: number;
    /** 奖励物品数量  */
    readonly reward: number[];
    /** 描述 */
    readonly describe: string;
}