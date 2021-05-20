export default class PlayerEvent 
{
    /**　主角战斗属性变化 */
    public static HERO_FIGHT_ATTR_CHANGE: string = "hero_fight_attr_change";

    /** 等级变化  */
    public static HERO_LEVEL_CHANGE: string = "HERO_LEVEL_CHANGE";
    /** 技能变化 */
    public static HERO_SKILL_CHANGE: string = "HERO_SKILL_CHANGE";
    /** 金币变化 */
    public static HERO_COIN_CHANGE: string = "HERO_COIN_CHANGE";
    /** 元宝变化 */
    public static HERO_YUANBAO_CHANGE: string = "HERO_YUANBAO_CHANGE";
    /** 战斗力变化 */
    public static HERO_POWER_CHANGE: string = "HERO_POWER_CHANGE";
    /** 图鉴变化 */
    public static HERO_TUJIAN_CHANGE: string = "HERO_TUJIAN_CHANGE";
    /** 精脉变化 */
    public static HERO_JING_MAI_CHANGE:string = "HERO_JING_MAI_CHANGE";

    /** 使用道具 */
    public static HERO_USE_ITEM:string = "HERO_USE_ITEM";

    /** 强化成功 */
    public static HERO_INTENSIFY_CHANGE:string = "HERO_INTENSIFY_CHANGE";

    /** 洗练 */
    public static HERO_XI_LIAN_CHANGE:string = 'HERO_XI_LIAN_CHANGE';

    /** 切换地图 */
    public static readonly HERO_MAP_CHANGE = "HERO_MAP_CHANGE";

    /** 穿装备 */
    public static readonly HERO_EQUIP_PUT = 'HERO_EQUIP_PUT';
    /** 脱装备 */
    public static readonly HERO_EQUIP_TAKE = 'HERO_EQUIP_TAKE';

    /** 回收道具 */
    public static readonly HERO_ITEM_RECYCLE = 'HERO_ITEM_RECYCLE';
    /** 获取 道具 */
    public static readonly HERO_GET_ITEM = 'HERO_GET_ITEM';

    /** 打开面板 */
    public static readonly OPEN_UI = 'PlayerEvent_OpenUi';

    /** Boss复活 */
    public static FIGHTING_BOSS_REVIVE: string = "FIGHTING_BOSS_REVIVE";
    public static FIGHTING_BOSS_DIE: string = "FIGHTING_BOSS_DIE";
    public static FIGHTING_HERO_DIE: string = "FIGHTING_HERO_DIE";

    public static FIGHTING_PK_OVER:string = "FIGHTING_PK_OVER";

    /** 战斗中杀死怪 */
    public static FIGHTING_KILL_MONSTER:string = 'FIGHTING_KILL_MONSTER';
}