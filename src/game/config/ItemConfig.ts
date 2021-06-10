import Logger from "../gear/Logger";
import { IItemCFG } from "./cfg/ItemCFG";

export class ItemConfig {
    private static _instance: ItemConfig;
    public static get instance(): ItemConfig {
        if (!ItemConfig._instance) {
            ItemConfig._instance = new ItemConfig();
        }
        return ItemConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IItemCFG[];
    private _tableMap:{[itemId:number]:IItemCFG}

    constructor() {

    }

    public get table(): IItemCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IItemCFG[]): void {
        this._table = jsonTable;

        this._tableMap = Object.create(null);

        for (let itemCfg of this._table) 
        {
            this._tableMap[itemCfg.id] = itemCfg;
        }
    }

    public hotupdate(table:IItemCFG[]):void
    {
        let targetCfg:IItemCFG;
        for (let itemcfg of table)
        {
            targetCfg = this._tableMap[itemcfg.id];
            if (targetCfg)
            {
                Object.assign(targetCfg, itemcfg);
            }
        }
        Logger.log('热更新Item表');
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getItemCfgById(itemId: number): IItemCFG 
    {
        return this._tableMap[itemId];
    }
}