import { JingmaiXueweiCFG } from "./JingmaiXueweiCFG";

/** 图鉴 */
export interface JingmaiCFG 
{
    /** 经脉ID */
    readonly jmid: number;
    /** 经肪名称 */
    readonly jmname: string;
    /** 穴位列表 */
    readonly xueweiList:JingmaiXueweiCFG[];
}