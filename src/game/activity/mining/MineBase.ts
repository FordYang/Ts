import { SettingCFG } from "../../config/cfg/SettingCFG";
import { SettingConfig } from "../../config/SettingConfig";
import { EQuality } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import { ESettingConst } from "../../consts/ESettingConst";
import DataUtil from "../../gear/DataUtil";
import Player from "../../model/playerObj/Player";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import MineArea from "./MineArea";
import MinePit from "./MinePit";

/**矿坑 */
export interface IMinePit {
    id: number;
    state: number;
    roleid: number;
    energy: number;
    record: IRecord[];
    awards: { [key: string]: number };
}

/**掉落信息 */
export interface IRecord {
    droplist: any;
    update_date: number;
}


/**矿脉 */
export default class MineBase {
    public static readonly instance = new MineBase();
    public static readonly UPDATE_CD = 60;

    /**启动矿脉 */
    isdiggings: boolean = true;
    /**矿区 */
    diggings: { [key: number]: MineArea };
    /**计时器 */
    private _timer: NodeJS.Timeout;
    /**当前是哪个服务器的矿坑 */
    private serverid: number;
    /**矿洞 */
    public launch(serverid: number) {
        this.serverid = serverid;

        this.diggings = {};

        if (this.isdiggings)
            this.activeDiggings();

        this._timer = setInterval(() => { this.update_min(); }, 1000 * MineBase.UPDATE_CD);
    }

    /**销毁 */
    public onDestroy() {
        clearInterval(this._timer);
    }

    /**矿区 */
    public toClientMineArea(roleid: number) {
        let toClient: any = { qualitys: [], myMine: null };
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (this.diggings[value]) {
                toClient.qualitys.push(value);
            }
        }
        /**自己的信息 */
        let myMine = null;
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (this.diggings[value]) {
                let minePit = this.diggings[value].minePit;
                minePit.forEach((data: MinePit) => {
                    if (data.mRoleid == roleid) {
                        myMine = data.toClient;
                    }
                });
            }
        }
        toClient.myMine = myMine;
        return DataUtil.toJson(toClient, "[]");
    }

    /**矿洞详情 */
    public toClientMine(quality: number) {
        if (this.diggings[quality]) {
            return DataUtil.toJson(this.diggings[quality].toClientPit, "[]");
        }
        return "";
        // let toClient: any[] = [];
        // for (let key in EQuality) {
        //     let value = DataUtil.numberBy(key);
        //     if (this.diggings[value]) {
        //         let data = { quality: value, pit: this.diggings[value].toClient }
        //         toClient.push(data);
        //     }
        // }
        // return DataUtil.toJson(toClient, "[]");
    }

    /**启动矿脉系统 */
    private activeDiggings() {
        let kuangkeng: SettingCFG = SettingConfig.instance.getSettingCFGById(ESettingConst.KUANG_KENG);
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (value < EQuality.green || value > EQuality.orange) {
                continue;
            }
            this.diggings[value] = new MineArea(this.serverid, value, kuangkeng.arrayValue[value - 2]);
            this.diggings[value].launch();
        }
        DB.searchMine(this.serverid).then(data => { this.setDB(data.rows); });
    }

    /**占领矿洞 */
    onMineOccupy(id: number, player: Player) {
        let kuangkeng: SettingCFG = SettingConfig.instance.getSettingCFGById(ESettingConst.KUANG_DONG);
        if (kuangkeng && player.level < kuangkeng.intValue) {
            player.send(CmdID.s2c_notice, { code: ErrorConst.LV_NOT_ENOUGH });
        } else {
            let quality = Math.floor(id / 1000);
            if (this.diggings[quality])
                this.diggings[quality].onMineOccupy(id, player);
        }
    }

    /**控制消息 */
    onMinePitMsg(type: boolean, roleid: number) {
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (this.diggings[value])
                this.diggings[value].update_msg(type, roleid);
        }
    }

    /**放弃矿洞 */
    public onMinePitGiveup(id: number, roleid: number) {
        let quality = Math.floor(id / 1000);
        if (this.diggings[quality])
            this.diggings[quality].onMinePitGiveup(id, roleid);
    }

    /**查询矿洞信息 */
    public onMinePitPlayer(id: number, reqPlayer: Player) {
        let quality = Math.floor(id / 1000);
        if (this.diggings[quality])
            this.diggings[quality].onMinePitPlayer(id, reqPlayer);
    }

    /**矿坑 */
    private setDB(dbMine: any) {
        dbMine.forEach((element: any) => {
            let quality = Math.floor(element.id / 1000);
            if (this.diggings[quality])
                this.diggings[quality].setDB(element);
        });
    }

    update_pit(pit: IMinePit) {
        let quality = Math.floor(pit.id / 1000);
        if (this.diggings[quality])
            this.diggings[quality].onUpdatePit(pit);
    }

    /**刷新矿体力 */
    update_energy(id: number, energy: number) {
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (this.diggings[value])
                this.diggings[value].update_energy(id, energy);
        }
    }

    /**刷新矿洞信息 */
    private update_min() {
        /**每秒更新每个矿洞 */
        for (let key in EQuality) {
            let value = DataUtil.numberBy(key);
            if (this.diggings[value]) {
                this.diggings[value].update_min();
            }
        }
    }
}