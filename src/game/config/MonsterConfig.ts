import { ESettingConst } from "../consts/ESettingConst";
import MonsterCFG from "./cfg/MonsterCFG";
import { SettingConfig } from "./SettingConfig";

export default class MonsterConfig
{
    // 怪物品质属性加成
    public static get MONSTER_QUALITY_HP():number[]
    {
        return SettingConfig.instance.getSettingCFGById(ESettingConst.QUALITY_ADD_HP)?.arrayValue ?? [];
    }

    public static get MONSTER_QUALITY_ATTACK():number[]
    {
        return SettingConfig.instance.getSettingCFGById(ESettingConst.QUALITY_ADD_ATK)?.arrayValue ?? [];
    }
    public static get MONSTER_QUALITY_FIXED_DAMAGE():number[]
    {
        return SettingConfig.instance.getSettingCFGById(ESettingConst.QUALITY_ADD_FIXED_DAMAGE)?.arrayValue ?? [];
    }
    public static get MONSTER_QUALITY_EXP():number[]
    {
        return SettingConfig.instance.getSettingCFGById(ESettingConst.QUALITY_ADD_EXP)?.arrayValue ?? [];
    }


    //------------------------------------------------------------------------

    private static _instance: MonsterConfig;
    public static get instance(): MonsterConfig {
        if (!MonsterConfig._instance) {
            MonsterConfig._instance = new MonsterConfig();
        }
        return MonsterConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: MonsterCFG[];
    private _tableMap:{[monsterId:number]:MonsterCFG};

    public readonly bossCfgList:MonsterCFG[] = [];

    constructor() {

    }

    public parseJson(jsonTable: MonsterCFG[]): void 
    {
        this._table = jsonTable;
        this._tableMap = Object.create(null);

        for (let monsterCfg of this._table) {
            this._tableMap[monsterCfg.id] = monsterCfg;
            if (monsterCfg.boss)
            {
                this.bossCfgList.push(monsterCfg);
            }
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取怪物配置 */
    public getMonsterCfgById(monsterId: number): MonsterCFG 
    {
        return this._tableMap[monsterId];
    }

    public getDropIdList(monsterId:number, quality:number):number[]
    {
        let monsterCfg:any = this._tableMap[monsterId];

        let dropIds:number[];
        if (monsterCfg.boss)
        {
            dropIds = monsterCfg.dorp4;
        }
        else
        {
            dropIds = monsterCfg["dorp" + quality];
        }
        return dropIds;
    }

    /** 获取掉落ID */
    public getDropId(monsterId:number, quality:number):number | undefined
    {
        let monsterCfg:any = this._tableMap[monsterId];
        
        let dropIds:number[];
        if (monsterCfg.boss)
        {
            dropIds = monsterCfg.dorp4;
        }
        else
        {
            dropIds = monsterCfg["dorp" + quality];
        }
        if (dropIds)
        {
            return dropIds[Math.floor(Math.random() * dropIds.length)];
        }
        return undefined;
    }
}