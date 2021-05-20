import GTimer from "../../common/GTimer";
import ChongzhiCFG from "../../config/cfg/ChongzhiCFG";
import { ERichesType } from "../../consts/EGame";
import { EItemKey } from "../../consts/EItem";
import { ePrerogativeType, ePrerogativeTime } from "../../consts/ERole";
import { ErrorConst } from "../../consts/ErrorConst";
import GameEvent from "../../consts/GameEvent";
import EventTool from "../../core/EventTool";
import GameUtil from "../../core/GameUtil";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";
// export enum EPrerogativeSign {
//     /**回收特权 */
//     huishoutime = 1000,
//     /**回收的100元宝 */
//     huishou100 = 1001,
//     /**离线时间上限提升至12小时（原4小时） */
//     lixianup = 1002,
//     /**云游商人装备回收数量提高至200 */
//     yyshopup = 1003,
//     /**云游商人装备回收价格翻倍 */
//     yyshoppriceup = 1004,
//     /**装备自动回收价格提升至100% */
//     zdhsup = 1005,
//     /**战神特权 */
//     zhanshentime = 1006,
//     /**战神的100元宝 */
//     zhanshen100 = 1007,
//     /**击杀经验值加成 */
//     killexpup = 1008,
//     /**传送权限 */
//     sendmap = 1009,
//     /**时间减半 */
//     timereduce = 1010,
//     /**boss必定额外掉落一件本职业史诗品质装备 */
//     bossdrop = 1011,
//     /**免广告特权 */
//     mianguanggao = 1012,
//     /**领取免广告充值奖励 */
//     isreceived = 1013,
//     /**托管 */
//     tuoguantime = 1014
// }

export default class Prerogative {
    /**当前时间戳 */
    private _localDate: number;
    /**回收特权 */
    private _huishoutime: number;
    /**回收的100元宝 */
    private _huishou100: boolean;
    /**离线时间上限提升至12小时（原4小时） */
    private _lixianup: boolean;
    /**云游商人装备回收数量提高至200 */
    private _yyshopup: boolean;
    /**云游商人装备回收价格翻倍 */
    private _yyshop_priceup: boolean;
    /**装备自动回收价格提升至100% */
    private _zdhsup: boolean;
    /**战神特权 */
    private _zhanshentime: number;
    /**战神的100元宝 */
    private _zhanshen100: boolean;
    /**击杀经验值加成 */
    private _killexpup: boolean;
    /**传送权限 */
    private _sendmap: boolean;
    /**时间减半 */
    private _timereduce: boolean;
    /**boss必定额外掉落一件本职业史诗品质装备 */
    private _bossdrop: boolean;
    /**免广告特权 */
    private _mianguanggao: boolean;
    /**领取免广告充值奖励 */
    private _isreceived: boolean;
    /**托管 */
    private _tuoguantime: number;

    owner: Player;
    // _prerogative: { [key: string]: EPrerogativeSign };
    constructor(owner: Player) {
        this.owner = owner;

        this._localDate = Date.now();
        this._huishoutime = 0;
        this._huishou100 = false;
        this._lixianup = false;
        this._yyshopup = false;
        this._yyshop_priceup = false;
        this._zdhsup = false;
        /**战神特权 */
        this._zhanshentime = 0;
        this._zhanshen100 = false;
        this._killexpup = false;
        this._sendmap = false;
        this._timereduce = false;
        this._bossdrop = false;

        this._mianguanggao = false
        this._isreceived = false;
        /**托管 */
        this._tuoguantime = 0;

        EventTool.on(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    private destroyed: boolean = false;
    public destroy(): void {
        this.saveDB();
        this.destroyed = true;
        EventTool.off(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    /**回收特权 */
    get ishuishou() {
        return this._huishoutime > Date.now() ? true : false;
    }

    /**战神特权 */
    get iszhanshen() {
        return this._zhanshentime > Date.now() ? true : false;
    }

    /**托管特权 */
    get istuoguan() {
        if (this._tuoguantime === -9999) return true;
        return this._tuoguantime > Date.now() ? true : false;
    }

    /**特权传送 */
    get sendMap() {
        return this._sendmap;
    }

    /**回收100元宝 */
    get huishou100() {
        return this._huishou100;
    }

    /**战神100元宝 */
    get zhanshen100() {
        return this._zhanshen100;
    }

    /**云游回收翻倍 */
    get yyPriceup() {
        return this._yyshop_priceup;
    }

    /**特权 */
    setDB(data: string) {
        if (!data) return;
        let __data = DataUtil.jsonBy(data);
        this._huishoutime = __data._huishoutime;
        this._huishou100 = __data._huishou100;
        this._lixianup = __data._lixianup;
        this._yyshopup = __data._yyshopup;
        this._yyshop_priceup = __data._yyshop_priceup;
        this._zdhsup = __data._zdhsup;
        /**战神特权 */
        this._zhanshentime = __data._zhanshentime;
        this._zhanshen100 = __data._zhanshen100;
        this._killexpup = __data._killexpup;
        this._sendmap = __data._sendmap;
        this._timereduce = __data._timereduce;
        this._bossdrop = __data._bossdrop;
        /**免广告 */
        this._mianguanggao = __data._mianguanggao;
        this._isreceived = __data._isreceived;
        /**托管 */
        if (__data._tuoguantime)
            this._tuoguantime = __data._tuoguantime;
        if (__data._localDate)/**兼容 */ {
            this._localDate = __data._localDate;
            this.checkNewDay();
        } else {
            this._localDate = Date.now();
            this.onResetDay();
        }
    }

    onResetDay() {
        this._huishou100 = true;
        this._zhanshen100 = true;
        this._localDate = Date.now();
    }

    /**每日清空领取情况 */
    private onEveryDayReset = () => {
        this.onResetDay();
        this.saveDB();
        this.owner.sendPrerogativeChanged();
    }

    /**每日刷新 */
    private checkNewDay() {
        if (!this._localDate) return;
        let lastonlineDate = new Date(this._localDate);
        let cdate = new Date(GameUtil.gameTime);
        let ly = lastonlineDate.getFullYear();
        let lm = lastonlineDate.getMonth();
        let lw = GTimer.getYearWeek(lastonlineDate);
        let ld = GTimer.getYearDay(lastonlineDate);

        if (ly != cdate.getFullYear()) {
            // this.OnNewYear();
        }
        if (lm != cdate.getMonth()) {
            // this.OnNewMonth();
        }
        if (lw != GTimer.getYearWeek(cdate)) {
            // this.OnNewWeek();
        }
        if (lw != GTimer.getYearWeek(cdate)) {
            // this.OnNewWeek();
        }
        if (ld != GTimer.getYearDay(cdate)) {
            this.onResetDay();
        }
    }

    /**回收 */
    onRechargeHuishou(time: ePrerogativeTime) {
        let localtime = Date.now();
        if (this._huishoutime > localtime)
            localtime = this._huishoutime;
        else
            this._huishou100 = true;

        switch (time) {
            case ePrerogativeTime.seven:/**7天 */
                this._huishoutime = localtime + 7 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month:/**30天 */
                this._huishoutime = localtime + 30 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month_3:/**90天 */
                this._huishoutime = localtime + 90 * 24 * 60 * 60 * 1000;
                break;
        }
        this._lixianup = true;
        this._yyshopup = true;
        this._yyshop_priceup = true;
        this._zdhsup = true;
    }

    /**战神 */
    onRechargeZhenshen(time: ePrerogativeTime) {
        let localtime = Date.now();
        /**战神100元宝 */
        if (this._zhanshentime > localtime)
            localtime = this._zhanshentime;
        else this._zhanshen100 = true;
        switch (time) {
            case ePrerogativeTime.seven:/**7天 */
                this._zhanshentime = localtime + 7 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month:/**30天 */
                this._zhanshentime = localtime + 30 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month_3:/**90天 */
                this._zhanshentime = localtime + 90 * 24 * 60 * 60 * 1000;
                break;
        }
        this._killexpup = true;
        this._sendmap = true;
        this._timereduce = true;
        this._bossdrop = true;
    }

    /**托管 */
    onRechargeTuoguan(time: ePrerogativeTime) {
        let localtime = Date.now();
        /**托管时间 */
        if (this._tuoguantime > localtime)
            localtime = this._tuoguantime;
        /**托管助手 */
        switch (time) {
            case ePrerogativeTime.seven:/**7天 */
                this._tuoguantime = localtime + 7 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month:/**30天 */
                this._tuoguantime = localtime + 30 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.month_3:/**90天 */
                this._tuoguantime = localtime + 90 * 24 * 60 * 60 * 1000;
                break;
            case ePrerogativeTime.yongjiu:
                this._tuoguantime = -9999;
                break;
        }
    }

    /**充值特权 */
    onRecharge(type: ePrerogativeType, time: ePrerogativeTime) {
        switch (type) {
            case ePrerogativeType.huishou:
                this.onRechargeHuishou(time);
                break;
            case ePrerogativeType.zhanshen:
                this.onRechargeZhenshen(time);
                break;
            case ePrerogativeType.mianguanggao:
                if (!this._mianguanggao) {
                    this._mianguanggao = true;
                    this.onReceive(3);
                }
                break;
            case ePrerogativeType.tuoguan:
                this.onRechargeTuoguan(time);
                break;
        }
        this._localDate = Date.now();
        this.saveDB();
        this.owner.sendPrerogativeChanged();
    }

    /**充值 */
    onRechargeByMoney(configs: ChongzhiCFG) {
        let czKeys: any;
        switch (configs.type2) {
            case 1:/**回收 */
                czKeys = ePrerogativeType.huishou;
                break;
            case 2:/**战神 */
                czKeys = ePrerogativeType.zhanshen;
                break;
            case 3:/**免广告 */
                czKeys = ePrerogativeType.mianguanggao;
                break;
            case 4:/**托管 */
                czKeys = ePrerogativeType.tuoguan;
                break;
        }
        if (!czKeys) return Logger.log("充值错误！");
        switch (configs.rmb) {
            case 25:/**免广告 */
                this.onRecharge(czKeys, null);
                break;
            case 30:
                this.onRecharge(czKeys, ePrerogativeTime.month);
                break;
            case 68:
                this.onRecharge(czKeys, ePrerogativeTime.month_3);
                break;
            case 128:
                if (czKeys == ePrerogativeType.tuoguan) {
                    this.onRecharge(ePrerogativeType.tuoguan, ePrerogativeTime.yongjiu);
                } else {
                    this.onRecharge(ePrerogativeType.huishou, ePrerogativeTime.month_3);
                    this.onRecharge(ePrerogativeType.zhanshen, ePrerogativeTime.month_3);
                }
                break;
        }
    }

    /**特权领取 */
    onReceive(type: number) {
        switch (type) {
            case 1:
                if (this._zhanshen100) {
                    this._zhanshen100 = false;
                    this.owner.addMoney(ERichesType.Yuanbao, 100, "特权奖励每日领取");
                    this.owner.sendPrerogativeChanged();
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GET_REWARD_SUCCESS
                    });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GOT_THING,
                    });
                }
                break;
            case 2:
                if (this._huishou100) {
                    this._huishou100 = false;
                    this.owner.addMoney(ERichesType.Yuanbao, 100, "特权奖励每日领取");
                    this.owner.sendPrerogativeChanged();
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GET_REWARD_SUCCESS
                    });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GOT_THING
                    });
                }
                break;
            case 3:
                if (!this._isreceived && this._mianguanggao) {
                    this.owner.addItem(EItemKey.itemid_103034, 100, "免广告奖励", false, null, true);
                    this.owner.addItem(EItemKey.itemid_103033, 100, "免广告奖励", false, null, true);
                    this.owner.addItem(EItemKey.itemid_104034, 200, "免广告奖励", false, null, true);
                    this.owner.addMoney(ERichesType.Yuanbao, 300, "免广告奖励");
                    this._isreceived = true;
                    this.owner.sendPrerogativeChanged();
                    this.owner.sendMGGRechargeSuccess();
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.GOT_THING
                    });
                }
                break;
        }
        this._localDate = Date.now();
        this.saveDB();
    }

    /**保存特权信息 */
    saveDB() {
        if (!this.destroyed) {
            DB.updatePrerogativeSQL(this.owner.roleid, this.toDB());
        }
    }

    /**转结构 */
    toObj() {
        return {
            _huishoutime: this._huishoutime,
            _huishou100: this._huishou100,
            _lixianup: this._lixianup,
            _yyshopup: this._yyshopup,
            _yyshop_priceup: this._yyshop_priceup,
            _zdhsup: this._zdhsup,
            _zhanshentime: this._zhanshentime,
            _zhanshen100: this._zhanshen100,
            _killexpup: this._killexpup,
            _sendmap: this._sendmap,
            _timereduce: this._timereduce,
            _bossdrop: this._bossdrop,
            _mianguanggao: this._mianguanggao,
            _isreceived: this._isreceived,
            _tuoguantime: this._tuoguantime,
            _localDate: this._localDate
        }
    }

    toDB() {
        return DataUtil.toJson(this.toObj(), "{}");
    }
}