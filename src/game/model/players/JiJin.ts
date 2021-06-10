import JiJinConfig from "../../config/JiJinConfig";
import { ERichesType } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";

/**vip */
export enum eVipType {
    /**普通 */
    ordinary = 1,
    /**vip */
    vip = 2
}

/**基金 */
export default class JiJin {
    owner: Player;
    jijinVip: eVipType;
    jijinRecord: string[];
    constructor(owner: Player) {
        this.owner = owner;
        this.jijinRecord = [];
        this.jijinVip = eVipType.ordinary;
    }

    /**设置vip */
    setDB(vip: string) {
        if (vip) {
            let __data = DataUtil.jsonBy(vip);
            this.jijinVip = __data.jijinVip;
            this.jijinRecord = __data.jijinRecord;
        }
    }

    /**领取奖励 */
    onReceive(lvl: number, type: number) {
        let key = String(lvl + type);
        if (this.jijinRecord.indexOf(key) != -1) {
            return this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.GOT_REWARD
            });
        }
        if (this.owner.level < lvl) {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.LV_NOT_ENOUGH
            });
        } else {
            let lvConfigs = JiJinConfig.instance.getJiJinCfgByLvl(lvl);
            if (lvConfigs) {
                switch (type) {
                    case eVipType.ordinary:
                        this.owner.addMoney(ERichesType.Yuanbao, lvConfigs.ordinary, "基金获取");
                        break;
                    case eVipType.vip:
                        if (this.jijinVip == eVipType.vip) {
                            this.owner.addMoney(ERichesType.Yuanbao, lvConfigs.vip, "豪华基金获取");
                        } else {
                            this.owner.send(CmdID.s2c_notice, {
                                code: ErrorConst.MATERIAL_NOT_ENOUGH
                            });
                            return;
                        }
                        break;
                }
                this.jijinRecord.push(key);
                this.owner.send(CmdID.s2c_notice, {
                    code: ErrorConst.GET_REWARD_SUCCESS
                });
                this.owner.send(CmdID.s2c_jijin_change, {
                    jijin: this.toDB()
                });
            } else {
                Logger.log("服务器配置奖励错误");
            }
        }
    }

    /**购买特权 */
    onBuyVip() {
        this.jijinVip = eVipType.vip;
        this.owner.addMoney(ERichesType.Yuanbao, 980, "购买豪华特权的奖励");
        this.owner.send(CmdID.s2c_jijin_change, {
            jijin: this.toDB()
        });
    }

    /**数据 */
    toDB() {
        let result = {
            jijinVip: this.jijinVip,
            jijinRecord: this.jijinRecord
        }
        return DataUtil.toJson(result, "{}");
    }
}