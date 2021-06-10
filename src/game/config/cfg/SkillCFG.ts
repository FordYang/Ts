import { ESkillTarget } from "../../consts/ESkillTarget";

export default interface SkillCFG {
    /**技能编号 */
    readonly id: number;
    /**技能名称 */
    readonly name: string;
    /**技能icon */
    readonly icon: string;
    /**技能触发类型 */
    readonly triggertype: number;
    /**触发条件 */
    parameter1: number;
    /**单体/范围形状 0单体1线性2圆形3矩形 */
    readonly areashape: number;
    /**目标阵营（0自己, 1敌方, 2友军） */
    readonly targetside: ESkillTarget;
    /**范围技能中心点0自己1目标 */
    readonly areacenter: number;
    /**非矩形为半径，矩形时为宽 */
    areaarg1: number;
    /**矩形时为高 */
    readonly areaarg2: number;
    /**Ability ID 列表  如[1,2,3] */
    readonly abilityIds: Array<number>;
    /**攻击目标最大个数 */
    maxnum: number;
    /**前摇时间用来处理施法和受击的时间间隔 */
    readonly interval: number;
    /**释放特效 */
    readonly castingeffect: string;
    /**坐标偏移 */
    readonly deviation: Array<number>;
    /**释放音效 */
    readonly playsound: string;
    /**命中后，在敌人身上播放的特效 */
    readonly hiteffect: string;
    /**飞行弹道 */
    readonly flyresource: string;
    /**飞行声音 */
    readonly flysound: string;
    /**技能CD触发机制 */
    readonly cdtype: number;
    /**技能CD */
    readonly basecd: number;
    /**技能类型 0普攻 1技能 */
    readonly type: number;
    /**职业 */
    readonly job: number;
    /**等级 */
    readonly level: number;
    /**学习等级 */
    readonly slevel: number;
    /**升级所需经验值 */
    readonly exp: number;
    /**消耗书籍 */
    readonly booknum: Array<number>;
    /**消耗书页 */
    readonly pagenum: Array<number>;
    /**技能效果 */
    readonly effecttype: string;
    /**攻击距离 */
    distance: number;
    /**每次耗用魔法值 */
    readonly spell: number;
    /**触发概率 */
    readonly gailv: number;
    /**攻击方式 */
    readonly atktype: number;
    /**基本威力 */
    readonly power: number;
    /**基础攻击力加成 */
    readonly power2: number;
    /**破防% */
    readonly bac: number;
    /** 一次性回血 */
    readonly addhp:number;
    /**召唤物id */
    readonly petid: number;
    /**召唤物数量 */
    readonly petnum: number;
    /**召唤物属性加成 [血量(道术)，防御力（道术），最小攻击（道术），最大攻击（道术），固伤（玩家固伤），固防（玩家固防），命中（玩家命中），闪避（玩家闪避）、暴击（玩家暴击）、韧性（玩家韧性）] */
    readonly petaddition: number[];
    /**施法排序 */
    readonly priority: number;
    /**技能描述 */
    readonly describe: string;
    /**增加战力 */
    readonly vcombat: number;

    //--------------------------------------------------------------------------
    /** 基础ID */
    baseId:number;
}