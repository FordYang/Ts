export enum ENewTaskType
{
    /** 主线 */
    MAIN = 1,
    /** 支线 */
    BRANCH = 2,
    /** 日常 */
    EVERYDAY = 3,
    /** 周常 */
    WEEKLY = 4
}

export enum ENewTaskCmdID
{
    /** 提升等级  lv >= param1 */
    LEVEL = 1,
    /** 杀怪 param3 = [monsterId], param2 = count, param1 = mapid */
    KILL_MONSTER = 2,
    /** 获得物品 param1 = itemId */
    GET_ITEM = 3,
    /** 战力达到 power >= param1 */
    POWER = 5,
    /** 获得金币 coin >= param1 */
    GET_COIN = 6,
    /** 强化次数 param1 */
    INTENSIFY = 7,
    /** 学习技能 param1（不填代表学习任意技能） = skillid,  param2 = lv */
    LEARN_SKILL = 8,
    /** 幸运达到 lucky >= param1 */
    LUCKY = 9,
    /** 进行N次洗练 param1 = count */
    XI_LIAN = 11,
    /** 经脉 lv >= param1 || xueweiId >= param2 */
    JING_MAI = 13,
    /** 图鉴 monsterId = param1  quality >= param2 */
    TU_JIAN = 14,
    /** 进入地图 mapId = param1 */
    ENTER_MAP = 15,
    /** 穿戴装备个数  param1 = count */
    SLOT_COUNT = 16,
    /** 回收一次装备 param1 = count  */
    RECYCLE_COUNT = 17,
    /** 打开面板 param1 = ui_id */
    OPEN_UI = 18,
    /** 使用道具 param1 = itemId  param2 = count */
    USE_ITEM = 19,
}

export enum ENewTaskState
{
    /** 未开启 */
    NO_OPEN = 0,
    /** 进行中 */
    OPEN = 1,
    /** 已完成 */
    DONE = 2
}