import { IProfessionCFG } from "./cfg/ProfessionCFG";

export class ProfessionConfig {
    private static _instance: ProfessionConfig;
    public static get instance(): ProfessionConfig {
        if (!ProfessionConfig._instance) {
            ProfessionConfig._instance = new ProfessionConfig();
        }
        return ProfessionConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IProfessionCFG[];
    private _tableMap: { [skillId: number]: IProfessionCFG };

    constructor() {

    }

    public get table(): IProfessionCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IProfessionCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getProfessionCfgById(profession: number): IProfessionCFG {
        return this._tableMap[profession];
    }

    /**获取初始礼包 */
    public getGiftByProfession(profession: number): number[] {
        let professionCfg = this.getProfessionCfgById(profession);
        return professionCfg ? professionCfg.items : [];
    }
}