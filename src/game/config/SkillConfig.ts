import Logger from "../gear/Logger";
import SkillCFG from "./cfg/SkillCFG";

export class SkillConfig 
{
    private static _instance: SkillConfig;
    public static get instance(): SkillConfig 
    {
        if (!SkillConfig._instance) 
        {
            SkillConfig._instance = new SkillConfig();
        }
        return SkillConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: SkillCFG[];
    private _tableMap:{[skillId:number]:SkillCFG};

    private idToBaseIdMap:{[skillId:number]:number};

    constructor() 
    {

    }

    public get table(): SkillCFG[] 
    {
        return this._table;
    }

    public parseJson(jsonTable: SkillCFG[]): void 
    {
        this._table = jsonTable;

        this.idToBaseIdMap = Object.create(null);
        this._tableMap = Object.create(null);

        for (let skillCfg of this._table) 
        {
            let skillId:number = skillCfg.id;
            let baseId:number = parseInt(skillId.toString().substr(0, 4));
            skillCfg.baseId = baseId;
            skillCfg.areaarg1 = skillCfg.areaarg1 || 1;
            skillCfg.maxnum = skillCfg.maxnum ?? 999;
            skillCfg.parameter1 = skillCfg.parameter1 ?? 0;
            skillCfg.distance = skillCfg.distance ?? 999;

            this._tableMap[skillCfg.id] = skillCfg;
            this.idToBaseIdMap[skillId] = baseId
        }
    }
    
    public hotupdate(table:SkillCFG[]):void
    {
        let skillcfg:SkillCFG;
        for (let cfg of table)
        {
            skillcfg = this._tableMap[cfg.id];
            if (skillcfg)
            {
                Object.assign(skillcfg, cfg);

                skillcfg.areaarg1 = skillcfg.areaarg1 || 1;
                skillcfg.maxnum = skillcfg.maxnum ?? 999;
                skillcfg.parameter1 = skillcfg.parameter1 ?? 0;
                skillcfg.distance = skillcfg.distance ?? 999;
            }
        }
        Logger.log('热更新Skill表');
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取技能配置 */
    public getSkillCfgById(skillId: number): SkillCFG 
    {
        return this._tableMap[skillId];
    }

    public getBaseId(skillId:number):number
    {
        return this.idToBaseIdMap[skillId];
    }
}