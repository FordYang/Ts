import { IItemCFG } from "../../config/cfg/ItemCFG";
import { ILibaoCFG } from "../../config/cfg/LibaoCFG";
import { ItemConfig } from "../../config/ItemConfig";
import { LibaoConfig } from "../../config/LibaoConfig";
import { ProfessionConfig } from "../../config/ProfessionConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import { EQuality, ERichesType } from "../../consts/EGame";
import { EEquipType, EItemKey, EItemType, ESpecialEquipId, REMAKE_COSTCFG } from "../../consts/EItem";
import { ePrerogativeTime, ePrerogativeType, ESkillId } from "../../consts/ERole";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";
import BagObj from "./BagObj";
import Item from "./Item";
import Skill from "./Skill";
import { EDayMapType } from "./DayMap";
import { FuseConfig } from "../../config/FuseConfig";
import PlayerEvent from "../../consts/PlayerEvent";
import DB from "../../utils/DB";
import MailMgr from "../../mgr/MailMgr";

// 附加词缀
export interface IAffixAttr {
    id: number;
    /**属性编号 */
    code: number;
    /**词缀数值 - 小 */
    minV: number;
    /**词缀数值 - 大 */
    maxV: number;
    /**类型 1：正常，2：百分比 */
    percent: number;
}

/**小物品 */
export interface IItem {
    uuid: number;
    itemId: number;
    count: number;
    quality: number;
    cooling: number;
    part: number;
    affixCnt: number;
    affixInfo: IAffixAttr[];
    bestPoint: number[];
    costStone: number;
    isLock: boolean;
    state: number;
    combat: number;
    isfixd: boolean;
}

/**背包改变类型 */
export enum EBagChangeType {
    /**改变 */
    change = 1,
    /**新增 */
    add = 2,
    /**删除 */
    def = 3,
    /**装备穿戴 */
    wear = 4,
    /**脱下 */
    takeoff = 5
}

/**道具类型 */
export const enum EItemStdMode {
    /**消耗品 */
    expendable = 0,
    /**任务物品 */
    taskitem = 1,
    /**卷轴 */
    rouleau = 2,
    /**杂物 */
    sundries = 3,
    /**书籍 */
    books = 4,
    /**残券 */
    canquan = 41,
    /**矿石 */
    kuangshi = 43,
    /**特权 */
    tequan = 97,
    /**元宝 */
    yuanbao = 98,
    /**礼包 */
    libao = 99,
    /**珍宝 */
    zhenbao = 100
}

/**背包信息 */
export default class Bag extends BagObj {
    owner: Player;
    /**稀有记录 */
    readonly specialItemId: number[] = [103033, 103034, 103036, 104034, 2101, 2102, 2103, 2104, 2105, 2106, 103038, 103039, 103040];
    constructor(owner: Player) {
        super();
        this.owner = owner;
    }
    _equip: Item[];
    _baglists: Item[];
    public get equips() {
        return this._equip;
    }

    /**除去身上穿的物件 */
    public get props() {
        return this._baglists;
    }

    /**剩余空间 */
    get freeCount() {
        return this.bagCnt - this._baglists.length;
    }

    /**取数据库 */
    public setItemDB(iitem: any) {
        for (let item of iitem) {
            let itemdata = new Item(this.owner.profession);
            item.bestPoint = DataUtil.jsonBy(item.bestPoint);
            item.affixInfo = DataUtil.jsonBy(item.affixInfo);
            for (let affix of item.affixInfo) {
                if (affix.code)
                    affix.attrtype = affix.code;
            }
            itemdata.setItem(item);
            this.pushItem(itemdata);
        }
        this.setData();
    }

    /**分离身上的装备 */
    public setData() {
        this.updateBagItems();
        this.owner.setPartDB();
    }

    /**刷新记录 这里有点计算问题，每次都重新算了，不太对，后修改*/
    updateBagItems() {
        this._equip = [];
        this._baglists = [];
        for (let equip of this.bagitems) {
            if (equip.state == EItemType.equip) {
                this._equip.push(equip);
            } else if (equip.state == EItemType.prop) {
                this._baglists.push(equip);
            }
        }
    }

    //初始化道具
    initGift() {
        let items = ProfessionConfig.instance.getGiftByProfession(this.owner.profession);
        let fujia: number[] = [];
        // let fujia = [EItemKey.itemid_3100, EItemKey.itemid_3101, EItemKey.itemid_3102, EItemKey.itemid_2102];
        // let fujia_equip = [105036];
        // items = items.concat(fujia);
        // items = items.concat(fujia_equip);
        for (let itemId of items) {
            if (fujia.indexOf(itemId) != -1) {
                let item = this.createItem(itemId, 1005);
                this.saveItemBagAndSQL(item);
            } else {
                let item = this.createItem(itemId, 1);
                this.saveItemBagAndSQL(item);
            }
        }
    }

    /**
     * 创建一个新的物品 铁匠铺除外,有属性的除外
     * 当物品是装备是 count 为品质
    */
    createItem(itemId: number, count: number): Item {
        let itemdata = new Item(this.owner.profession);
        itemdata.initItem(itemId, count);
        return itemdata;
    }

    /**
     * 自定义一个武器
     * 首充
     */
    createCustomItem(itemId: number) {
        let itemsc = new Item(this.owner.profession);
        itemsc.initItem(itemId, 1);
        itemsc.quality = EQuality.orange;
        itemsc.isfixd = true;
        itemsc.customBestPoint();
        switch (itemId) {
            case ESpecialEquipId.equip_hjcj:
            case ESpecialEquipId.equip_hjgy:
            case ESpecialEquipId.equip_hjlw:
                itemsc.customAffixAttr();
                break;
            case ESpecialEquipId.equip_tmy:
                itemsc.customAffixAttr_TMY();
                break;
            case ESpecialEquipId.equip_tlk:
                itemsc.customAffixAttr_TLK();
                break;
            default:
                return null;
        }
        itemsc.updateCustomAttr();
        return itemsc;
    }

    /**删除物品 */
    deleteItem(uid: number) {
        let sql = this.deleteSQL(uid);
        this.owner.saveItemSQL(sql);
        for (let item of this.bagitems) {
            if (item.uuid == uid) {
                let index = this.bagitems.indexOf(item);
                if (index != -1) this.bagitems.splice(index, 1);
                break;
            }
        }
        this.sendChangeMsg(uid, EBagChangeType.def);
    }

    /**填充装备 */
    addBagEquip(item: Item, isImportance: boolean = false) {
        /**添加到数据库 */
        if (this._baglists.length < this.bagCnt) {
            this.saveItemBagAndSQL(item);
            this.sendChangeMsg(0, EBagChangeType.add, 0, item);
            /**增加当前装备 */
            this.equipRecord[item.quality]++;
            this.owner.send(CmdID.s2c_equipRecord_change, {
                equipRecord: DataUtil.toJson(this.equipRecord, "{}")
            });
            this.owner.emit(PlayerEvent.HERO_GET_ITEM, item.itemId);
            return true;
        } else if (isImportance) {
            let awardList = [];
            let data: any = {};
            switch (item.itemId) {
                case ESpecialEquipId.equip_hjcj:
                case ESpecialEquipId.equip_hjgy:
                case ESpecialEquipId.equip_hjlw:
                    data = { itemId: EItemKey.itemid_3100, count: 1, quality: 5 };
                    awardList.push(data);
                    break;
                case ESpecialEquipId.equip_tmy:
                    data = { itemId: EItemKey.itemid_3101, count: 1, quality: 5 };
                    awardList.push(data);
                    break;
                case ESpecialEquipId.equip_tlk:
                    data = { itemId: EItemKey.itemid_3102, count: 1, quality: 5 };
                    awardList.push(data);
                    break;
                default:
                    break;
            }
            MailMgr.instance.sendSysMail(this.owner.roleid, "重要物品", "由于背包满了，在这里把装备补充到邮件中", awardList);
        }
        return false;
    }

    /**加入背包 */
    addBagItem(itemId: number, count: number, isImportance: boolean) {
        let iConfigs = ItemConfig.instance.getItemCfgById(itemId);
        if (iConfigs.type != EItemType.equip) {
            this.addBagItem1(itemId, count, iConfigs, isImportance);
            this.owner.emit(PlayerEvent.HERO_GET_ITEM, itemId);
        } else {
            /**领取的装备判断 ********重要勿删勿改******* */
            let itemequip = this.createCustomItem(itemId);
            if (itemequip) {
                return this.addBagEquip(itemequip, true);
            }
            else
                this.owner.send(CmdID.s2c_notice, { code: ErrorConst.ITEM_NOT_EXIST });
        }
        return true;
    }

    /**道具 */
    private addBagItem1(itemId: number, addCnt: number, iConfigs: IItemCFG, isImportance: boolean): void {
        for (let bagItem of this.bagitems) {
            if (bagItem.itemId == itemId && bagItem.count < iConfigs.m_maxcount) {/**增加物品不考虑uuid 还能往上加*/
                if (bagItem.count + addCnt <= iConfigs.m_maxcount) {/**一次性放的下 */
                    bagItem.count += addCnt;
                    /**物品变化 */
                    this.updateItemSQL(bagItem);
                    return this.sendChangeMsg(bagItem.uuid, EBagChangeType.change, bagItem.count);
                } else {
                    let offset = bagItem.count + addCnt - iConfigs.m_maxcount;
                    bagItem.count = iConfigs.m_maxcount;
                    this.sendChangeMsg(bagItem.uuid, EBagChangeType.change, bagItem.count);
                    /**物品变化 */
                    this.updateItemSQL(bagItem);
                    /**此处return重要，勿删**** */
                    return this.addBagItem1(itemId, offset, iConfigs, isImportance);
                }
            }
        }
        /**有新的物品 */
        if (this._baglists.length < this.bagCnt) {
            if (addCnt >= 1) {
                if (addCnt <= iConfigs.m_maxcount) {
                    let item = this.createItem(itemId, addCnt);
                    this.saveItemBagAndSQL(item);
                    this.sendChangeMsg(0, EBagChangeType.add, 0, item);
                } else {
                    let item1 = this.createItem(itemId, iConfigs.m_maxcount);
                    this.saveItemBagAndSQL(item1);
                    this.sendChangeMsg(0, EBagChangeType.add, 0, item1);
                    /**继续填充 */
                    let offset2 = addCnt - iConfigs.m_maxcount;
                    return this.addBagItem1(itemId, offset2, iConfigs, isImportance);
                }
            }
        } else if (isImportance) {
            let awardList = [];
            let data = { itemId: itemId, count: addCnt, quality: iConfigs.quality };
            awardList.push(data);
            MailMgr.instance.sendSysMail(this.owner.roleid, "重要物品", "由于背包满了，在这里把物品补充到邮件中", awardList);
        }
    }

    /**移除背包 */
    deleteBagItem(itemId: number, delCnt: number) {
        this.delBagItem(itemId, delCnt);
    }

    /**移除装备 */
    deleteBagEquip(uid: number) {
        this.deleteItem(uid);
    }

    /**从小到大排列 */
    getSmallCntByItemId(itemId: number) {
        let items = [];
        for (let item of this.bagitems) {
            if (item.itemId == itemId) {
                items.push(item);
            }
        }
        items.sort((a: Item, b: Item) => { return a.count - b.count });
        return items;
    }

    /**移除道具 */
    private delBagItem(itemId: number, deCnt: number): void {
        let itemlen = this.getSmallCntByItemId(itemId);
        if (itemlen.length > 0) {
            let item = itemlen[0];
            let ofxCnt = item.count - deCnt;
            if (ofxCnt > 0) {
                item.count = ofxCnt;
                /**物品变化 */
                this.sendChangeMsg(item.uuid, EBagChangeType.change, item.count);
                this.updateItemSQL(item);
                /**写记录 */
                if (this.checkProp(item.itemId)) {
                    let eRecord = { roleid: this.owner.roleid, serverid: this.owner.serverid, itemid: item.itemId, itemname: item.iConfigs.name, count: deCnt, totalCount: this.getCountByItemId(item.itemId) }
                    DB.setRecordProp(eRecord);
                }
                
                this.owner.emit(PlayerEvent.HERO_USE_ITEM, itemId);
            } else {
                /**写记录 */
                if (this.checkProp(item.itemId)) {
                    let eRecord = { roleid: this.owner.roleid, serverid: this.owner.serverid, itemid: item.itemId, itemname: item.iConfigs.name, count: item.count, totalCount: this.getCountByItemId(item.itemId) }
                    DB.setRecordProp(eRecord);
                }
                /**继续消耗 */
                this.deleteItem(item.uuid);
                this.delBagItem(itemId, Math.abs(ofxCnt));
            }
        }
    }

    /**校验道具 */
    checkProp(itemId: number) {
        return this.specialItemId.indexOf(itemId) != -1 ? true : false;
    }

    /**使用道具 */
    useItem(itemId: number, count: number, skillId: number = 0) {
        let item = this.getItemByItemId(itemId);
        if (count <= 0) return;
        let itemCnt = this.getCountByItemId(itemId);
        if (item) {
            if (itemCnt >= count) {
                let iConfigs = ItemConfig.instance.getItemCfgById(item.itemId);
                switch (iConfigs.stdmode) {
                    case EItemStdMode.books:/**书籍 */
                    case EItemStdMode.expendable:/**消耗品 */
                    case EItemStdMode.sundries:/**杂物 */
                    case EItemStdMode.tequan:/**特权 */
                        this.onItemUsed(item, count, skillId);
                        break;
                    case EItemStdMode.kuangshi:/**矿石 */
                        this.useKuangshi(item, count);
                        break;
                    case EItemStdMode.libao:
                    case EItemStdMode.yuanbao:
                    case EItemStdMode.zhenbao:
                        this.onLibaoUsed(item, count);
                        break;
                }

                this.owner.emit(PlayerEvent.HERO_USE_ITEM, itemId);
            } else {
                this.owner.send(CmdID.s2c_notice, {
                    code: ErrorConst.MATERIAL_NOT_ENOUGH
                });
            }
        } else {
            // SKLogger.log("背包暂无当前物品" + itemId);
        }
    }

    /**回收 */
    onReclaimEquips(uids: number[], type: number) {
        if (!uids) return Logger.debug("回收装备失败 系统错误");
        let reclaims = [];
        let stone = 0
        for (let uid of uids) {
            let item = this.getItemByUUId(uid);
            if (item && !item.isLock) {
                stone = item.itemBackStone;
                if (stone > 0)
                    this.addBagItem(EItemKey.itemid_103034, stone, true);
                this.deleteBagEquip(uid);
                let __data = { itemId: item.itemId, quality: item.quality };
                reclaims.push(__data);
            }
        }
        let money = this.calculateEquipMoney(reclaims);
        let retMoney = money;
        if (type == 2) {
            /**云游商城 */
            let bet = this.owner.roleyyshop.bet / 100;
            if (this.owner.prerogative.yyPriceup) bet *= 2;
            retMoney = Math.ceil(money * bet);
            this.owner.addMoney(ERichesType.Money, retMoney, "回收金币获取");
        } else {
            retMoney = Math.ceil(money);
            this.owner.addMoney(ERichesType.Money, retMoney, "回收金币获取");
        }
        this.updateBagItems();
        /**成功 */
        this.owner.send(CmdID.s2c_equips_reclaim, {
            code: ErrorConst.SUCCEED,
            money: retMoney,
            stone: stone
        })

        this.owner.emit(PlayerEvent.HERO_ITEM_RECYCLE);
        // SKLogger.debug("回收装备成功 获取金币: " + money);
    }

    /**计算装备价格 */
    calculateEquipMoney(equip_list: any) {
        let money = 0, sellbet = 1;
        for (let equip of equip_list) {
            let iConfigs = ItemConfig.instance.getItemCfgById(equip.itemId);
            switch (equip.quality) {
                case EQuality.green:
                    sellbet = 3;
                    break;
                case EQuality.bule:
                    sellbet = 6;
                    break;
                case EQuality.purple:
                    sellbet = 12;
                    break;
                case EQuality.orange:
                    sellbet = 30;
                    break;
            }
            money += iConfigs.sellprice * sellbet;
        }
        return money;
    }

    /**熔炼矿石 */
    private useKuangshi(item: Item, count: number) {
        if (count <= 0) return;
        this.deleteBagItem(item.itemId, count);
        if (item.iConfigs.hp && item.iConfigs.hp > 0) {/**熔炼 */
            this.owner.addShenQiMoney(item.iConfigs.hp * count);
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.SMELT_SUCCESS,
                value: item.iConfigs.hp * count
            });
        }
    }

    /**道具使用 */
    onItemUsed(item: Item, count: number, targetId: number = 0) {
        if (item.cooling > 0) return;
        switch (item.itemId) {
            case EItemKey.itemid_100010:
            case EItemKey.itemid_100011:
            case EItemKey.itemid_100012:
            case EItemKey.itemid_100013:
            case EItemKey.itemid_100014:
            case EItemKey.itemid_100015:
                item.doCooling(5);
                if (item.iConfigs.hp > 0) {
                    this.deleteBagItem(item.itemId, count);
                    this.owner.fightingRoom.takeHp(item.iConfigs.hp);
                }
                break;
            case EItemKey.itemid_100020:
            case EItemKey.itemid_100021:
            case EItemKey.itemid_100022:
            case EItemKey.itemid_100023:
            case EItemKey.itemid_100024:
            case EItemKey.itemid_100025:
                item.doCooling(5);
                if (item.iConfigs.mp > 0) {
                    this.deleteBagItem(item.itemId, count);
                    this.owner.fightingRoom.takeMp(item.iConfigs.mp);
                }
                break;
            case EItemKey.itemid_100030:
            case EItemKey.itemid_100031:
            case EItemKey.itemid_100032:
            case EItemKey.itemid_100033:
            case EItemKey.itemid_100034:
            case EItemKey.itemid_100035:
                item.doCooling(1);
                if (item.iConfigs.hp > 0) {
                    this.owner.fightingRoom.takeHp(item.iConfigs.hp);
                }
                if (item.iConfigs.mp > 0) {
                    this.owner.fightingRoom.takeMp(item.iConfigs.mp);
                }
                this.deleteBagItem(item.itemId, count);
                break;
            /**技能丹 */
            case EItemKey.itemid_103033:
                if (targetId != 0) {
                    let skillvo = this.owner.skillMgr.getSkillvoById(targetId);
                    if (skillvo.state != 1) {
                        this.owner.traceClient("技能未激活！");
                    } else {
                        let sCount = this.getCountByItemId(item.itemId);
                        if (sCount < count) {
                            this.owner.send(CmdID.s2c_notice, { code: ErrorConst.MATERIAL_NOT_ENOUGH });
                        } else {
                            skillvo.addExp(100 * count);
                            this.owner.send(CmdID.s2c_notice, {
                                code: ErrorConst.USE_SUCCESS
                            });
                            this.deleteBagItem(item.itemId, count);
                            /**技能抛 */
                            this.owner.sendSkillChange(skillvo);
                        }
                    }
                }
                break;
            /**洗练石 */
            case EItemKey.itemid_103034:
                break;
            /**古玩 */
            case EItemKey.itemid_103038:
                this.deleteBagItem(item.itemId, count);
                break;
            /**传送券 */
            case EItemKey.itemid_103036:
                this.deleteBagItem(item.itemId, count);
                break;
            /*-----------------技能书------------------------*/
            case EItemKey.itemid_104001:
                this.onParseSkill(ESkillId.skill_2001, item);
                break;
            case EItemKey.itemid_104002:
                this.onParseSkill(ESkillId.skill_3002, item);
                break;
            case EItemKey.itemid_104003:
                this.onParseSkill(ESkillId.skill_1001, item);
                break;
            case EItemKey.itemid_104004:
                this.onParseSkill(ESkillId.skill_3001, item);
                break;
            case EItemKey.itemid_104006:
                this.onParseSkill(ESkillId.skill_1002, item);
                break;
            case EItemKey.itemid_104007:
                this.onParseSkill(ESkillId.skill_3004, item);
                break;
            case EItemKey.itemid_104010:
                this.onParseSkill(ESkillId.skill_2002, item);
                break;
            case EItemKey.itemid_104012:
                this.onParseSkill(ESkillId.skill_3003, item);
                break;
            case EItemKey.itemid_104014:
                this.onParseSkill(ESkillId.skill_3007, item);
                break;
            case EItemKey.itemid_104015:
                this.onParseSkill(ESkillId.skill_1003, item);
                break;
            case EItemKey.itemid_104016:
                this.onParseSkill(ESkillId.skill_1007, item);
                break;
            case EItemKey.itemid_104017:
                this.onParseSkill(ESkillId.skill_1005, item);
                break;
            case EItemKey.itemid_104021:
                this.onParseSkill(ESkillId.skill_2005, item);
                break;
            case EItemKey.itemid_104022:
                this.onParseSkill(ESkillId.skill_2006, item);
                break;
            case EItemKey.itemid_104023:
                this.onParseSkill(ESkillId.skill_2007, item);
                break;
            case EItemKey.itemid_104025:
                this.onParseSkill(ESkillId.skill_3005, item);
                break;
            case EItemKey.itemid_104026:
                this.onParseSkill(ESkillId.skill_3006, item);
                break;
            case EItemKey.itemid_104028:
                this.onParseSkill(ESkillId.skill_2004, item);
                break;
            case EItemKey.itemid_104030:
                this.onParseSkill(ESkillId.skill_2003, item);
                break;
            case EItemKey.itemid_104033:
                this.onParseSkill(ESkillId.skill_1004, item);
                break;
            case EItemKey.itemid_104018:
                this.onParseSkill(ESkillId.skill_1006, item);
                break;
            case EItemKey.itemid_104027:
                this.onParseSkill(ESkillId.skill_3008, item);
                break;
            /**挖矿体力  */
            case EItemKey.itemid_103044:
                if (item.iConfigs.hp) {
                    let offset = 1000 - this.owner.playerEnergy.value;
                    if (offset > 0) {
                        let useCnt = Math.ceil(offset / item.iConfigs.hp);
                        if (useCnt > count) {
                            this.owner.addEnergy(item.iConfigs.hp * count);
                            this.deleteBagItem(item.itemId, count);
                        } else {
                            this.owner.addEnergy(item.iConfigs.hp * useCnt);
                            this.deleteBagItem(item.itemId, useCnt);
                        }
                        this.owner.send(CmdID.s2c_energy_change, { value: this.owner.playerEnergy.value });
                    } else {
                        this.owner.send(CmdID.s2c_notice, { code: ErrorConst.SUCCEED });
                    }
                }
                break;
            /**武器兑换券 */
            case EItemKey.itemid_3100:
            case EItemKey.itemid_3101:
            case EItemKey.itemid_3102:
                this.addEquipByItemProp(item.itemId);
                break;
            /**------------------特权卡----------------------- */
            case EItemKey.itemid_3200:
                this.onPrasePrerogative(item, ePrerogativeType.zhanshen, ePrerogativeTime.seven);
                break;
            case EItemKey.itemid_3201:
                this.onPrasePrerogative(item, ePrerogativeType.zhanshen, ePrerogativeTime.month);
                break;
            case EItemKey.itemid_3202:
                this.onPrasePrerogative(item, ePrerogativeType.zhanshen, ePrerogativeTime.month_3);
                break;
            case EItemKey.itemid_3203:
                this.onPrasePrerogative(item, ePrerogativeType.huishou, ePrerogativeTime.seven);
                break;
            case EItemKey.itemid_3204:
                this.onPrasePrerogative(item, ePrerogativeType.huishou, ePrerogativeTime.month);
                break;
            case EItemKey.itemid_3205:
                this.onPrasePrerogative(item, ePrerogativeType.huishou, ePrerogativeTime.month_3);
                break;
            case EItemKey.itemid_3206:
                this.onPrasePrerogative(item, ePrerogativeType.mianguanggao, ePrerogativeTime.seven);
                break;
            case EItemKey.itemid_3207:
                this.onPrasePrerogative(item, ePrerogativeType.mianguanggao, ePrerogativeTime.month);
                break;
            case EItemKey.itemid_3208:
                this.onPrasePrerogative(item, ePrerogativeType.mianguanggao, ePrerogativeTime.month_3);
                break;
            case EItemKey.itemid_3209:
                this.onPrasePrerogative(item, ePrerogativeType.mianguanggao, ePrerogativeTime.yongjiu);
                break;
            /**托管 */
            case EItemKey.itemid_3210:
                this.onPrasePrerogative(item, ePrerogativeType.tuoguan, ePrerogativeTime.seven);
                break;
            case EItemKey.itemid_3211:
                this.onPrasePrerogative(item, ePrerogativeType.tuoguan, ePrerogativeTime.month);
                break;
            case EItemKey.itemid_3212:
                this.onPrasePrerogative(item, ePrerogativeType.tuoguan, ePrerogativeTime.month_3);
                break;
            case EItemKey.itemid_3213:
                this.onPrasePrerogative(item, ePrerogativeType.tuoguan, ePrerogativeTime.yongjiu);
                break;
        }
    }

    /**特权卡的使用 */
    onPrasePrerogative(item: Item, type: ePrerogativeType, time: ePrerogativeTime) {
        /**删除物品 */
        this.deleteBagItem(item.itemId, 1);
        this.owner.onRechargePrerogative(type, time);
    }

    /**礼包使用 */
    onLibaoUsed(item: Item, usecount: number) {
        let itemId = item.iConfigs.id;
        let libao_configs = LibaoConfig.instance.getLibaoCfgById(String(itemId));
        let canused = this.checkUsed(libao_configs);
        if (canused) {
            this.exchangeLibao(libao_configs, usecount);
            this.deleteBagItem(item.itemId, usecount);
            this.owner.send(CmdID.s2c_use_libao, { itemId: itemId, count: usecount });
        }
    }

    /**检查使用条件 */
    checkUsed(libao: ILibaoCFG) {
        if (this.owner.level >= libao.lev) {
            return true;
        } else {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.LV_NOT_ENOUGH
            });
            Logger.debug("等级不够不成功");
            return false;
        }
    }

    /**礼包 multi 一次性使用个数*/
    exchangeLibao(libao: ILibaoCFG, multi: number = 1) {
        if (libao.gold > 0) {
            this.owner.addMoney(ERichesType.Money, libao.gold * multi, "礼包获取 礼包：" + libao.name);
        }
        if (libao.yuanbao > 0) {
            this.owner.addMoney(ERichesType.Yuanbao, libao.yuanbao * multi, "礼包获取 礼包：" + libao.name);
        }
        if (libao.item1) {
            this.addBagItem(libao.item1, libao.num1 * multi, true);
        }
        if (libao.item2) {
            this.addBagItem(libao.item2, libao.num2 * multi, true);
        }
        if (libao.item3) {
            this.addBagItem(libao.item3, libao.num3 * multi, true);
        }
        if (libao.item4) {
            this.addBagItem(libao.item4, libao.num4 * multi, true);
        }
        if (libao.item5) {
            this.addBagItem(libao.item5, libao.num5 * multi, true);
        }
    }

    /**解析技能 */
    onParseSkill(id: number, item: Item) {
        let skillvo: Skill = this.owner.skillMgr.getSkillvoById(id);
        if (item.iConfigs.profession != this.owner.profession)
            return Logger.debug(`使用角色不相符`);
        if (skillvo.state == 0) {
            /**删除物品 */
            this.owner.skillMgr.onActive(skillvo.baseId);

            this.deleteBagItem(item.itemId, 1);
            this.owner.sendSkillChange(skillvo);
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.SKILL_UP_SUCCESS
            });
            this.owner.emit(PlayerEvent.HERO_SKILL_CHANGE);
        } else {
            Logger.debug(`技能已经激活了`);
        }
    }

    /**
     * 通过道具来获取特殊武器 
     * itemid 武器券
    */
    addEquipByItemProp(itemid: number) {
        if (this.freeCount >= 1) {
            let eItemId = 0;
            switch (itemid) {
                case EItemKey.itemid_3100:
                    eItemId = this.owner.getSCEquip();
                    break;
                case EItemKey.itemid_3101:
                    eItemId = ESpecialEquipId.equip_tmy;
                    break;
                case EItemKey.itemid_3102:
                    eItemId = ESpecialEquipId.equip_tlk;
                    break;
            }
            /**领取的装备判断 ********重要勿删勿改******* */
            let itemequip = this.createCustomItem(eItemId);
            if (itemequip)
                this.addBagEquip(itemequip);
            this.deleteBagItem(itemid, 1);
        } else {
            this.owner.send(CmdID.s2c_notice, { code: ErrorConst.BAG_NOT_ENOUGH });
        }
    }

    /**分解 */
    decompoundItem(itemId: number, count: number = 1) {
        let iCount = this.getCountByItemId(itemId);
        if (iCount >= count) {
            let iConfigs = ItemConfig.instance.getItemCfgById(itemId);
            if (iConfigs) {
                this.deleteBagItem(itemId, count);
                if (iConfigs.sellprice && iConfigs.sellprice > 0) {/**金币 */
                    this.owner.addMoney(ERichesType.Money, iConfigs.sellprice, "分解获取");
                }
                if (iConfigs.sellyunabao && iConfigs.sellyunabao > 0) {/**元宝 */
                    this.owner.addMoney(ERichesType.Yuanbao, iConfigs.sellyunabao, "分解获取");
                }
                if (iConfigs.decompose && iConfigs.decompose.length > 0) {
                    /**分解获得 */
                    this.addBagItem(iConfigs.decompose[0], iConfigs.decompose[1] * count, true);
                }
            }
        } else {
            this.owner.traceClient("分解物品数量不足");
        }
    }

    /**背包拓展 */
    expendBag(type: number) {
        if (this.bagCnt >= this.maxBagCnt) return;
        let coinCost = 10000 * (1 + this.owner.dayMap.bagCoins);
        switch (type) {
            case 1:/**广告 */
                if (this.owner.dayMap.videoBag < this.owner.dayMap.videoBagMax) {
                    this.owner.dayMap.updateDayMap(EDayMapType.videoBag);
                    this.exCnts++;
                    this.bagCnt += 3;
                    if (this.bagCnt > this.maxBagCnt) this.bagCnt = this.maxBagCnt;
                    this.owner.send(CmdID.s2c_bag_expend, {
                        code: ErrorConst.SUCCEED,
                        count: this.bagCnt,
                        exCnts: this.exCnts
                    });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.TIME_USE_UP
                    });
                }
                break;
            case 2:/**金币 */
                if (this.owner.money >= coinCost) {
                    this.exCnts++;
                    this.bagCnt += 3;
                    this.owner.dayMap.updateDayMap(EDayMapType.moneyexbag);
                    this.owner.addMoney(ERichesType.Money, -1 * coinCost, "背包拓展");
                    if (this.bagCnt > this.maxBagCnt) this.bagCnt = this.maxBagCnt;
                    this.owner.send(CmdID.s2c_bag_expend, {
                        code: ErrorConst.SUCCEED,
                        count: this.bagCnt,
                        exCnts: this.exCnts
                    });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GOLD_NOT_ENOUGH
                    });
                }
                break;
            case 3:/**元宝购买 */
                if (this.owner.yuanbao >= 100) {
                    this.exCnts++;
                    this.bagCnt += 3;
                    this.owner.addMoney(ERichesType.Yuanbao, -1 * 100, "元宝背包拓展");
                    if (this.bagCnt > this.maxBagCnt) this.bagCnt = this.maxBagCnt;
                    this.owner.send(CmdID.s2c_bag_expend, {
                        code: ErrorConst.SUCCEED,
                        count: this.bagCnt,
                        exCnts: this.exCnts
                    });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GOLD_NOT_ENOUGH
                    });
                }
                break;
            case 4:/**人名币购买 */
                this.exCnts += 3 * 20;
                this.bagCnt += 60;
                this.owner.dayMap.updateDayMap(EDayMapType.rmbBagex);
                if (this.bagCnt > this.maxBagCnt) this.bagCnt = this.maxBagCnt;
                this.owner.send(CmdID.s2c_bag_expend, {
                    code: ErrorConst.SUCCEED,
                    count: this.bagCnt,
                    exCnts: this.exCnts
                });
                break;
        }
    }

    /**洗练 */
    _remakeAffix: any = { uid: 0, affixs: [] };
    remakeEquipByUid(uid: number, locks: number[]) {
        let item = this.getItemByUUId(uid);
        if (item) {
            if (locks && locks.length == item.affixCnt) {
                this.owner.send(CmdID.s2c_notice, { code: ErrorConst.NO_AFFIX_REMAKE });
                return;
            }
            let costs = this.getRemakeCostCfg(item, locks);
            let stone = this.getCountByItemId(EItemKey.itemid_103034);
            if (stone < costs.stone) {
                this.owner.send(CmdID.s2c_notice, { code: ErrorConst.MATERIAL_NOT_ENOUGH });
            } else if (this.owner.money < costs.money) {
                this.owner.send(CmdID.s2c_notice, { code: ErrorConst.GOLD_NOT_ENOUGH });
            } else {
                this.deleteBagItem(EItemKey.itemid_103034, costs.stone);
                this.owner.addMoney(ERichesType.Money, -1 * costs.money, "洗练消耗");

                this._remakeAffix = {};
                let affixs = item.createAffixs(locks);
                this._remakeAffix.uid = uid;
                this._remakeAffix.affixs = affixs;
                /**搞一个算战力的 */
                let itemnew = new Item(this.owner.profession);
                itemnew.setItem(item.toObj());
                itemnew.reset();
                itemnew.affixInfo = affixs;
                itemnew.setBaseAttr();
                itemnew.setAffixAttr();
                let combat = itemnew.getFighting();
                item.costStone += costs.stone;
                this.updateItemStoneSQL(item);
                this.owner.xilian++;
                this.owner.send(CmdID.s2c_equip_remake, {
                    affixInfo: affixs,
                    combat: combat,
                    costStone: item.costStone,
                    xilian: this.owner.xilian
                });
                this.owner.emit(PlayerEvent.HERO_XI_LIAN_CHANGE);
            }
        }
    }

    /**刷新锁定 */
    updateItemLocker(uuid: number, type: number) {
        let item = this.getItemByUUId(uuid);
        if (item) item.isLock = type == 1 ? true : false;
        /**刷新背包 */
        let sql = `UPDATE cy_item SET isLock = ${type} WHERE uuid = ${uuid};`;
        this.owner.send(CmdID.s2c_lock_equip, {
            uuid: uuid,
            type: type
        });

        this.owner.saveItemSQL(sql);
    }

    /**献祭 */
    /**玩家开始献祭 */
    _tempBest: number[] = [];
    xianji(uid: number, uid2: number, xjtype: number) {
        this._tempBest = [];
        let equip1 = this.getItemByUUId(uid);
        if (!equip1) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.NO_REWARD
            });
            return
        }
        let equip2 = this.getItemByUUId(uid2);
        if (!equip2) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.NO_REWARD
            });
        }

        let ofPoint = equip2.nonPoint - equip1.nonPoint;
        if (xjtype == 1) ofPoint = Math.ceil(ofPoint / 2);

        let picks = Math.ceil(4 * Math.random());

        this._tempBest = equip1.bestPoint.slice(0, equip1.bestPoint.length);
        for (let p = 0; p < picks; p++) {
            if (ofPoint >= 1) {
                let point = ofPoint * Math.random();
                let randPoint = Math.ceil(point);
                if (randPoint > ofPoint) randPoint = ofPoint;
                ofPoint = ofPoint - randPoint;
                let index = Math.floor(Math.random() * 4);
                if (!this._tempBest[index]) this._tempBest[index] = 0;
                this._tempBest[index] += randPoint;
            }
        }

        /**献祭完成 */
        this.owner.send(CmdID.s2c_equip_xianji, {
            xianji: this._tempBest
        });
    }

    /**保存献祭 */
    saveXianji(uid: number) {
        if (!this._tempBest) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.NO_REWARD
            });
            return;
        }
        let equip1 = this.getItemByUUId(uid);
        if (!equip1) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.NO_REWARD
            });
            return;
        }
        let index = this.bagitems.indexOf(equip1);
        if (index != -1) {
            equip1.bestPoint = this._tempBest;
            this.bagitems[index] = equip1;
        }

        this.owner.send(CmdID.s2c_equip_xianji_save, {
            uid: equip1.uuid,
            bestPoint: equip1.bestPoint
        });

        this.updateItemBestPointSQL(equip1);
        if (equip1.state == 2)
            this.owner.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
    }

    /**合成 */
    fuseItem(itemId: number, count: number) {
        let fuseCfg = FuseConfig.instance.getFuseCfgByItemId(itemId);
        if (fuseCfg) {
            let needitem = fuseCfg.needitem1[0];
            let needitemCnt = fuseCfg.needitem1[1] * count;
            let needMoney = fuseCfg.costgold * count;
            let itemCnt = this.getCountByItemId(needitem);
            if (this.owner.money >= needMoney) {
                if (itemCnt >= needitemCnt) {
                    this.deleteBagItem(needitem, needitemCnt);
                    this.addBagItem(itemId, count, true);
                    this.owner.addMoney(ERichesType.Money, -1 * needMoney, "合成消耗");
                    this.owner.send(CmdID.s2c_item_fuse, {});
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.MATERIAL_NOT_ENOUGH
                    });
                }
            } else {
                this.owner.send(CmdID.s2c_notice, {
                    code: ErrorConst.GOLD_NOT_ENOUGH
                });
            }
        } else {
            Logger.debug("系统错误，未找到合成物品");
        }
    }

    /**保存属性 */
    saveRemakeEquip(uid: number) {
        if (this._remakeAffix && this._remakeAffix.uid == uid) {
            let item = this.getItemByUUId(uid);
            item.remakeAffixData(this._remakeAffix.affixs)
            this.updateItemAffixSQL(item);
            this.owner.send(CmdID.s2c_equip_remake_save, {
                item: item.toObj()
            });
            this.owner.skillMgr.checkSkillLv();
        } else {
            // Logger.log("saveRemakeEquip");
        }
    }

    /**初始化消耗 */
    getRemakeCostCfg(item: Item, locks: number[]) {
        let quality = item.quality;
        let lv = Math.floor(item.iConfigs.needlevel / 10);
        if (lv < 1) lv = 1;
        let costCoin = 0;
        let costStone = 0;
        for (let cost of REMAKE_COSTCFG) {
            if (cost.lv == lv) {
                switch (quality) {
                    case EQuality.green:
                        costStone = cost.quality[0];
                        break;
                    case EQuality.bule:
                        costStone = cost.quality[1];
                        break;
                    case EQuality.purple:
                        costStone = cost.quality[2];
                        break;
                    case EQuality.orange:
                        costStone = cost.quality[3];
                        break;
                }
                costCoin = cost.cost;
            }
        }
        /**消耗石头 */
        let lockCnt = locks.length;
        if (lockCnt == 0) lockCnt = 1;
        else lockCnt *= 2;
        costStone *= lockCnt;

        // if (locks.length > 0)
        //     costStone *= (locks.length + 1);
        return { stone: costStone, money: costCoin };
    }

    /**保存道具到背包 */
    saveItemBagAndSQL(item: Item) {
        /**添加到数据库 */
        let sqls = this.createSQL(item);
        this.owner.saveItemSQL(sqls);
        this.pushItem(item);
        this.updateBagItems();
    }

    /**创建道具 */
    createSQL(item: Item) {
        let savedata: any = {};
        savedata.roleid = this.owner.roleid;
        savedata.uuid = item.uuid;
        savedata.itemId = item.itemId;
        savedata.count = item.count;
        savedata.quality = item.quality;
        savedata.bestPoint = DataUtil.toJson(item.bestPoint, "{}");
        savedata.costStone = item.costStone;
        savedata.isLock = item.isLock ? 1 : 0;
        savedata.state = item.state;
        savedata.part = item.part;
        savedata.isfixd = item.isfixd ? 1 : 0;
        savedata.itemname = item.iConfigs.name;
        savedata.affixInfo = DataUtil.toJson(item.affixInfo, "{}");
        let numlist = ['roleid', 'uuid', 'itemId', 'count', 'part', 'isLock', 'isfixd', 'state', 'quality', 'costStone'];
        let updatestr = '';
        for (const key in savedata) {
            if (numlist.indexOf(key) == -1) {
                updatestr += `${key} = '${savedata[key]}',`
            } else {
                updatestr += `${key} = ${savedata[key]},`
            }
        }
        updatestr = updatestr.substr(0, updatestr.length - 1);
        return `INSERT INTO cy_item SET create_date = NOW(), ${updatestr};`;
    }

    /**删除SQL */
    deleteSQL(uuid: number) {
        this.setRecord(uuid);
        return `DELETE FROM cy_item WHERE uuid=${uuid};`;
    }
    /**保存记录 */
    setRecord(uuid: number) {
        let item = this.getItemByUUId(uuid);
        if (!item) return;
        let savedata: any = {};
        savedata.roleid = this.owner.roleid;
        savedata.uuid = item.uuid;
        savedata.itemId = item.itemId;
        savedata.count = item.count;
        savedata.quality = item.quality;
        savedata.bestPoint = DataUtil.toJson(item.bestPoint, "{}");
        savedata.costStone = item.costStone;
        savedata.isLock = item.isLock ? 1 : 0;
        savedata.state = item.state;
        savedata.part = item.part;
        savedata.isfixd = item.isfixd ? 1 : 0;
        savedata.itemname = item.iConfigs.name;
        savedata.affixInfo = DataUtil.toJson(item.affixInfo, "{}");
        let numlist = ['roleid', 'uuid', 'itemId', 'count', 'part', 'isLock', 'isfixd', 'state', 'quality', 'costStone'];
        let updatestr = '';
        for (const key in savedata) {
            if (numlist.indexOf(key) == -1) {
                updatestr += `${key} = '${savedata[key]}',`
            } else {
                updatestr += `${key} = ${savedata[key]},`
            }
        }
        updatestr = updatestr.substr(0, updatestr.length - 1);
        let sql = `INSERT INTO cy_record_item SET create_date = NOW(), serverid = ${this.owner.serverid} , ${updatestr};`;
        DB.setRecordItem(sql);
    }

    /**刷新背包 */
    updateItemSQL(bagItem: Item) {
        let sql = `UPDATE cy_item SET count = ${bagItem.count} WHERE uuid = ${bagItem.uuid};`;
        this.owner.saveItemSQL(sql);
    }

    /**刷新背包 */
    updateItemStoneSQL(bagItem: Item) {
        let sql = `UPDATE cy_item SET costStone = ${bagItem.costStone} WHERE uuid = ${bagItem.uuid};`;
        this.owner.saveItemSQL(sql);
    }

    /**刷新属性 */
    updateItemAffixSQL(bagItem: Item) {
        let affix = DataUtil.toJson(bagItem.affixInfo, "{}");
        let sql = `UPDATE cy_item SET affixInfo = '${affix}' WHERE uuid = ${bagItem.uuid};`;
        this.owner.saveItemSQL(sql);
    }

    /**刷新极品点 */
    updateItemBestPointSQL(bagItem: Item) {
        let bestPoint = DataUtil.toJson(bagItem.bestPoint, "{}");
        let sql = `UPDATE cy_item SET bestPoint = '${bestPoint}' WHERE uuid = ${bagItem.uuid};`;
        this.owner.saveItemSQL(sql);
    }

    /**刷新状态 */
    updateItemStateSQL(bagItem: Item) {
        this.updateBagItems();
        let sql = `UPDATE cy_item SET state = ${bagItem.state} , part = ${bagItem.part} WHERE uuid = ${bagItem.uuid};`;
        this.owner.saveItemSQL(sql);
    }

    /**道具改变 */
    sendChangeMsg(uid: number, type: number, value?: number, itemI?: Item) {
        let result = {
            uuid: uid,
            type: type,
            value: value,
            item: {}
        }
        if (itemI) {
            result.item = itemI.toObj()
        }
        this.owner.send(CmdID.s2c_bagitem_change, result);
    }

    /**回客户端 */
    baglistObj() {
        let list = [];
        for (let bagitem of this.bagitems) {
            list.push(bagitem.toObj());
        }
        return list;
    }

    /**转化结构 */
    toObj() {
        let result = {
            bagCnt: this.bagCnt,
            maxBagCnt: this.maxBagCnt,
            baglist: this.baglistObj(),
            bagExCnt: this.bagExCnt,
            exCnts: this.exCnts,
            equipRecord: DataUtil.toJson(this.equipRecord, "{}")
        }
        return result;
    }
}