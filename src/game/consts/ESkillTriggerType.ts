/** 触发类型 */
export enum ESkillTriggerType {
    /** 被动 */
    PASSIVE = 0,
    /** 主动 */
    ACTIVE = 1,
    /** 血量触发 */
    HP = 2,
    /** 死亡触发 */
    DEAD = 3,
    /** Buff触发 */
    BUFF = 4,
    /** 召唤 */
    SUMMON = 5,
}