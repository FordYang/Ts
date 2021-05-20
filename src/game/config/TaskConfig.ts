import { ITaskCFG } from "./cfg/TaskCFG";

export class TaskConfig {
    private static _instance: TaskConfig;
    public static get instance(): TaskConfig {
        if (!TaskConfig._instance) {
            TaskConfig._instance = new TaskConfig();
        }
        return TaskConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: ITaskCFG[];
    private _tableMap: { [id: number]: ITaskCFG };

    constructor() {

    }

    public get table(): ITaskCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: ITaskCFG[]): void {
        this._table = jsonTable;

        this._tableMap = {};
        for (let skillSO of this._table) {
            this._tableMap[skillSO.id] = skillSO;
        }
    }

    //--------------------------------------------------------------------------------------

    /** 根据ID获取配置 */
    public getTaskCfgById(id: number): ITaskCFG {
        return this._tableMap[id];
    }
}