import { IFuseCFG } from "./cfg/FuseCFG";
import { ILibaoCFG } from "./cfg/LibaoCFG";

export class FuseConfig {
    private static _instance: FuseConfig;
    public static get instance(): FuseConfig {
        if (!FuseConfig._instance) {
            FuseConfig._instance = new FuseConfig();
        }
        return FuseConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IFuseCFG[];
    private _tableMap: { [id: string]: IFuseCFG };

    constructor() {

    }

    public get table(): IFuseCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IFuseCFG[]): void 
    {
        this._table = jsonTable;

        this._tableMap = {};
        for (let __table of this._table) 
        {
            this._tableMap[__table.id] = __table;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取技能配置 */
    public getFuseCfgById(id: string): IFuseCFG 
    {
        return this._tableMap[id];
    }

    /**根据合成物来获取配置 */
    public getFuseCfgByItemId(itemId: number): IFuseCFG {
        for (let __table of this._table) {
            if (__table.itemid == itemId) return __table;
        }
        return null;
    }
}