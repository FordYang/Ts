import { ShenQiCFG } from "./cfg/ShenQiCFG";

export class ShenQiConfig
{
    // public static SKILL_START_IDX:number = 400100;

    private static _instance: ShenQiConfig;
    public static get instance(): ShenQiConfig 
    {
        if (!ShenQiConfig._instance) 
        {
            ShenQiConfig._instance = new ShenQiConfig();
        }
        return ShenQiConfig._instance;
    }

    //--------------------------------------------------------------------------------------

    private _table: ShenQiCFG[];
    private map:{[id:string]:ShenQiCFG};

    private lvMap:{[lv:number]:ShenQiCFG}

    constructor() 
    {

    }
    
    public parseJson(jsonTable: ShenQiCFG[]): void 
    {
        jsonTable.sort((a, b)=>{
            return a.id - b.id;
        });
        this._table = jsonTable;
        this.map = {};
        this.lvMap = {};

        for (let obj of jsonTable)
        {
            this.map[obj.id] = obj;
            if (!this.lvMap[obj.lvl])
            {
                this.lvMap[obj.lvl] = obj;
            }
        }
    }

    public get table():ShenQiCFG[]
    {
        return this._table;
    }

    public getCFGById(id:number):ShenQiCFG
    {
        return this.map[id];
    }

    public getCFGBySkillLv(type:number, skillLv:number)
    {
        return this.lvMap[skillLv];
    }

    public isSkillMaxLv(type:number, skillLv:number):boolean
    {
        return !this.lvMap[skillLv];
    }

    public isMaxLv(type:number, id:number):boolean
    {
        return !this.map[id];
    }
}