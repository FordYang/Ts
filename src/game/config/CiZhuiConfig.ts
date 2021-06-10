import { ICiZhuiCFG } from "./cfg/CiZhuiCFG";

export class CiZhuiConfig {

    public static MAX_ATTR_ID: number = 1000;

    private static _instance: CiZhuiConfig;
    public static get instance(): CiZhuiConfig {
        if (!CiZhuiConfig._instance) {
            CiZhuiConfig._instance = new CiZhuiConfig();
        }
        return CiZhuiConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ICiZhuiCFG[];
    private _tableMap: { [id: number]: ICiZhuiCFG };

    constructor() {
    }

    public get table(): ICiZhuiCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: ICiZhuiCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let cizhuiSO of this._table) {
            this._tableMap[cizhuiSO.attrtype] = cizhuiSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getCiZhuiCfgById(id: number): ICiZhuiCFG {
        return this._tableMap[id];
    }

    public getCiZhuiSO(id: number): ICiZhuiCFG {
        return this._tableMap[id];
    }
    /**战力获取 */
    public getVcombat(id: number): number {
        let czSo = this.getCiZhuiSO(id);
        return czSo ? czSo.vcombat : 0;
    }
}