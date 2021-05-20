import { EQuality } from "../../consts/EGame";
import Player from "../../model/playerObj/Player";
import { IMinePit } from "./MineBase";
import MinePit from "./MinePit";

/**矿区 */
export default class MineArea {
    /**当前矿洞品质 */
    quality: EQuality;
    /**当前矿洞坑位 */
    minePit: MinePit[];
    /**当前矿洞 */
    minePitNum: number;
    /**当前服务器 */
    serverId: number;
    constructor(serverId: number, quality: EQuality, minePitNum: number) {
        this.serverId = serverId;

        this.minePit = [];

        this.quality = quality;

        this.minePitNum = minePitNum;
    }

    /**启动矿区 */
    public launch() {
        /**加载矿区 */
        for (let i = 0; i < this.minePitNum; i++) {
            this.minePit.push(new MinePit(this.serverId, this.quality, i));
        }
    }

    /**填充矿区状态 */
    public setDB(db: any) {
        let minePit = this.getMinePitByIndex(db.id);
        if (minePit)
            minePit.setDB(db);
    }

    /**占领矿洞 */
    public onMineOccupy(id: number, player: Player) {
        let minePit = this.getMinePitByIndex(id);
        if (minePit) minePit.onMinePit(player);
    }

    /**获取矿坑 */
    private getMinePitByIndex(id: number) {
        for (let mine of this.minePit) {
            if (mine.mIndex == id) return mine;
        }
        return null;
    }

    /**传给客户端 */
    public get toClient() {
        let minePit: any = [];
        this.minePit.forEach((data: MinePit) => {
            minePit.push(data.toClient);
        });
        return minePit;
    }

    public get toClientPit() {
        let minePit: any = [];
        this.minePit.forEach((data: MinePit) => {
            minePit.push(data.toClientPit);
        });
        return minePit;
    }

    /**放弃矿洞 */
    public onMinePitGiveup(id: number, roleid: number) {
        let minePit = this.getMinePitByIndex(id);
        if (minePit) minePit.onGiveup(id, roleid);
    }

    /**矿坑玩家 */
    public onMinePitPlayer(id: number, reqPlayer: Player) {
        let minePit = this.getMinePitByIndex(id);
        if (minePit) minePit.onSearchPitInfo(id, reqPlayer);
    }

    onUpdatePit(pit: IMinePit) {
        let minePit = this.getMinePitByIndex(pit.id);
        if (minePit) minePit.onUpdatePit(pit);
    }

    /**刷新体力 */
    update_energy(roleid: number, energy: number) {
        this.minePit.forEach((data: MinePit) => {
            data.update_energy(roleid, energy);
        });
    }

    /**控制消息传输 */
    update_msg(type: boolean, roleid: number) {
        this.minePit.forEach((data: MinePit) => {
            data.update_msg(type, roleid);
        });
    }

    /**每秒刷新 */
    public update_min() {
        this.minePit.forEach((data: MinePit) => {
            data.update_min();
        });
    }
}