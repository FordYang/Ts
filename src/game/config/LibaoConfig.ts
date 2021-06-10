import Logger from "../gear/Logger";
import { ILibaoCFG } from "./cfg/LibaoCFG";

export class LibaoConfig {
    private static _instance: LibaoConfig;
    public static get instance(): LibaoConfig {
        if (!LibaoConfig._instance) {
            LibaoConfig._instance = new LibaoConfig();
        }
        return LibaoConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ILibaoCFG[];
    private _tableMap: { [id: string]: ILibaoCFG };

    constructor() {

    }

    public get table(): ILibaoCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: ILibaoCFG[]): void 
    {
        this._table = jsonTable;

        this._tableMap = {};
        for (let cfg of this._table) 
        {
            this._tableMap[cfg.id] = cfg;
        }
    }

    public hotupdate(table:ILibaoCFG[]):void
    {
        for (let cfg of table)
        {
            if (this._tableMap[cfg.id])
            {
                Object.assign(this._tableMap[cfg.id], cfg);
            }
        }
        Logger.log('热更新Libao表');
    }
    //--------------------------------------------------------------------------------------

    /** 根据ID获取技能配置 */
    public getLibaoCfgById(id: string): ILibaoCFG {
        return this._tableMap[id];
    }
}