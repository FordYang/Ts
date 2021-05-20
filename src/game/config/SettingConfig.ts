import { SettingCFG } from "./cfg/SettingCFG";

export class SettingConfig 
{
    private static _instance: SettingConfig;
    public static get instance(): SettingConfig 
    {
        if (!SettingConfig._instance) 
        {
            SettingConfig._instance = new SettingConfig();
        }
        return SettingConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: SettingCFG[];

    private map:{[id:string]:SettingCFG};

    constructor() 
    {

    }
    
    public parseJson(jsonTable: SettingCFG[]): void 
    {
        this._table = jsonTable;
        this.map = {};

        for (let obj of jsonTable)
        {
            this.map[obj.id] = obj;
        }
    }

    public getSettingCFGById(id:string):SettingCFG
    {
        return this.map[id];
    }
}