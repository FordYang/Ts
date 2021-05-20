import { EItemKey } from "../../consts/EItem";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";

export default class RoleYyShop {
    owner: Player;
    /**当前倍数 百分比*/
    bet: number;
    /**下次刷新时间 */
    refresh: number;
    /**计时器 */
    _timer: NodeJS.Timeout;
    constructor(owner: Player) {
        this.owner = owner;
        this.bet = 1;
        this.refresh = 0;
    }

    /**开启定时器 */
    setDB(data: string) {
        if (!data) return this.onResetBet();
        let __data = DataUtil.jsonBy(data);
        this.bet = __data.bet;
        this.refresh = __data.refresh;
        /**开启定时器 */
        this.start();
    }

    /**重置倍数 */
    onResetBet() {
        this.bet = Math.floor(Math.random() * 150 + 50);
        this.refresh = Date.now() + 1800 * 1000;
        this.owner.send(CmdID.s2c_yyshop, {
            bet: this.bet,
            refresh: this.refresh
        });
    }

    /**刷新倍率 */
    onRefreshBet() {
        /**使用古玩 */
        let itemCnt = this.owner.bag.getCountByItemId(EItemKey.itemid_103038);
        if (itemCnt >= 1) {
            this.owner.bag.useItem(EItemKey.itemid_103038, 1);
            this.bet = Math.floor(Math.random() * 150 + 50);
            this.sendYYshop();
        }
    }

    /**延迟下次刷新时间 */
    onDelayBet() {
        this.refresh += 1800 * 1000;
        this.sendYYshop();
    }

    /**开启定时器 */
    start() 
    {
        if (this._timer)
        {
            clearInterval(this._timer);
        }

        this._timer = setInterval(() => {
            let currentT = Date.now();
            if (currentT - this.refresh > 0) {
                this.onResetBet();
            }
        }, 1000);
    }

    /**关闭定时器 */
    destroy() {
        clearInterval(this._timer);
    }

    /**发送消息 */
    sendYYshop() {
        this.owner.send(CmdID.s2c_yyshop, {
            bet: this.bet,
            refresh: this.refresh
        });
    }

    toObj() {
        return {
            bet: this.bet,
            refresh: this.refresh
        }
    }

    toDB() {
        return DataUtil.toJson(this.toObj(), "{}");
    }
}