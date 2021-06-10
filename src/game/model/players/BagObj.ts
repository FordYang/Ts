import { ItemConfig } from "../../config/ItemConfig";
import { EQuality } from "../../consts/EGame";
import DataUtil from "../../gear/DataUtil";
import { IItem } from "./Bag";
import Item from "./Item";

/**为了使用道具装备吧 */
export default class BagObj {
    /**当前背包容量 */
    bagCnt: number;
    /**最大上限 */
    maxBagCnt: number;
    /**当前内容 */
    // baglist: IItem[];
    /**最大拓展上限 */
    bagExCnt: number;
    /**扩容次数 */
    exCnts: number;
    /**转换成的items */
    bagitems: Item[];
    /**装备品质记录 */
    equipRecord: any = {};
    constructor() {
        this.bagitems = [];
        this.bagCnt = 50;
        this.exCnts = 0;
        // this.baglist = [];
        this.bagExCnt = 350;
        this.maxBagCnt = 400;

        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (isNaN(value)) {
                continue;
            }
            this.equipRecord[value] = 0;
        }
    }

    /**背包数据 */
    setDB(data: string) {
        if (!data) return;
        let __data = DataUtil.jsonBy(data);
        this.bagCnt = __data.bagCnt;
        this.exCnts = __data.exCnts;
        this.bagExCnt = __data.bagExCnt;
        this.maxBagCnt = __data.maxBagCnt;
        if (__data.equipRecord)
            this.equipRecord = __data.equipRecord;
    }

    /**填充背包 */
    pushItem(item: Item) {
        if (this.bagitems.indexOf(item) == -1){
            this.bagitems.push(item);
        }
        // let iitem = item.toObj();
        // if (this.baglist.indexOf(iitem) == -1)
        //     this.baglist.push(iitem);
    }

    /**--IItem------------------------------------------------------------------------------ */
    /**通过uuid查找 */
    getItemByUUId(uuid: number): Item {
        for (let items of this.bagitems) {
            if (items.uuid == uuid) {
                return items;
            }
        }
        return null;
    }
    /**获取Item */
    getItemByItemId(itemId: number): Item {
        for (let items of this.bagitems) {
            if (items.itemId == itemId) {
                return items;
            }
        }
        return null;
    }

    /**背包使用 */
    getCountByItemId(itemId: number) {
        let count = 0;
        for (let items of this.bagitems) {
            if (items.itemId == itemId) {
                count += items.count;
            }
        }
        return count;
    }

    toBagObj() {
        return {
            bagCnt: this.bagCnt,
            exCnts: this.exCnts,
            bagExCnt: this.bagExCnt,
            maxBagCnt: this.maxBagCnt,
            equipRecord: this.equipRecord
        }
    }

    toDB() {
        return DataUtil.toJson(this.toBagObj(), "{}");
    }
}