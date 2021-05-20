import { ShopConfig } from "../../config/ShopConfig";
import { ERichesType } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import GameEvent from "../../consts/GameEvent";
import CyObject from "../../core/CyObject";
import EventTool from "../../core/EventTool";
import DataUtil from "../../gear/DataUtil";
import DateUtil from "../../gear/DateUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";


export default class RoleShopEntity extends CyObject {
    private player: Player;

    private buyDay: number;
    private buyMap: { [shopId_itemId: string]: number };

    constructor(owner: Player) {
        super();

        this.player = owner;

        this.buyMap = {};

        this.player.on(CmdID.c2s_shop_buy, this.onBuy);
        // EventTool.on(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    public resetDay():void 
    {
        this.buyDay = DateUtil.nowDay;
        this.buyMap = {};

        DB.updateRoleAttr(this.player.roleid, ["shop"], [this.serializeDB()]);
    }

    public buy(shopId: number, itemId: number, count: number): void {
        this.onBuy({ shopId, itemId, count });
    }

    private onBuy = (bodyObj: { shopId: number, itemId: number, count: number }) => 
    {
        if (bodyObj) 
        {
            if (bodyObj.count <= 0) 
            {
                return;
            }
            
            if (this.player.bag.freeCount < 1)
            {
                this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.BAG_NOT_ENOUGH });
                return;
            }
            
            let shopCfg = ShopConfig.instance.getCfg(bodyObj.shopId, bodyObj.itemId);
            if (shopCfg && (!shopCfg.profession || this.player.profession === shopCfg.profession) && (!shopCfg.lve || this.player.level >= shopCfg.lve)) 
            {
                let needPrice = shopCfg.price * (shopCfg.offprice || 1) * bodyObj.count;
                if (shopCfg.currencytype == 1) 
                {
                    // 金币
                    if (this.player.money < needPrice) 
                    {
                        this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.GOLD_NOT_ENOUGH });
                        return;
                    }
                }
                else if (shopCfg.currencytype == 2) {
                    // 元宝
                    if (this.player.yuanbao < needPrice) 
                    {
                        this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
                        return;
                    }
                }
                else 
                {
                    this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.ITEM_NOT_EXIST });
                    return;
                }

                let day = DateUtil.nowDay;
                if (this.buyDay != day) 
                {
                    this.buyMap = {};
                    this.buyDay = day;
                    DB.updateRoleAttr(this.player.roleid, ["shop"], [this.serializeDB()]);
                }

                let buyId: string = `${shopCfg.id}_${shopCfg.items}`;
                let buyCount = this.buyMap[buyId] || 0;
                if (buyCount + bodyObj.count > shopCfg.maxnum) {
                    // 限制购买
                    this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.ITEM_NOT_EXIST });
                    return;
                }

                this.buyMap[buyId] = (this.buyMap[buyId] || 0) + bodyObj.count;

                if (shopCfg.currencytype == 1) 
                {
                    this.player.addMoney(ERichesType.Money, -needPrice, "商城购买：" + shopCfg.name);
                }
                else if (shopCfg.currencytype == 2) 
                {
                    this.player.addMoney(ERichesType.Yuanbao, -needPrice, "商城购买：" + shopCfg.name);
                }
                this.player.addItem(shopCfg.items, bodyObj.count * shopCfg.oncenum, "商城购买：" + shopCfg.name, false, null, true);

                this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.SUCCEED, buyId: buyId, count: bodyObj.count });

                DB.updateRoleAttr(this.player.roleid, ["shop"], [this.serializeDB()]);
            }
            else 
            {
                this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.ITEM_NOT_EXIST });
            }
        }
        else 
        {
            this.player.send(CmdID.s2c_shop_buy, { code: ErrorConst.ITEM_NOT_EXIST });
        }
    }

    //----------------------------------------------------------------------------------------------------------------

    public deserializeDB(buystr: string): void {
        let buyObj = DataUtil.jsonBy(buystr);

        this.buyDay = buyObj?.date || 0;
        if (this.buyDay !== DateUtil.nowDay) {
            this.buyDay = DateUtil.nowDay;
            this.buyMap = {};
        }
        else {
            this.buyMap = buyObj?.buy || {};
        }
    }

    public serializeDB(): string {
        let buyObj = { date: this.buyDay, buy: this.buyMap };
        return JSON.stringify(buyObj);
    }

    public serializeClient(): string {
        return JSON.stringify(this.buyMap);
    }

    //----------------------------------------------------------------------------------------------------------------

    protected onDestroy(): void {
        // EventTool.off(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
        this.player?.off(CmdID.c2s_shop_buy, this.onBuy);

        super.onDestroy();
    }
}