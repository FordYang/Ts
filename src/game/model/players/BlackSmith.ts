import DropConfig from "../../config/DropConfig";
import { ERichesType } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";
import { IItem } from "./Bag";
import Item from "./Item";

/**铁匠铺 */
export default class BlackSmith {
    owner: Player;
    /**当前等级 */
    level: number;
    /**物品列表 */
    itemlist: IItem[];
    /**已经锻造列表 */
    buildlist: number[];

    /**铁匠栏数量 */
    MAX_COUNT: number = 3;
    constructor(owner: Player) {
        this.owner = owner;
        this.level = 0;
        this.itemlist = [];
        this.buildlist = [];
    }

    /**系统缓存 */
    setDB(data: string) {
        if (!data) return this.refreshBuildlist();
        let __data = DataUtil.jsonBy(data);
        this.level = __data.level;
        this.itemlist = __data.itemlist;
        this.buildlist = __data.buildlist;
    }

    /**重新随机池子 */
    refreshBuildlist() {
        let rolelevel = this.owner.level;
        let checklevel = Math.floor(rolelevel / 10) * 10 + 10;
        let dropId = 30000 + checklevel;
        this.level = checklevel / 10;
        this.itemlist = [];
        this.buildlist = [];
        for (let i = 0; i < this.MAX_COUNT; i++) {
            let itemInfo = DropConfig.instance.getRndItemObj(dropId);
            let item = new Item(this.owner.profession);
            item.initItem(itemInfo.itemId, itemInfo.value);
            this.itemlist.push(item.toObj());
        }
    }

    /**多少秒重置一次 */
    update() {

    }

    /**锻造 */
    onBuilding(data: any) {
        let item = this.getIItemByUid(data.uid);
        if (item) {
            let cost = item.iConfigs.price * this.level * item.quality;
            if (this.owner.money >= cost) {
                if (this.owner.bag.freeCount >= 1) {
                    this.buildlist.push(data.uid);
                    this.owner.addMoney(ERichesType.Money, -1 * cost, "锻造消耗");
                    this.owner.bag.addBagEquip(item);
                    this.owner.send(CmdID.s2c_blacksmith_req, { uid: data.uid });
                } else {
                    this.owner.send(CmdID.s2c_notice, { code: ErrorConst.BAG_NOT_ENOUGH });
                }
            } else {
                this.owner.send(CmdID.s2c_notice, { code: ErrorConst.GOLD_NOT_ENOUGH });
            }
        }
    }

    /**获取当前是哪个装备 */
    getIItemByUid(uid: number) {
        let buildItem = null;
        for (let item of this.itemlist) {
            if (item.uuid == uid) {
                if (this.buildlist.indexOf(uid) == -1) {
                    buildItem = new Item(this.owner.profession);
                    buildItem.setItem(item);
                    break;
                } else {
                    Logger.log("当前装备已经锻造了");
                }
            }
        }
        return buildItem;
    }

    toObj() {
        return {
            level: this.level,
            itemlist: this.itemlist,
            buildlist: this.buildlist
        }
    }

    toDB() {
        let dbBlack = DataUtil.toJson(this.toObj(), "{}");
        return dbBlack;
    }
}