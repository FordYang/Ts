import { ILiLianCFG } from "./cfg/LiLianCFG";
import { ITaskCFG } from "./cfg/TaskCFG";

export class LilianConfig {
    private static _instance: LilianConfig;
    public static get instance(): LilianConfig {
        if (!LilianConfig._instance) {
            LilianConfig._instance = new LilianConfig();
        }
        return LilianConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ILiLianCFG[];
    private _tableMap: { [id: number]: ILiLianCFG };

    constructor() {

    }

    public get table(): ILiLianCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: ILiLianCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getLilianCfgById(id: number): ILiLianCFG {
        return this._tableMap[id];
    }
}