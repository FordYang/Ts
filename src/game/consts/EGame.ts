/**财富类型 */
export enum ERichesType {
    /**金币 */
    Money = 0,
    /**元宝 */
    Yuanbao = 1
}

/**引导步骤 */
export enum eGuideStage {
    /**介绍 */
    introduce = 1001,
    /**跳转入背包 */
    jumpbag = 1002,
    /**点击武器 */
    equip_weapon = 1003,
    /**穿上武器 */
    equip_info = 1004,
    /**点击衣服 */
    equip_clothes = 1005,
    /**装备衣服 */
    clothes_info = 1006,
    /**技能书查看 */
    skill_info = 1007,
    /**技能书学习 */
    skill_learn = 1008,
    /**战斗界面 */
    jumpbattle = 1009,
    /**去野外 */
    jumpbattlemap = 1010,
    /**引导结束 */
    finish = 1011
}

/**角色类型 */
export enum ELiveingType {
    UNKOWN = 0,  // 未知 
    PLAYER = 1,  // 玩家
    NPC = 2,     // NPC
    MONSTER = 3, // 怪物
    PET = 4,     // 召唤兽
    PARTNER = 5, // 伙伴
}

/**游戏内品质 */
export enum EQuality {
    /**白色 */
    white = 1,
    /**绿色 */
    green = 2,
    /**蓝色 */
    bule = 3,
    /**紫色 */
    purple = 4,
    /**橙色 - boss*/
    orange = 5,
    /** 红色 */
    red = 6
}

/**地图类型 */
export const enum EMapType {
    /**中立区 */
    neutrally = 1,
    /**战斗区 */
    battle = 2,
    /**Boss地图 */
    bossMap = 4,
    /** PK  */
    PK = 5,
}