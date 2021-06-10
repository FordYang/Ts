import { ICiZhuiCFG } from "../../config/cfg/CiZhuiCFG";
import { CiZhuiConfig } from "../../config/CiZhuiConfig";
import { ItemConfig } from "../../config/ItemConfig";
import { EQuality } from "../../consts/EGame";
import { eColorPool, EItemType } from "../../consts/EItem";
import { EAttrType, ECiZhuiType, EProfessionType } from "../../consts/ERole";
import { IAffixAttr, IItem } from "./Bag";
import GameUtil from "../../core/GameUtil";
import CFGAttachAttr from "../attachAttr/CFGAttachAttr";
import { EquipCiZhuiConfig } from "../../config/EquipCiZhuiConfig";
import { IEquipCiZhuiCFG } from "../../config/cfg/EquipCiZhuiCFG";

/**物品(含装备) */
export default class Item extends CFGAttachAttr {
    /*唯一id */
    uuid: number;
    /**物品id */
    itemId: number;
    /**物品数量 */
    count: number;
    /**品质 */
    quality: number;
    /**冷却 */
    cooling: number;
    /**物品位置 */
    part: number;
    /**附加词缀 */
    affixCnt: number;
    /**附加词缀 */
    affixInfo: IAffixAttr[];
    /**极品点 */
    bestPoint: number[];
    /**消耗洗练石 */
    costStone: number;
    /**锁定 */
    isLock: boolean;
    /**状态 */
    state: number;
    /**固定属性 */
    isfixd: boolean;
    /**战力 */
    combat: number;
    /**特权标记 */
    tequan: boolean;
    constructor(profession: EProfessionType) {
        super(profession);

        this.uuid = 0;
        this.itemId = 0;
        this.count = 0;
        this.quality = 0;
        this.cooling = 0;
        this.part = 0;
        this.affixCnt = 0;
        this.affixInfo = [];
        this.bestPoint = [];
        this.costStone = 0;
        this.isLock = false;
        this.state = 1;
        this.isfixd = false;
        this.tequan = false;
        this.combat = 0;
    }

    /**配置 */
    get iConfigs() {
        return ItemConfig.instance.getItemCfgById(this.itemId);
    }

    /**极品 */
    get isnonsuch() {
        for (let nonsuch of this.bestPoint) {
            if (nonsuch > 0) return true;
        }
        return false;
    }

    /**当前极品点 */
    get nonPoint() {
        let point = 0;
        for (let nonsuch of this.bestPoint) {
            if (nonsuch > 0) {
                point += nonsuch;
            }
        }
        return point;
    }
    /**是否是特殊属性 */
    get isSpecialAffix() {
        for (let affix of this.affixInfo) {
            let cizhuiCfg = CiZhuiConfig.instance.getCiZhuiCfgById(affix.code);
            if ((cizhuiCfg && cizhuiCfg.type == ECiZhuiType.SPECIAL) || affix.code == EAttrType.LUCKY)
                return true;
        }
        return false;
    }

    /**返还洗练石 */
    get itemBackStone(): number {
        return this.is3Affix ? this.costStone : 0;
    }

    /**神赐属性 */
    get is3Affix() {
        if (this.quality < EQuality.purple) return false;
        if (this.iConfigs.type != EItemType.equip) return false;
        let qualitys = 0;
        let quality = eColorPool.white;
        for (let affix of this.affixInfo as IAffixAttr[]) {
            if (affix.code != affix.id) {
                quality = this.getAffixColor(affix.id, affix.minV, affix.maxV);
            } else {
                quality = eColorPool.orange;
            }
            if (quality == eColorPool.orange) qualitys++;
        }
        return qualitys >= 3 ? true : false;
    }

    /**全技能数量 */
    get getAllSkillCnt() {
        let len = 0;
        for (let affix of this.affixInfo) {
            if (affix.code == EAttrType.SKILL_ALL) {
                len += affix.minV;
            }
        }
        return len;
    }

    /**技能 */
    get special() {
        let code = 0;
        for (let affix of this.affixInfo) {
            let cizhuiCfgs = CiZhuiConfig.instance.getCiZhuiCfgById(affix.code);
            if (cizhuiCfgs && cizhuiCfgs.type == ECiZhuiType.SPECIAL && affix.code != EAttrType.SKILL_ALL) {
                code = Number(cizhuiCfgs.code);
                break;
            }
        }
        return code;
    }

    /**洗脸池子 */
    private get affixsPool() {
        let level = Math.floor(this.iConfigs.needlevel / 10) * 10 + 10;
        if (this.iConfigs.needlevel % 10 == 0) level -= 10;
        if (this.iConfigs.profession == 0)
            return EquipCiZhuiConfig.instance.getAffixCfgByLevel(this.profession, this.quality, level, this.iConfigs.stdmode);
        else
            return EquipCiZhuiConfig.instance.getAffixCfgByLevel(this.iConfigs.profession, this.quality, level, this.iConfigs.stdmode);
    }

    /**冷却时间 time /s */
    doCooling(time: number) {
        this.cooling = time;
        setTimeout(() => { this.cooling = 0; }, time * 1000);
    }

    /**创建ITEM */
    initItem(itemId: number, count: number) {
        this.itemId = itemId;
        this.uuid = GameUtil.nextId();
        this.cooling = 0;
        if (this.iConfigs.type == EItemType.equip) {
            this.count = 1;
            this.part = this.iConfigs.stdmode;
            this.setQuality(count);
            this.setBaseAttr();
            this.setBestPoint(this.quality);
            /**填充词缀 */
            this.setAffixCnt(this.quality);
            /**设置词缀 */
            this.setAffixData();

            this.combat = this.getFighting();
        } else {
            this.count = count;
            this.quality = this.iConfigs.quality;
        }
    }
    /**设置ITEM */
    setItem(iitem: IItem) {
        this.uuid = iitem.uuid;
        this.itemId = iitem.itemId;
        this.count = iitem.count;
        this.quality = iitem.quality;
        this.cooling = iitem.cooling;
        this.part = iitem.part;
        this.affixInfo = iitem.affixInfo;
        this.affixCnt = iitem.affixInfo.length;
        this.bestPoint = iitem.bestPoint;
        this.costStone = iitem.costStone;
        this.isLock = iitem.isLock;
        this.state = iitem.state;
        this.isfixd = iitem.isfixd;
        /**基础属性 */
        this.setBaseAttr();
        /**高级属性 */
        this.setAffixAttr();
        /**战力 */
        this.combat = this.getFighting();
    }
    /**设置品质 */
    setQuality(quality: number = 0) {
        if (quality != 0) {
            this.quality = quality;
        } else {
            this.quality = this.iConfigs.quality;
        }
    }
    /**基础属性 */
    setBaseAttr() {
        this.addCFG(this.iConfigs);
        /**极品属性 */
        this.setBestPointAttr();
    }
    /**设置词缀*/
    setAffixData() {
        this.affixInfo = this.createAffixs([]);

        this.setAffixAttr();
    }
    /**设置附加词缀属性加成 */
    setAffixAttr() {
        for (let affix of this.affixInfo) {
            let minmax = this.getIsAttackType(affix.code)
            if (minmax) {
                this.updateAttrValue(affix);
            } else {
                this.addAttrValue(affix.code, affix.maxV);
            }
        }
    }
    /**更新最大最小值 */
    private updateAttrValue(affix: IAffixAttr) {
        switch (affix.code) {
            case EAttrType.ZS:
                this.addAttrValue(EAttrType.MIN_ZS, affix.minV);
                this.addAttrValue(EAttrType.MAX_ZS, affix.maxV);
                break;
            case EAttrType.FS:
                this.addAttrValue(EAttrType.MIN_FS, affix.minV);
                this.addAttrValue(EAttrType.MAX_FS, affix.maxV);
                break;
            case EAttrType.DS:
                this.addAttrValue(EAttrType.MIN_DS, affix.minV);
                this.addAttrValue(EAttrType.MAX_DS, affix.maxV);
                break;
            case EAttrType.AC:
                this.addAttrValue(EAttrType.MIN_AC, affix.minV);
                this.addAttrValue(EAttrType.MAX_AC, affix.maxV);
                break;
        }
    }

    /**重新随机 */
    createAffixs(lockIndexs: number[]) {
        let lockAffixs = [];
        let newAffixs: IAffixAttr[] = [];
        /**锁定 */
        for (let lock of lockIndexs) {
            lockAffixs[lock] = this.affixInfo[lock];
        }
        /**重新随机 */
        for (let i = 0; i < this.affixCnt; i++) {
            let affixsPool = this.randomAffixs(lockIndexs, newAffixs);
            let index = this.getRandomByGailv(affixsPool);
            let attrValue = this.getAffixValue(affixsPool[index]);
            newAffixs.push(attrValue);
        }
        /**设计有问题,后面修改 */
        for (let lock of lockIndexs) {/**锁的位置不变 */
            newAffixs[lock] = lockAffixs[lock];
        }
        return newAffixs;
    }
    /**通过概率获取code */
    private getRandomByGailv(affixsPool: any) {
        let gailv = [];
        for (let affixs of affixsPool) {
            gailv.push(affixs.gailv);
        }
        return GameUtil.getRandomIndex(gailv);
    }
    /**随即池子 */
    private randomAffixs(lockIndexs: number[], newAffixs: IAffixAttr[]) {
        let special = 0;
        let lockAffixs = [];
        let affixPool = this.affixsPool;
        let affixUsed: any = {};
        /**锁定 */
        for (let lock of lockIndexs) {
            lockAffixs[lock] = this.affixInfo[lock];
        }
        /**锁着的 */
        for (let cizhui of lockAffixs) {
            if (cizhui) {
                let cizhuiCfg: ICiZhuiCFG = CiZhuiConfig.instance.getCiZhuiSO(cizhui.code);
                if (cizhuiCfg && cizhuiCfg.type == ECiZhuiType.SPECIAL) {
                    special++;
                }
                affixUsed[cizhui.code]++;
            }
        }
        /**已经洗练 */
        for (let newA of newAffixs) {
            if (newA) {
                let cizhuiCfg: ICiZhuiCFG = CiZhuiConfig.instance.getCiZhuiSO(newA.code);
                if (cizhuiCfg && cizhuiCfg.type == ECiZhuiType.SPECIAL) {
                    special++;
                }
                affixUsed[newA.code]++;
            }
        }
        /**去掉特殊词缀 */
        if (special > 0) {
            for (let i = affixPool.length - 1; i >= 0; i--) {
                let attrtype = affixPool[i].attrtype;
                let cizhuiCfg = CiZhuiConfig.instance.getCiZhuiCfgById(attrtype);
                if (cizhuiCfg && cizhuiCfg.type == ECiZhuiType.SPECIAL) {
                    affixPool.splice(i, 1);
                }
            }
        }
        /**去掉到达上限的词缀 */
        for (let i = affixPool.length - 1; i >= 0; i--) {
            let attrtype = affixPool[i].attrtype;
            let attrused = affixUsed[attrtype];
            let cizhuiCfg = EquipCiZhuiConfig.instance.getAffixCfgById(attrtype);
            if (cizhuiCfg) {
                if (attrused && attrused >= cizhuiCfg.maxnum)
                    affixPool.splice(i, 1);
            }
        }
        return affixPool;
    }
    /**随机值 */
    private getAffixValue(equipCizhuiCfg: IEquipCiZhuiCFG) {
        let minValue: number = 0;
        let maxValue: number = 0;
        if (equipCizhuiCfg.vtype == 1) {
            /**正常值 */
            let isAtkType = this.getIsAttackType(equipCizhuiCfg.attrtype);
            if (isAtkType) {
                /**双重 */
                maxValue = Math.ceil(GameUtil.random(1, equipCizhuiCfg.maxvalue));
                minValue = Math.ceil(GameUtil.random(0, maxValue));
            } else {
                /**普通 */
                minValue = maxValue = Math.ceil(GameUtil.random(1, equipCizhuiCfg.maxvalue));
            }
        } else {
            /**百分比 */
            let randValue = GameUtil.random(1, equipCizhuiCfg.maxvalue * 100) / 100;
            minValue = maxValue = Number(randValue.toFixed(2));
        }
        /**传输 */
        let affix: IAffixAttr = {
            id: equipCizhuiCfg.id,
            code: equipCizhuiCfg.attrtype,
            minV: minValue,
            maxV: maxValue,
            percent: equipCizhuiCfg.vtype
        }
        return affix;
    }

    /**洗练属性重置 */
    remakeAffixData(affixs: IAffixAttr[]) {
        this.reset();
        /**基础属性 */
        this.setBaseAttr();
        this.affixInfo = affixs;
        this.setAffixAttr();

        this.combat = this.getFighting();
    }

    /**自定义极品点 */
    customBestPoint() {
        switch (this.iConfigs.profession) {
            case EProfessionType.ZHANSHI:
                this.bestPoint[0] = this.iConfigs.points[this.quality - 1];
                break;
            case EProfessionType.FASHI:
                this.bestPoint[1] = this.iConfigs.points[this.quality - 1];
                break;
            case EProfessionType.DAOSHI:
                this.bestPoint[2] = this.iConfigs.points[this.quality - 1];
                break;
            default:
                let allpoint = this.iConfigs.points[this.quality - 1];
                let average = allpoint / 4;
                let addpoint = average;
                this.bestPoint[0] = Math.floor(average);
                addpoint += average;
                this.bestPoint[1] = Math.floor(average);
                addpoint += average;
                this.bestPoint[2] = Math.floor(average);
                this.bestPoint[3] = allpoint - addpoint;
                break;
        }
    }

    /**自定义附加属性 */
    customAffixAttr() {
        let _affix: IAffixAttr = {
            id: EAttrType.LUCKY, code: EAttrType.LUCKY, minV: 3, maxV: 3, percent: 1
        }
        let _affix1: IAffixAttr = {
            id: EAttrType.CRITICAL, code: EAttrType.CRITICAL, minV: 3, maxV: 3, percent: 1
        }
        let _affix2: IAffixAttr = {
            id: EAttrType.FIXED_DAMAGE, code: EAttrType.FIXED_DAMAGE, minV: 6, maxV: 6, percent: 1
        }
        let _affix3: IAffixAttr = {
            id: EAttrType.ABSORB_HP, code: EAttrType.ABSORB_HP, minV: 4, maxV: 4, percent: 1
        }
        this.affixCnt = 4;
        this.affixInfo = [];
        this.affixInfo.push(_affix);
        this.affixInfo.push(_affix1);
        this.affixInfo.push(_affix2);
        this.affixInfo.push(_affix3);
    }

    /**天魔衣服 */
    customAffixAttr_TMY() {
        let _affix: IAffixAttr = {
            id: EAttrType.MAX_HP_RATE, code: EAttrType.MAX_HP_RATE, minV: 5, maxV: 5, percent: 2
        }
        let _affix1: IAffixAttr = {
            id: EAttrType.ADD_AC, code: EAttrType.ADD_AC, minV: 3, maxV: 3, percent: 2
        }
        let _affix2: IAffixAttr = {
            id: EAttrType.FIXED_AC, code: EAttrType.FIXED_AC, minV: 10, maxV: 10, percent: 1
        }
        let _affix3: IAffixAttr = {
            id: EAttrType.FIXED_AC, code: EAttrType.FIXED_AC, minV: 10, maxV: 10, percent: 1
        }
        this.affixCnt = 4;
        this.affixInfo = [];
        this.affixInfo.push(_affix);
        this.affixInfo.push(_affix1);
        this.affixInfo.push(_affix2);
        this.affixInfo.push(_affix3);
    }

    /**黄金面具 */
    customAffixAttr_TLK() {
        let _affix: IAffixAttr = {
            id: EAttrType.FIXED_DAMAGE, code: EAttrType.FIXED_DAMAGE, minV: 8, maxV: 8, percent: 1
        }
        let _affix1: IAffixAttr = {
            id: EAttrType.FIXED_AC, code: EAttrType.FIXED_AC, minV: 8, maxV: 8, percent: 1
        }
        let _affix2: IAffixAttr = {
            id: EAttrType.ADD_DAMAGE, code: EAttrType.ADD_DAMAGE, minV: 3, maxV: 3, percent: 2
        }
        let _affix3: IAffixAttr = {
            id: EAttrType.SKILL_ALL, code: EAttrType.SKILL_ALL, minV: 2, maxV: 2, percent: 1
        }
        this.affixCnt = 4;
        this.affixInfo = [];
        this.affixInfo.push(_affix);
        this.affixInfo.push(_affix1);
        this.affixInfo.push(_affix2);
        this.affixInfo.push(_affix3);
    }

    /**刷新 */
    updateCustomAttr() {
        this.reset();
        this.setBaseAttr();
        this.setAffixAttr();
        this.combat = this.getFighting();
    }

    /**极品分配 */
    setBestPoint(quality: number) {
        let isJipin = false;
        let bestgailv = this.iConfigs.bestgailv;
        if (bestgailv && bestgailv.length > 0) {
            let random = Math.random() * 100;
            switch (quality) {
                case EQuality.white:
                    if (random <= bestgailv[0]) isJipin = true;
                    break;
                case EQuality.green:
                    if (random <= bestgailv[1]) isJipin = true;
                    break;
                case EQuality.bule:
                    if (random <= bestgailv[2]) isJipin = true;
                    break;
                case EQuality.purple:
                    if (random <= bestgailv[3]) isJipin = true;
                    break;
                case EQuality.orange:
                    if (random <= bestgailv[4]) isJipin = true;
                    break;
            }
        }
        if (isJipin) {
            let bestPoint = this.iConfigs.points[quality - 1];
            if (!bestPoint) bestPoint = 1;
            let baodi = bestPoint * 0.3;
            /**保底30% */
            let point = (bestPoint - baodi) * Math.random() + bestPoint * 0.3;
            let randPoint = Math.ceil(point);
            if (randPoint > bestPoint) randPoint = bestPoint;
            while (randPoint > 0) {
                let index = Math.floor(Math.random() * 4);
                let ponit = Math.ceil(Math.random() * randPoint);
                randPoint -= ponit;
                if (!this.bestPoint[index]) this.bestPoint[index] = 0;
                this.bestPoint[index] += ponit;
            }
            this.setBestPointAttr();
        }
    }

    /**极品点 */
    setBestPointAttr() {
        /**填充上装备 */
        if (this.bestPoint[0] > 0) {/**攻击 */
            this.maxzs += this.bestPoint[0];
        }
        if (this.bestPoint[1] > 0) {/**魔法 */
            this.maxfs += this.bestPoint[1];
        }
        if (this.bestPoint[2] > 0) {/**道术 */
            this.maxds += this.bestPoint[2];
        }
        if (this.bestPoint[3] > 0) {/**防御 */
            this.maxac += this.bestPoint[3];
        }
    }

    /**词缀条目 */
    setAffixCnt(quality: number) {
        switch (quality) {
            case EQuality.green:
                this.affixCnt = 1;
                break;
            case EQuality.bule:
                this.affixCnt = 2;
                break;
            case EQuality.purple:
                this.affixCnt = 3;
                break;
            case EQuality.orange:
                this.affixCnt = 4;
                break;
            default:
                this.affixCnt = 0;
                break;
        }
    }

    /**看看是不是有最大最小值 */
    getIsAttackType(code: number) {
        if (code != EAttrType.ZS &&
            code != EAttrType.FS &&
            code != EAttrType.DS &&
            code != EAttrType.AC) {
            return false;
        }
        return true;
    }

    /**获取品质 equip词缀*/
    public getAffixColor(id: number, min: number, max: number) {
        let value = min;
        let _affixCfg: IEquipCiZhuiCFG = EquipCiZhuiConfig.instance.getAffixCfgById(id);
        let _maxValue = _affixCfg.maxvalue;
        switch (_affixCfg.attrtype) {
            case EAttrType.ZS:
            case EAttrType.FS:
            case EAttrType.DS:
            case EAttrType.AC:
                value = Math.ceil(min) + Math.ceil(max);
                _maxValue = _maxValue * 2;
                break;
            default:
                if (_affixCfg.vtype != 2)
                    value = Math.ceil(value);
                break;
        }
        let _value = value / _maxValue;
        if (_value >= 0.95) {
            return eColorPool.orange;
        } else if (_value >= 0.8) {
            return eColorPool.purple;
        } else if (_value > 0.5) {
            return eColorPool.bule;
        } else if (_value > 0.3) {
            return eColorPool.green;
        } else {
            return eColorPool.white;
        }
    }

    //序列化
    toObj(): IItem {
        let result = {
            uuid: this.uuid,
            itemId: this.itemId,
            count: this.count,
            quality: this.quality,
            cooling: this.cooling,
            part: this.part,
            affixCnt: this.affixCnt,
            affixInfo: this.affixInfo,
            bestPoint: this.bestPoint,
            costStone: this.costStone,
            isLock: this.isLock,
            state: this.state,
            isfixd: this.isfixd,
            combat: this.combat
        }
        return result;
    }
}