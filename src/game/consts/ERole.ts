/**属性定义 */
export enum EAttrType {
    /**最大生命值 */
    HP = 1, // 
    /**最大魔法值 */
    MP = 2,
    /**攻击 */
    ZS = 3,
    /**魔法 */
    FS = 4,
    /**道术 */
    DS = 5,
    /**防御 */
    AC = 6,
    /**攻速 */
    ATK_SPD = 7,
    /**幸运 */
    LUCKY = 8,
    /**固伤 */
    FIXED_DAMAGE = 9,
    /**固防 */
    FIXED_AC = 10,
    /**命中 */
    HIT = 11,
    /**闪避 */
    EVADE = 12,
    /**暴击 */
    CRITICAL = 13,
    /**韧性 */
    TENACITY = 14,
    /**吸血 */
    ABSORB_HP = 15,
    /**吸蓝 */
    ABSORB_MP = 16,
    /**生命增幅 */
    MAX_HP_RATE = 17,
    /**魔法增幅 */
    MAX_MP_RATE = 18,
    /**穿戴等级 */
    ADD_LEVEL = 19,
    /**经验加成 */
    ADD_EXP = 20,
    /**金币加成 */
    ADD_GOLD = 21,
    /**极品掉率 */
    DROP_BEST = 22,
    /**装备掉率 */
    ADD_DROP = 23,
    /**伤害增幅 */
    ADD_DAMAGE = 24,
    /**伤害减免 */
    ADD_AC = 25,
    /**暴击增幅 */
    CRT_DAMAGE = 26,
    /**全技能+1 */
    SKILL_ALL = 27,

    /**基本剑法 */
    SKILL_JIBEN = 28,
    /**攻杀剑法 */
    SKILL_GONGSHA = 29,
    /**刺杀剑法 */
    SKILL_CISHA = 30,
    /**半月弯刀 */
    SKILL_BANYUE = 31,
    /**野蛮冲撞 */
    SKILL_YEMAN = 32,
    /**真气护体 */
    SKILL_ZHENQI = 33,
    /**烈火剑法 */
    SKILL_LIEHUO = 34,
    /**火球术 */
    SKILL_HUOQIU = 35,
    /**雷电术 */
    SKILL_LEIDIAN = 36,
    /**火墙 */
    SKILL_HUOQIANG = 37,
    /**诱惑之光 */
    SKILL_YOUHUO = 38,
    /**魔法盾 */
    SKILL_MOFADUN = 39,
    /**法术精通 */
    SKILL_FASHU = 40,
    /**冰咆哮 */
    SKILL_BINGPAOXIAO = 41,
    /**精神战力法 */
    SKILL_JINGSHEN = 42,
    /**治愈术 */
    SKILL_ZHIYU = 43,
    /**灵魂火符 */
    SKILL_LINGHUN = 44,
    /**施毒术 */
    SKILL_SHIDU = 45,
    /**召唤术 */
    SKILL_ZHAOHUAN = 46,
    /**神圣战甲术 */
    SKILL_SHENSHENG = 47,
    /**无极真气 */
    SKILL_WUJI = 48,

    /**最小攻击力 */
    MIN_ZS = 1001,
    /**最大攻击力 */
    MAX_ZS = 1002,
    /**最小防御 */
    MIN_AC = 1003,
    /**最大防御 */
    MAX_AC = 1004,
    /**最小道术 */
    MIN_DS = 1005,
    /**最大道术 */
    MAX_DS = 1006,
    /**最小法术 */
    MIN_FS = 1007,
    /**最大法术 */
    MAX_FS = 1008,
    /**战斗生命值 */
    BAT_HP = 1009,
    /**战斗魔法值 */
    BAT_MP = 1010,
    /**护盾 */
    SHILED = 1011,
}

/**属性类型 */
export enum EAttrCalType {
    /**增肌数值 */
    ADD_NUM = 1,
    /**增加百分比 */
    ADD_PERCENT = 2,
    /**百分比 */
    PERCENT = 3
}

/**词缀类型 */
export enum ECiZhuiType {
    /**基本词缀 */
    NORMAL = 1,
    /**珍贵 */
    HIGN = 2,
    /**稀有 */
    SPECIAL = 3
}

/**技能类型 */
export enum ESkillType {
    /**普通攻击 */
    NormalAtkSkill = 1001,
};

/**职业类型 */
export enum EProfessionType {
    /**未知 */
    UNKNOW = 0,
    /**战士 */
    ZHANSHI = 1,
    /**法师 */
    FASHI = 2,
    /**道士 */
    DAOSHI = 3,
};

/**邮件状态 */
export enum EMailState {
    /**已删除 */
    NEW = 0,
    /**未领取 */
    READ = 1,
    /**已领取 */
    GET = 2,
    /**　已删除 */
    DEL = 3
}

/**装备位置 */
export enum EEquipPos {
    UNKNOW = 1,
    USE = 2,
    BAG = 3,
    BANK = 4,
}

/**装备部位 */
export enum EEQuipPart {
    none = -1,
    /**武器 */
    weapon = 5,
    /**衣服 */
    clothes = 10,
    /**头盔 */
    helmet = 15,
    /**项链 */
    necklace = 20,
    /**手镯1 */
    bracelet1 = 24,
    /**手镯2 */
    bracelet2 = 25,
    /**戒指1 */
    ring1 = 22,
    /**戒指2 */
    ring2 = 23,
    /**腰带 */
    belt = 64,
    /**鞋子 */
    shoes = 62
}

/**技能Id */
export const enum ESkillId {
    /**战士 - 普攻 */
    skill_1999 = 1999,
    /**战士 - 基本剑术 */
    skill_1001 = 1001,
    /**战士 - 攻杀剑术 */
    skill_1002 = 1002,
    /**战士 - 刺杀剑术 */
    skill_1003 = 1003,
    /**战士 - 半月弯刀 */
    skill_1004 = 1004,
    /**战士 - 野蛮冲撞 */
    skill_1005 = 1005,
    /**战士 - 真气护体 */
    skill_1006 = 1006,
    /**战士 - 烈火剑法 */
    skill_1007 = 1007,
    /**法师 - 普攻 */
    skill_2999 = 2999,
    /**法师 - 火球术 */
    skill_2001 = 2001,
    /**法师 - 雷电术 */
    skill_2002 = 2002,
    /**法师 - 火墙 */
    skill_2003 = 2003,
    /**法师 - 诱惑之光 */
    skill_2004 = 2004,
    /**法师 - 魔法盾 */
    skill_2005 = 2005,
    /**法师 - 法术精通 */
    skill_2006 = 2006,
    /**法师 - 冰咆哮 */
    skill_2007 = 2007,
    /**道士 - 普攻 */
    skill_3999 = 3999,
    /**道士 - 精神力战法 */
    skill_3001 = 3001,
    /**道士 - 治疗术 */
    skill_3002 = 3002,
    /**道士 - 灵魂火符 */
    skill_3003 = 3003,
    /**道士 - 施毒术 */
    skill_3004 = 3004,
    /**道士 - 召唤术 */
    skill_3005 = 3005,
    /**道士 - 隐身术 */
    skill_3006 = 3006,
    /**道士 - 神圣战甲术 */
    skill_3007 = 3007,
    /**道士 - 无极真气 */
    skill_3008 = 3008,
}

/**特权类型 */
export enum ePrerogativeType {
    /**战神 */
    zhanshen = "zhanshen",
    /**回收 */
    huishou = "huishou",
    /**免广告 */
    mianguanggao = "mianguanggao",
    /**托管 */
    tuoguan = "tuoguan"
}

/**特权卡时间 */
export const enum ePrerogativeTime {
    /**7天 */
    seven = "seven",
    /**30天 */
    month = "month",
    /**90天 */
    month_3 = "month_3",
    /**永久 */
    yongjiu = "yongjiu"
}

/**金币配置 */
export var COINAWARDS = [
    { lv: 30, cost: 25, coin: 50000 },
    { lv: 40, cost: 40, coin: 80000 },
    { lv: 60, cost: 50, coin: 100000 },
    { lv: 70, cost: 60, coin: 120000 },
    { lv: 80, cost: 75, coin: 150000 }
];