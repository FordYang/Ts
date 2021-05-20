import { IIntensifyCFG } from "./cfg/IntensifyCFG";
import { ILibaoCFG } from "./cfg/LibaoCFG";

export class IntensifyConfig {
    private static _instance: IntensifyConfig;
    public static get instance(): IntensifyConfig {
        if (!IntensifyConfig._instance) {
            IntensifyConfig._instance = new IntensifyConfig();
        }
        return IntensifyConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IIntensifyCFG[];
    private _tableMap: { [id: number]: IIntensifyCFG };

    constructor() {

    }

    public get table(): IIntensifyCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IIntensifyCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let __table of this._table) {
            this._tableMap[__table.id] = __table;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取技能配置 */
    public getIntensifyCfgById(id: number): IIntensifyCFG {
        return this._tableMap[id];
    }
}