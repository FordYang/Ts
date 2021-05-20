export interface AttachAttrCFG {
    /** 生命值  */
    readonly hp: number;
    /** 魔法值 */
    readonly mp: number;
    /** 最小物防 */
    readonly minac: number;
    /** 最大物防 */
    readonly maxac: number;
    /** 最小攻击 */
    readonly minzs: number;
    /** 最大攻击 */
    readonly maxzs: number;
    /** 最大魔攻 */
    readonly maxfs: number;
    /** 最小魔攻 */
    readonly minfs: number;
    /** "最小道术" */
    readonly minds: number;
    /** 最大道术 */
    readonly maxds: number;
    /** 固伤 */
    readonly fixeddamage: number;
    /** 固防 */
    readonly fixedac: number;
    /** 命中率 */
    readonly hit: number;
    /** 闪避 */
    readonly evade: number;
    /** 暴击 */
    readonly critical: number;
    /** 韧性 */
    readonly tenacity: number;
    /** 攻速 */
    readonly atkspeed:number;
}