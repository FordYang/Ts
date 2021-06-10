import { IIntensifyPartCFG } from "./cfg/IntensifyPartCFG";

export class IntensifyPartConfig {
    private static _instance: IntensifyPartConfig;
    public static get instance(): IntensifyPartConfig {
        if (!IntensifyPartConfig._instance) {
            IntensifyPartConfig._instance = new IntensifyPartConfig();
        }
        return IntensifyPartConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IIntensifyPartCFG[];
    private _tableMap: { [id: number]: IIntensifyPartCFG };

    constructor() {

    }

    public get table(): IIntensifyPartCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IIntensifyPartCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let __table of this._table) {
            this._tableMap[__table.id] = __table;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取技能配置 */
    public getIntensifyPartCfgById(id: number): IIntensifyPartCFG {
        return this._tableMap[id];
    }
}