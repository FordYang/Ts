import { ILevelupCFG } from "./cfg/LevelupCFG";

export class LevelUpConfig {
    private static _instance: LevelUpConfig;
    public static get instance(): LevelUpConfig {
        if (!LevelUpConfig._instance) {
            LevelUpConfig._instance = new LevelUpConfig();
        }
        return LevelUpConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ILevelupCFG[];
    private _tableMap: { [id: number]: ILevelupCFG };

    constructor() {

    }

    public get table(): ILevelupCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: ILevelupCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getlevelupCfgById(level: number): ILevelupCFG {
        if (level == 0) level = 1;
        return this._tableMap[level];
    }
}