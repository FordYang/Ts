/**受击原因 */
export const enum EFightingHurtType {
    /** 普通  */
    NORMAL = 0,
    /** Buff流血或加血 */
    BUFF = 1,
    /** 释法给自己，回血 */
    HEAL = 2,
    /** 吸血 */
    XIXIE = 3,
    /** 暴击 */
    BAO_JI = 4,
    /** 闪避 */
    SHAN_BI = 5,
    /** 减伤 */
    JIAN_SHANG = 6,
    /** 幸运一击 */
    LUCKY = 7,
    /** 被动，二次伤害 */
    TWO_HURT = 8,
    /**宠物攻击 */
    PET_ATK = 9,
    /** 吃药 */
    TAKE = 10,
    /** 流血 */
    LIU_XIE = 11,
    /** 中毒 */
    ZHONG_DU = 12,
    /** 灼烧 */
    ZHUO_SHAO = 13,
    /** 复活无敌 */
    INVINCIBLE = 14,
}