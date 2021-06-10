import { ExchangeConfig } from "../../config/ExchangeConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";

export default class Exchange {
    owner: Player;

    duihuanma: string[];
    constructor(owner: Player) {
        this.owner = owner;
        this.duihuanma = [];
    }

    setDB(data: string) {
        if (!data) return;
        let __data = DataUtil.jsonBy(data);
        this.duihuanma = __data;
    }

    /**兑换码 */
    onExchange(exCode: string) {
        if (this.duihuanma.indexOf(exCode) != -1) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.GOT_THING
            });
        } else {
            let exCfgs = ExchangeConfig.instance.getDuihuanmaCfgByCode(exCode);
            if (exCfgs) {
                this.duihuanma.push(exCode);
                this.owner.addItem(exCfgs.id, 1, "礼包码获取", false, null, true);
                this.owner.send(CmdID.s2c_notice, {
                    code: ErrorConst.GOT_REWARD
                });
            }
        }
    }

    /**转换db */
    toDB() {
        return DataUtil.toJson(this.duihuanma, "[]");
    }
}