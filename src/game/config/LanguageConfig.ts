import { StringUtil } from "../gear/StringUtil";
import LanguageCFG from "./cfg/LanguageCFG";

export default class LanguageConfig 
{

    private static _instance: LanguageConfig;
    public static get instance(): LanguageConfig 
    {
        if (!LanguageConfig._instance) 
        {
            LanguageConfig._instance = new LanguageConfig();
        }
        return LanguageConfig._instance;
    }

    //--------------------------------------------------------------------------------------

    private _table: LanguageCFG[];
    private _tableMap: { [skillId: number]: LanguageCFG };

    constructor() {

    }

    public get table(): LanguageCFG[] 
    {
        return this._table;
    }

    public parseJson(jsonTable: LanguageCFG[]): void 
    {
        if (jsonTable)
        {
            this._table = jsonTable;
            this._tableMap = {};
    
            for (let langCfg of jsonTable) 
            {
                this._tableMap[langCfg.id] = langCfg;
            }
        }
    }

    //--------------------------------------------------------------------------------------

    public getDescByCodeId(codeId:number):string
    {
        return this._tableMap[codeId]?.cn ?? `Language Code未定义：${codeId}`;
    }

    public getFormatDesc(codeId:number, ...args:any[]):string
    {
        let desc = this.getDescByCodeId(codeId);
        if (desc)
        {
            desc = StringUtil.format(desc, ...args);
        }
        return desc;
    }
}