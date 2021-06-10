import { AttachAttrCFG } from './AttachAttrCFG';
/** 图鉴 */
export interface JingmaiXueweiCFG extends AttachAttrCFG {
    /** Key */
    readonly key: number;
    /** ID */
    readonly id: number;
    /** 经脉ID */
    readonly jmid: number;
    /** 开启等级 */
    readonly needlvl:number;
    /** 经肪名称 */
    readonly jmname: string;
    /** 穴位ID */
    readonly xwid: number;
    /** 穴位名称 */
    readonly name: string;
    /** 阶级 */
    readonly lvl: number;
    /** 消耗物品 */
    readonly costitem: number[];
    /** 消耗金币 */
    readonly costgold: number[];
    /** 成功率 */
    readonly rate: number;
}