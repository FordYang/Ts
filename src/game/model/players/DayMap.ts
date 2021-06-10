import GTimer from "../../common/GTimer";
import ChongzhiCFG from "../../config/cfg/ChongzhiCFG";
import GameEvent from "../../consts/GameEvent";
import EventTool from "../../core/EventTool";
import GameUtil from "../../core/GameUtil";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

export enum EDayMapType {
    /**免费金币 */
    videoCoin = 1,
    /**免费背包拓展 */
    videoBag = 2,
    /**复活视频 */
    videoRelive = 3,
    /**云游商城 */
    roleyyshop = 4,
    /**铁匠铺刷新 */
    videobuild = 5,
    /**金币拓展背包 */
    moneyexbag = 6,
    /**人名币购买格子 */
    rmbBagex = 7
}

/**每日更新 */
export default class DayMap {
    owner: Player;
    _localDate: number;
    /**免费金币 */
    videoCoin: number;
    videoCoinMax: number;
    /**免费扩容 */
    videoBag: number;
    videoBagMax: number;
    /**铁匠装备 */
    videoBuild: number;
    videoBuildMax: number;
    /**每日复活 */
    localRelive: number;
    localReliveMax: number;
    /**云游商城 */
    roleyyshop: number;
    roleyyshopMax: number;
    /**游戏内配置，后续移到其他位置 */
    bagCoins: number;
    bagVideos: number;
    maxBagCoins: number;
    maxBagVideos: number;

    /**6元金币礼包 */
    _jb_6count: number;
    /**30元金币礼包 */
    _jb_30count: number;
    /**68元金币礼包 */
    _jb_68count: number;
    /**洗练石礼包 */
    _stonecount: number;
    /**书页礼包 */
    _bookcount: number;
    /**书页礼包 */
    _jingmaicount: number;
    /**膜拜 */
    worship: number;
    maxworship: number;
    /**购买背包格子 */
    rmbBagCnt: number;

    constructor(owner: Player) {
        this.owner = owner;

        this.onResetData();

        EventTool.on(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    onResetData() {
        this.videoCoin = 0;
        this.videoCoinMax = 5;
        this.videoBag = 0;
        this.videoBagMax = 5;
        this.videoBuild = 0;
        this.videoBuildMax = 5;
        this.localRelive = 0;
        this.localReliveMax = 5;
        this.roleyyshop = 0;
        this.roleyyshopMax = 5;

        this.bagCoins = 0;
        this.bagVideos = 0;

        this.maxBagCoins = 30;
        this.maxBagVideos = 30;

        this._jb_6count = 0;
        this._jb_30count = 0;
        this._jb_68count = 0;
        this._stonecount = 0;
        this._bookcount = 0;
        this._jingmaicount = 0;

        this.worship = 0;
        this.maxworship = 2;
        this.rmbBagCnt = 0;

        this._localDate = Date.now();
    }
    private destroyed: boolean = false;
    public destroy(): void {
        this.saveDB();
        this.destroyed = true;
        EventTool.off(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    /**设置每日更新 */
    setDB(daymap: string) {
        if (!daymap) return;
        let __daymap = DataUtil.jsonBy(daymap);
        /**视频点 */
        this.videoCoin = __daymap.videoCoin;
        this.videoCoinMax = __daymap.videoCoinMax;
        this.videoBag = __daymap.videoBag;
        this.videoBagMax = __daymap.videoBagMax;
        this.videoBuild = __daymap.videoBuild;
        this.videoBuildMax = __daymap.videoBuildMax;
        this.localRelive = __daymap.localRelive;
        this.localReliveMax = __daymap.localReliveMax;
        this.roleyyshop = __daymap.roleyyshop;
        this.roleyyshopMax = __daymap.roleyyshopMax;
        /**背包 */
        this.bagCoins = __daymap.bagCoins;
        this.bagVideos = __daymap.bagVideos;
        this.maxBagCoins = __daymap.maxBagCoins;
        this.maxBagVideos = __daymap.maxBagVideos;
        /**充值限制 */
        this._jb_6count = __daymap._jb_6count;
        this._jb_30count = __daymap._jb_30count;
        this._jb_68count = __daymap._jb_68count;
        this._stonecount = __daymap._stonecount;
        this._bookcount = __daymap._bookcount;
        /**经脉 */
        if (__daymap._jingmaicount)
            this._jingmaicount = __daymap._jingmaicount;
        /**膜拜 */
        this.worship = __daymap.worship;
        this.maxworship = __daymap.maxworship;
        if (__daymap.rmbBagCnt) this.rmbBagCnt = __daymap.rmbBagCnt;
        if (__daymap._localDate) {
            this._localDate = __daymap._localDate;
            this.checkNewDay();
        } else {
            this.onResetData();
        }
    }

    private onEveryDayReset = () => {
        this.onResetData();
        this.sendChangeMsg();

        /**在这里更新玩家体力吧 */
        this.owner.everyDayReset();
    }

    /**充值限购 */
    setRechargeChange(chongzhiCfg: ChongzhiCFG) {
        switch (chongzhiCfg.type2) {
            case 1:/**金币 */
                switch (chongzhiCfg.rmb) {
                    case 6:
                        this._jb_6count++;
                        break;
                    case 30:
                        this._jb_30count++;
                        break;
                    case 68:
                        this._jb_68count++;
                        break;
                }
                break;
            case 2:/**洗练石 */
                this._stonecount++;
                break;
            case 3:/**书页 */
                this._bookcount++;
                break;
            case 4:
                this._jingmaicount++;
                break;
        }
        this.sendChangeMsg();
    }

    /**刷新 */
    updateDayMap(type: EDayMapType) {
        switch (type) {
            case EDayMapType.videoCoin:
                this.videoCoin++;
                break;
            case EDayMapType.videoBag:
                this.videoBag++;
                this.bagVideos++;
                break;
            case EDayMapType.videoRelive:
                this.localRelive++;
                break;
            case EDayMapType.roleyyshop:
                this.roleyyshop++;
                break;
            case EDayMapType.videobuild:
                this.videoBuild++;
                break;
            case EDayMapType.moneyexbag:
                this.bagCoins++;
                break;
            case EDayMapType.rmbBagex:
                this.rmbBagCnt++;
                break;
        }
        this.sendChangeMsg();
    }

    /**保存特权信息 */
    saveDB() {
        if (!this.destroyed) {
            DB.updateDayMapSQL(this.owner.roleid, this.toDB());
        }
    }

    /**传送每日限购变更消息 */
    sendChangeMsg() {
        this.saveDB();
        this.owner.send(CmdID.s2c_daymap_change, {
            daymap: this.toDB()
        })
    }

    /**每日刷新 */
    private checkNewDay() {
        if (!this._localDate) return;
        let lastonlineDate = new Date(this._localDate);
        let cdate = new Date(GameUtil.gameTime);
        let ld = GTimer.getYearDay(lastonlineDate);
        if (ld != GTimer.getYearDay(cdate)) {
            this.onResetData();
        }
    }

    toObj() {
        return {
            videoCoin: this.videoCoin,
            videoCoinMax: this.videoCoinMax,
            videoBag: this.videoBag,
            videoBagMax: this.videoBagMax,
            videoBuild: this.videoBuild,
            videoBuildMax: this.videoBuildMax,
            localRelive: this.localRelive,
            localReliveMax: this.localReliveMax,
            roleyyshop: this.roleyyshop,
            roleyyshopMax: this.roleyyshopMax,

            bagCoins: this.bagCoins,
            bagVideos: this.bagVideos,
            maxBagCoins: this.maxBagCoins,
            maxBagVideos: this.maxBagVideos,

            _jb_6count: this._jb_6count,
            _jb_30count: this._jb_30count,
            _jb_68count: this._jb_68count,
            _stonecount: this._stonecount,
            _bookcount: this._bookcount,
            _jingmaicount: this._jingmaicount,

            worship: this.worship,
            maxworship: this.maxworship,
            _localDate: this._localDate,

            rmbBagCnt: this.rmbBagCnt
        }
    }

    toDB() {
        return DataUtil.toJson(this.toObj(), "{}");
    }
}