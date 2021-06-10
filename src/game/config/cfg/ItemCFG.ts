import { AttachAttrCFG } from "./AttachAttrCFG";

/**物品表 道具/武器*/
export interface IItemCFG extends AttachAttrCFG{
    /**物品编号 */
    readonly id: number;
    /**物品名称 */
    readonly name: string;
    /**物品种类 */
    readonly type: number;
    /**最大叠加 */
    readonly m_maxcount: number;
    /**物品类型 */
    readonly stdmode: number;
    /**物品的描述 */
    readonly descr: string;
    /**使用等级要求 */
    readonly needlevel: number;
    /**职业限制 */
    readonly profession: number;
    /**极品率 */
    readonly bestgailv: number[];
    readonly points: number[];
    /**品质 */
    readonly quality: number;
    /** "是否播报
不填就是不播报
填1-5，就是该物品品质>=1-5的时候播报"
 */
    readonly isbroadcast:number;
    /**出售金币 */
    readonly sellprice: number;
    /**出售元宝 */
    readonly sellyunabao: number;
    /**分解得到的东西 */
    readonly decompose: Array<number>;
    /**>>>>>>>>>>>>>>>>>>>>>魔抗<<<<<<<<<<<<<<<<<<< */
    readonly mac: number;
    readonly mac2: number;
    readonly mc: number;
    readonly mc2: number;
    readonly weight: number;
    readonly duramax: number;
    readonly m_bconsume: boolean
    readonly sc: number;
    readonly sc2: number;
    readonly need: number;
    readonly price: number;
    readonly icon: string;
}