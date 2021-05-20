import { IJiJInCFG } from "./cfg/JiJinCFG";

/**基金 */
export default class JiJinConfig {
    private static _instance: JiJinConfig;
    public static get instance(): JiJinConfig {
        if (!JiJinConfig._instance) {
            JiJinConfig._instance = new JiJinConfig();
        }
        return JiJinConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IJiJInCFG[];
    private _tableMap: { [itemId: number]: IJiJInCFG }

    constructor() {

    }

    public get table(): IJiJInCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IJiJInCFG[]): void {
        this._table = jsonTable;

        this._tableMap = Object.create(null);

        for (let itemCfg of this._table) {
            this._tableMap[itemCfg.lvl] = itemCfg;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getJiJinCfgByLvl(lvl: number): IJiJInCFG {
        return this._tableMap[lvl];
    }
}