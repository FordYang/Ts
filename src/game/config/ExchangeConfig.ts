import { IDuiHuanMaCFG } from "./cfg/DuiHuanMaCFG";
import { ILiLianCFG } from "./cfg/LiLianCFG";

export class ExchangeConfig {
    private static _instance: ExchangeConfig;
    public static get instance(): ExchangeConfig {
        if (!ExchangeConfig._instance) {
            ExchangeConfig._instance = new ExchangeConfig();
        }
        return ExchangeConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IDuiHuanMaCFG[];
    private _tableMap: { [id: string]: IDuiHuanMaCFG };

    constructor() {

    }

    public get table(): IDuiHuanMaCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IDuiHuanMaCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getDuihuanmaCfgByCode(code: string): IDuiHuanMaCFG {
        for (let duihuan of this._table) {
            if (duihuan.cdkey == code) return duihuan;
        }
        return null;
    }
}