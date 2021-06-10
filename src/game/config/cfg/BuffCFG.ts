/**buff配置 */
export interface IBUFFCFG {
    /**buff编号 */
    id: number;
    /**名称 */
    name: string;
    /**buff图标 */
    icon: string;
    /**是否显示 */
    isshow: boolean;
    /**增益类型 1增益 2负面 */
    bufftype: number;
    /**添加buff 成功概率 不填就是100% */
    probability: number;
    /**持续时间/秒 不填的话就是无限 */
    duration: number;
    /**触发间隔秒 */
    interval: number;
    /**离线是否计时 */
    offline: boolean;
    /**buff组相同的组高级顶掉低级 */
    groupid: number;
    /**层级 */
    level: number;
    /**是否叠加 */
    isoverlay: boolean;
    /**最大叠加层数 */
    maxlayers: number;
    /**生命百分比回复/掉血 */
    hppercent: number;
    /**生命值 */
    hp: number;
    /**特殊附加：1攻击 2魔力 3道术 4防御，后面为 % */
    special: Array<number>;
    /**法力值 */
    mp: number;
    /**法力值上限 */
    maxmp: number;
    /**生命吸取 */
    addhp: number;
    /**生命吸取% */
    lifedraw: number;
    /**法力吸取 */
    addmp: number;
    /**生命值上限 */
    maxhp: number;
    /**战士 - 攻击 */
    zs: number;
    /**法师 - 魔法 */
    fs: number;
    /**道士 - 道术 */
    ds: number;
    /**防御 */
    ac: number;
    /**生命值上限 */
    maxhp2: number;
    /**法力值上限 */
    maxmp2: number;
    /**战士 - 攻击% */
    zs2: number;
    /**法师 - 魔法% */
    fs2: number;
    /**道士 - 道术% */
    ds2: number;
    /**攻击速度% */
    atkspped: number;
    /**防御% */
    ac2: number;
    /**受到伤害 */
    injuryfree: number;
    /**经验增幅 */
    exp2: number;
    /**护盾 */
    shiled: number;
    /**技能效果 */
    effect: string;
}