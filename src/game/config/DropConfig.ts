import Logger from "../gear/Logger";
import DropCFG from "./cfg/DropCFG";
import { DropMaxCFG } from "./cfg/DropMaxCFG";

export default class DropConfig {

    private static _instance: DropConfig;
    public static get instance(): DropConfig {
        if (!DropConfig._instance) {
            DropConfig._instance = new DropConfig();
        }
        return DropConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _dropTable:DropCFG[];
    private _dropMap: { [dropId: number]: DropCFG };

    public dropMaxTable:DropMaxCFG[];
    private _dropMaxMap:{[itemId:number]:DropMaxCFG};

    constructor() {

    }

    public parseJson(dropTable: DropCFG[], dropMaxTable:DropMaxCFG[]): void 
    {
        this._dropTable = dropTable;
        this._dropMap = Object.create(null);
        for (let dropcfg of dropTable)
        {
            this._dropMap[dropcfg.id] = dropcfg;
        }

        this.initTable();

        this.dropMaxTable = dropMaxTable;
        this._dropMaxMap = Object.create(null);
        for (let dropMaxCfg of dropMaxTable)
        {
            this._dropMaxMap[dropMaxCfg.id] = dropMaxCfg;
        }
    }

    private initTable():void
    {
        for (let dropCfg of this._dropTable) 
        {
            dropCfg.nodrop = dropCfg.nodrop ?? 0;
            dropCfg.prob = dropCfg.prob ?? 0;
            dropCfg.prob1 = dropCfg.prob1 ?? 0;
            dropCfg.prob2 = dropCfg.prob2 ?? 0;
            dropCfg.prob3 = dropCfg.prob3 ?? 0;
            dropCfg.prob4 = dropCfg.prob4 ?? 0;
            dropCfg.prob5 = dropCfg.prob5 ?? 0;
            dropCfg.prob6 = dropCfg.prob6 ?? 0;
            dropCfg.mTotalProb = dropCfg.nodrop + dropCfg.prob + dropCfg.prob1 + dropCfg.prob2 + dropCfg.prob3 + dropCfg.prob4 + dropCfg.prob5 + dropCfg.prob6;

        }
    }

    
    public hotupdate(dropTable: DropCFG[], dropMaxTable:DropMaxCFG[]): void 
    {
        for (let dropcfg of dropTable)
        {
            if (this._dropMap[dropcfg.id])
            {
                Object.assign(this._dropMap[dropcfg.id], dropcfg);
            }
        }
        this.initTable();

        for (let dropmaxcfg of dropMaxTable)
        {
            if (this._dropMaxMap[dropmaxcfg.id])
            {
                Object.assign(this._dropMaxMap[dropmaxcfg.id], dropmaxcfg);
            }
        }
        Logger.log('热更新Drop表');
    }
    //--------------------------------------------------------------------------------------

    public getDropMaxCfg(itemId:number):DropMaxCFG
    {
        return this._dropMaxMap[itemId];
    }

    //--------------------------------------------------------------------------------------
    public getDropCfgById(id: number): DropCFG 
    {
        return this._dropMap[id];
    }

    /** 随机一次掉落 */
    public getRndItemObj(dropId: number): { itemId: number, value: number, count:number, quality:number } | undefined 
    {
        let dropCfg = this._dropMap[dropId];
        if (dropCfg) {
            let rndProb = Math.random() * dropCfg.mTotalProb;

            if (dropCfg.nodrop > rndProb) {
                return undefined;
            }
            rndProb -= dropCfg.nodrop;

            let count:number = 0;
            // let quality:number = 1;
            if (dropCfg.prob > rndProb) 
            {
                let gold = dropCfg.gold;
                count = gold * 1.2 - gold * Math.random() * 0.4;
                return { itemId: 103035, value: count, count:count, quality:1}
            }
            rndProb -= dropCfg.prob;

            if (dropCfg.prob1 > rndProb) {
                let itemId = dropCfg.item1[Math.floor(dropCfg.item1.length * Math.random())];
                let quality = this.rndProbIdx(dropCfg.gailv1);
                return { itemId: itemId, value: quality + 1, count:1, quality:quality + 1};
            }
            rndProb -= dropCfg.prob1;

            if (dropCfg.prob2 > rndProb) {
                let itemId = dropCfg.item2[Math.floor(dropCfg.item2.length * Math.random())];
                let quality = this.rndProbIdx(dropCfg.gailv2);
                return { itemId: itemId, value: quality + 1, count:1, quality:quality + 1};
            }
            rndProb -= dropCfg.prob2;

            if (dropCfg.prob3 > rndProb) {
                let itemId = dropCfg.item3[Math.floor(dropCfg.item3.length * Math.random())];
                return { itemId: itemId, value: 1 , count:1, quality:1};
            }
            rndProb -= dropCfg.prob3;

            if (dropCfg.prob4 > rndProb) {
                let itemId = dropCfg.item4[Math.floor(dropCfg.item4.length * Math.random())];
                return { itemId: itemId, value:1, count:1, quality:1 };
            }
            rndProb -= dropCfg.prob4;

            if (dropCfg.prob5 > rndProb) {
                let itemId = dropCfg.item5[Math.floor(dropCfg.item5.length * Math.random())];
                return { itemId: itemId, value: 1, count:1, quality:1  };
            }
            rndProb -= dropCfg.prob5;

            if (dropCfg.prob6 >= rndProb) {
                let itemId = dropCfg.item6[Math.floor(dropCfg.item6.length * Math.random())];
                return { itemId: itemId, value: 1, count:1, quality:1  };
            }
            rndProb -= dropCfg.prob6;
        }
        return undefined;
    }

    private rndProbIdx(probs: number[]): number 
    {
        let totalProb: number = probs.reduce((total, v2) => 
        {
            return total + v2;
        });

        let rndProb:number = Math.random() * totalProb;

        for (let i: number = 0; i < probs.length; i++) 
        {
            if (probs[i] > rndProb) 
            {
                return i;
            }
            rndProb -= probs[i];
        }
        return 0;
    }

}