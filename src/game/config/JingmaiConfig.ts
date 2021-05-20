import { JingmaiCFG } from "./cfg/JingmaiCFG";
import { JingmaiXueweiCFG } from "./cfg/JingmaiXueweiCFG";

export default class JingmaiConfig {
    private static _instance: JingmaiConfig;
    public static get instance(): JingmaiConfig {
        if (!JingmaiConfig._instance) {
            JingmaiConfig._instance = new JingmaiConfig();
        }
        return JingmaiConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: JingmaiXueweiCFG[];
    private _tableMap: { [itemId: number]: JingmaiXueweiCFG };

    private _lvJingmaiXueweiMap: { [id: string]: JingmaiXueweiCFG };
    private _jingmaiMap: { [jingmaiId: number]: JingmaiCFG };
    private _jingmaiList: JingmaiCFG[];

    private _lvXueweiMap: { [lvJingmaiId: string]: JingmaiXueweiCFG[] };

    constructor() 
    {

    }

    public parseJson(jsonTable: JingmaiXueweiCFG[]): void {
        jsonTable.sort((a, b) => {
            if (a.lvl == b.lvl) {
                if (a.jmid == b.jmid) {
                    return a.xwid - b.xwid;
                }
                return a.jmid - b.jmid;
            }
            return a.lvl - b.lvl;
        });

        this._table = jsonTable;

        this._tableMap = {};
        this._lvJingmaiXueweiMap = {};
        this._jingmaiMap = {};
        this._jingmaiList = [];
        this._lvXueweiMap = {};
        for (let xueweiSo of this._table) {
            this._tableMap[xueweiSo.id] = xueweiSo;

            let lvJm: string = `${xueweiSo.lvl}_${xueweiSo.jmid}`;
            this._lvJingmaiXueweiMap[`${xueweiSo.lvl}_${xueweiSo.xwid}`] = xueweiSo;

            this._lvXueweiMap[lvJm] ? this._lvXueweiMap[lvJm].push(xueweiSo) : this._lvXueweiMap[lvJm] = [xueweiSo];
            let jingmaiCfg = this._jingmaiMap[xueweiSo.jmid];
            if (jingmaiCfg) {
                jingmaiCfg.xueweiList.push(xueweiSo);
            }
            else {
                this._jingmaiMap[xueweiSo.jmid] = { jmid: xueweiSo.jmid, jmname: xueweiSo.name, xueweiList: [xueweiSo] };
                this._jingmaiList.push(this._jingmaiMap[xueweiSo.jmid]);
            }
        }
    }

    public get xueweiList(): JingmaiXueweiCFG[] {
        return this._table;
    }

    /** 经脉列表 */
    public get jingmaiList(): JingmaiCFG[] {
        return this._jingmaiList;
    }

    /** 根据等级，经脉ID获取穴位列表 */
    public getXueweiList(lv: number, jmId: number): JingmaiXueweiCFG[] {
        return this._lvXueweiMap[`${lv}_${jmId}`];
    }

    public get firstXueweiCfg(): JingmaiXueweiCFG {
        return this._table[0];
    }

    public getXueweiCfg(lv: number, xueweiId: number): JingmaiXueweiCFG 
    {
        return this._lvJingmaiXueweiMap[`${lv}_${xueweiId}`];
    }

    public getJingmaiCfgById(id: number): JingmaiXueweiCFG 
    {
        return this._tableMap[id];
    }

    /** 返回下一级，==null全满级 */
    public getNextXueweiCfg(lv: number, jingmaiId: number, xueweiId: number): JingmaiXueweiCFG | null 
    {
        let xueweiCfg = this.getXueweiCfg(lv, xueweiId + 1);
        if (xueweiCfg) 
        {
            return xueweiCfg;
        }
        xueweiCfg = this.getXueweiCfg(lv, (jingmaiId + 1) * 1000 + 1);
        if (xueweiCfg) 
        {
            return xueweiCfg;
        }
        return this.getXueweiCfg(lv + 1, 1001);
    }

    /** 获取经脉最大穴位 */
    public getMaxXueweiByLvJmID(lv: number, jmId: number): JingmaiXueweiCFG 
    {
        let xueWeiCfg: JingmaiXueweiCFG;
        let xwCfgL: JingmaiXueweiCFG[] = this.getXueweiList(lv, jmId);
        for (let xwCfg of xwCfgL) 
        {
            if (!xueWeiCfg || xwCfg.xwid > xueWeiCfg.xwid) 
            {
                xueWeiCfg = xwCfg;
            }
        }
        return xueWeiCfg;
    }

    public isMaxXuewei(xueweiCfg: JingmaiXueweiCFG): boolean 
    {
        let maxXueweiCfg = this.getMaxXueweiByLvJmID(xueweiCfg.lvl, xueweiCfg.jmid);
        return maxXueweiCfg.id == xueweiCfg.id;
    }
}