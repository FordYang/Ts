import Logger from "../gear/Logger";
import SkillBuffCFG from "./cfg/SkillBuffCFG";

export default class SkillBuffConfig {
    private static _instance: SkillBuffConfig;
    public static get instance(): SkillBuffConfig {
        if (!SkillBuffConfig._instance) {
            SkillBuffConfig._instance = new SkillBuffConfig();
        }
        return SkillBuffConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: SkillBuffCFG[];
    private _tableMap: { [skillId: number]: SkillBuffCFG };

    constructor() 
    {

    }

    public get table(): SkillBuffCFG[] 
    {
        return this._table;
    }

    public parseJson(jsonTable: SkillBuffCFG[]): void 
    {
        this._table = jsonTable;

        this._tableMap = Object.create(null);
        
        for (let buffCfg of this._table) 
        {
            this._tableMap[buffCfg.id] = buffCfg;
        }
    }

    public hotupdate(table:SkillBuffCFG[]):void
    {
        for (let cfg of table)
        {
            if (this._tableMap[cfg.id])
            {
                Object.assign(this._tableMap[cfg.id], cfg);
            }
        }
        Logger.log('热更新SkillBuff表');
    }
    //--------------------------------------------------------------------------------------
    /**  */
    public getBuffCfgById(id: number): SkillBuffCFG 
    {
        return this._tableMap[id];
    }
}