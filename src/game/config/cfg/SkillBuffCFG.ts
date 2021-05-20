export default interface SkillBuffCFG
{
    /**buff编号 */
    readonly id: number;
    /**名称 */
    readonly name: string;
    /**buff图标 */
    readonly icon: string;
    /**是否显示 */
    readonly isshow: boolean;
    /**增益类型 1增益 2负面 */
    readonly bufftype: number;
    /**添加buff 成功概率 不填就是100% */
    readonly probability: number;
    /**持续时间/秒 不填的话就是无限 */
    readonly duration: number;
    /**触发间隔秒 */
    readonly interval: number;
    /**离线是否计时 */
    readonly offline: boolean;
    /**buff组相同的组高级顶掉低级 */
    readonly groupid: number;
    /**层级 */
    readonly level: number;
    /**是否叠加 */
    readonly isoverlay: boolean;
    /**最大叠加层数 */
    readonly maxlayers: number;
    /**生命百分比回复/掉血 */
    readonly hppercent: number;
    /**生命值 */
    readonly hp: number;
    /**特殊附加：1攻击 2魔力 3道术 4防御，后面为 % */
    readonly special:number[];
    /**法力值 */
    readonly mp: number;
    /**法力值上限 */
    readonly maxmp: number;
    /**生命吸取 */
    readonly addhp: number;
    /**生命吸取% */
    readonly lifedraw: number;
    /**法力吸取 */
    readonly addmp: number;
    /**生命值上限 */
    readonly maxhp: number;
    /**战士 - 攻击 */
    readonly zs: number;
    /**法师 - 魔法 */
    readonly fs: number;
    /**道士 - 道术 */
    readonly ds: number;
    /**防御 */
    readonly ac: number;
    /**生命值上限 */
    readonly maxhp2: number;
    /**法力值上限 */
    readonly maxmp2: number;
    /**战士 - 攻击% */
    readonly zs2: number;
    /**法师 - 魔法% */
    readonly fs2: number;
    /**道士 - 道术% */
    readonly ds2: number;
    /**攻击速度% */
    readonly atkspped: number;
    /**防御% */
    readonly ac2: number;
    /** 受到伤害 */
    readonly Injuryfree: number;
    /** 伤害增幅 */
    readonly Injuryincrease: number;
    /**经验增幅 */
    readonly exp2: number;
    /**护盾 */
    readonly shiled: number;
    /**技能效果 */
    readonly effect: string;
    /** 闪避 */
    readonly dodge:number;
    /** 状态 0：无 1：眩晕  2：定身 */
    readonly state:number;
}