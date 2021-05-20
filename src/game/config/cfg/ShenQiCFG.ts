import { AttachAttrCFG } from "./AttachAttrCFG";

export interface ShenQiCFG extends AttachAttrCFG
{
    id:number;

    name:string;
    /** 神器等级 */
    lvl:number;
    /** 阶级 */
    jieji:number;
    /** 升级需要等级 */
    needvalue:number;
    /** 消耗纯度 */
    costmineral:number;
    /** 消耗金币 */
    costgold:number;
    /** 神兵技能 */
    skill:number;
    /** 升级技能消耗 */
    needvalue2:number[];
}