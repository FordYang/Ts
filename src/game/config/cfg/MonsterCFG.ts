export default interface MonsterCFG
{
    /**怪物编号 */
    readonly id: number;
    /**怪物名称 */
    readonly name: string;
    /**怪物等级 */
    readonly lvl: number;
    /**是否Boss */
    readonly boss: boolean;
    /**杀死经验 */
    readonly exp: number;
    /**怪物血量 */
    readonly hp: number;
    /**物抗 */
    readonly ac: number;
    /**魔抗 */
    readonly mac: number;
    /**攻击力 */
    readonly zs: number;
    /**最大攻击力 */
    readonly zs2: number;
    /**固伤 */
    readonly fixeddamage: number;
    /**固防 */
    readonly fixedac: number;
    /**命中率 */
    readonly hit: number;
    /**闪避 */
    readonly evade: number;
    /**暴击 */
    readonly critical: number;
    /**韧性 */
    readonly tenacity: number;
    /**白色掉落 */
    readonly dorp1: [];
    /**绿色掉落 */
    readonly dorp2: [];
    /**蓝色掉落 */
    readonly dorp3: [];
    /**紫色掉落 */
    readonly dorp4: [];
    /**出生 */
    readonly sound_cre: string;
    /**攻击 */
    readonly sound_atk: string;
    /**被攻击 */
    readonly sound_hit: string;
    /**死亡 */
    readonly sound_die: string;
    /**怪物形象 */
    readonly model: string;
    /**行走等待 */
    readonly walkwait: number;
    /**怪物攻击速度 */
    readonly attack_spd: number;
    /**暂无用 */
    readonly rebirth: number;
    /** 描述 */
    readonly describe: string;
    /** 技能列表 */
    readonly skilllist:number[];
    /** 视野范围 */
    readonly viewrange:number;
}