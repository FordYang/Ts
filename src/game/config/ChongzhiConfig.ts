import Logger from "../gear/Logger";
import ChongzhiCFG from "./cfg/ChongzhiCFG";

export default class ChongzhiConfig
{
    
    private static _instance: ChongzhiConfig;
    public static get instance(): ChongzhiConfig {
        if (!ChongzhiConfig._instance) {
            ChongzhiConfig._instance = new ChongzhiConfig();
        }
        return ChongzhiConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ChongzhiCFG[];
    private _tableMap:{[id:number]:ChongzhiCFG};

    constructor() 
    {
        
    }

    public get table(): ChongzhiCFG[] 
    {
        return this._table;
    }

    public parseJson(jsonTable: ChongzhiCFG[]): void 
    {
        this._table = jsonTable;
        this._tableMap = {};

        for (let record of jsonTable)
        {
            this._tableMap[record.id] = record;
        }
    }

    public hotupdate(table:ChongzhiCFG[]):void
    {
        for (let cfg of table)
        {
            if (this._tableMap[cfg.id])
            {
                Object.assign(this._tableMap[cfg.id], cfg);
            }
        }
        Logger.log('热更新Chongzhi表');
    }
    //--------------------------------------------------------------------------------------

    public getRecordById(id:number):ChongzhiCFG
    {
        return this._tableMap[id];
    }
}