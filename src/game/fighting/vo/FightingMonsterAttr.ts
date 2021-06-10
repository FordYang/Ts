import MonsterConfig from "../../config/MonsterConfig";
import FightingAnimalEntity from "../entity/FightingAnimalEntity";
import FightingAnimalAttr from "./FightingAnimalAttr";

export default class FightingMonsterAttr extends FightingAnimalAttr {
    /** 怪物ID */
    public monsterId: number = 0;

    /** 品质 */
    public quality: number = 0;

    constructor() {
        super();

    }

    public setMonsterID(monsterId: number, quality: number): void {
        this.teamId = 0;

        this.monsterId = monsterId;
        this.quality = quality;

        let monsterCfg = MonsterConfig.instance.getMonsterCfgById(monsterId);

        this.skillIdList = Array.isArray(monsterCfg.skilllist) ? monsterCfg.skilllist : [4001];

        this.name = monsterCfg.name;
        this.level = monsterCfg.lvl;
        this.exp = monsterCfg.exp * (monsterCfg.boss ? 1 : (MonsterConfig.MONSTER_QUALITY_EXP[quality - 1] ?? 1));

        this.atkSpeed = monsterCfg.attack_spd;

        let tmpHp = monsterCfg.hp * (monsterCfg.boss ? 1 : (MonsterConfig.MONSTER_QUALITY_HP[quality - 1] ?? 1));
        this.hp = this.maxhp = tmpHp;
        this.minac = this.maxac = monsterCfg.ac;
        this.minzs = this.minact = monsterCfg.zs * (monsterCfg.boss ? 1 : (MonsterConfig.MONSTER_QUALITY_ATTACK[quality - 1] ?? 1));
        this.maxzs = this.maxact = monsterCfg.zs2 * (monsterCfg.boss ? 1 : (MonsterConfig.MONSTER_QUALITY_ATTACK[quality - 1] ?? 1));
        this.fixeddamage = monsterCfg.fixeddamage * (monsterCfg.boss ? 1 : (MonsterConfig.MONSTER_QUALITY_FIXED_DAMAGE[quality - 1] ?? 1));
        this.fixedac = monsterCfg.fixedac;
        this.hit = monsterCfg.hit + 90;
        this.evade = monsterCfg.evade;
        this.critical = monsterCfg.critical;
        this.tenacity = monsterCfg.tenacity;
    }
}