import QiandaoMonthCFG from "./cfg/QiandaoMonthCFG";
import QiandaoWeekCFG from "./cfg/QiandaoWeekCFG";

export default class QiandaoConfig
{
    
    private static _instance: QiandaoConfig;
    public static get instance(): QiandaoConfig 
    {
        if (!QiandaoConfig._instance) {
            QiandaoConfig._instance = new QiandaoConfig();
        }
        return QiandaoConfig._instance;
    }

    //--------------------------------------------------------------------------------------

    // private weekTable: QiandaoWeekCFG[];
    private weekMap: { [itemId: number]: QiandaoWeekCFG };
    
    // private monthTable: QiandaoMonthCFG[];
    private monthMap: { [itemId: number]: QiandaoMonthCFG };

    constructor() 
    {

    }

    public parseJson(weekTable: QiandaoWeekCFG[], monthTable:QiandaoMonthCFG[]): void 
    {
        // this.weekTable = weekTable;
        // this.monthTable = monthTable;

        this.weekMap = {};
        this.monthMap = {};

        for (let itemSO of weekTable) 
        {
            this.weekMap[itemSO.id] = itemSO;
        }

        for (let record of monthTable)
        {
            this.monthMap[record.id] = record;
        }
    }
    
    //--------------------------------------------------------------------------------------
    
    public getWeekCfg(id: number): QiandaoWeekCFG
    {
        return this.weekMap[id];
    }

    public getMonthCfg(id:number):QiandaoMonthCFG
    {
        return this.monthMap[id];
    }
}