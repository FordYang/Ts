import { IShopCFG } from "./cfg/ShopCFG";

export class ShopConfig {
    private static _instance: ShopConfig;
    public static get instance(): ShopConfig {
        if (!ShopConfig._instance) {
            ShopConfig._instance = new ShopConfig();
        }
        return ShopConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: IShopCFG[];

    private shopMap:{[type:number]:IShopCFG[]};
    private shopBuyMap:{[shopId:number]:{[itemId:number]:IShopCFG}};
    private shopItemMap:{[itemId:number]:IShopCFG}

    constructor() {
    }

    public get table(): IShopCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: IShopCFG[]): void 
    {
        this._table = jsonTable;

        this.shopMap = {};
        this.shopBuyMap = {};
        this.shopItemMap = {};
        for (let record of this._table) 
        {
            if (!this.shopMap[record.id])
            {
                this.shopBuyMap[record.id] = {};
                this.shopMap[record.id] = [];
            }
            this.shopMap[record.id].push(record);
            this.shopBuyMap[record.id][record.items] = record;

            if (!this.shopItemMap[record.items])
            {
                this.shopItemMap[record.items] = record;
            }
        }
    }

    public hotupdate(table:IShopCFG[]):void
    {

    }

    //--------------------------------------------------------------------------------------
    public getItemListByType(type: number) :IShopCFG[]
    {
        return this.shopMap[type];
    }

    public getCfg(shopId:number, itemId:number):IShopCFG
    {
        return this.shopBuyMap[shopId]?.[itemId];
    }

    public getCfgByItemId(itemId:number):IShopCFG
    {
        return this.shopItemMap[itemId];
    }
}