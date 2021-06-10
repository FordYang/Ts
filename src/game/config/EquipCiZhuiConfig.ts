import { IEquipCiZhuiCFG } from "./cfg/EquipCiZhuiCFG";

export class EquipCiZhuiConfig {
    private static _instance: EquipCiZhuiConfig;
    public static get instance(): EquipCiZhuiConfig {
        if (!EquipCiZhuiConfig._instance) {
            EquipCiZhuiConfig._instance = new EquipCiZhuiConfig();
        }
        return EquipCiZhuiConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IEquipCiZhuiCFG[];
    private _tableMap: { [id: number]: IEquipCiZhuiCFG };

    constructor() {
    }

    public get table(): IEquipCiZhuiCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IEquipCiZhuiCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------
    /** 根据ID获取配置 */
    public getAffixCfgById(id: number): IEquipCiZhuiCFG {
        return this._tableMap[id];
    }

    /**获取配置 - 根据等级/部位*/
    public getAffixCfgByLevel(profession: number, quality: number, level: number, part: number): IEquipCiZhuiCFG[] {
        let affixs = [];
        for (let table of this._table) {
            if (table.gailv > 0 && table.lvl == level) {
                if (table.profession) {/**校验职业 */
                    if (table.profession == profession) {
                        if (table.quality <= quality)
                            affixs.push(table);
                    }
                } else if (table.position && table.position.length > 0) {/**校验部位 */
                    let index = table.position.indexOf(part);
                    if (index != -1) {
                        if (table.quality <= quality)
                            affixs.push(table);
                    }
                } else {
                    if (table.quality <= quality)
                        affixs.push(table);
                }
            }
        }
        return affixs;
    }
}