import MonsterCFG from "../../config/cfg/MonsterCFG";
import MapConfig from "../../config/MapConfig";
import MonsterConfig from "../../config/MonsterConfig";
import GameEvent from "../../consts/GameEvent";
import PlayerEvent from "../../consts/PlayerEvent";
import CyObject from "../../core/CyObject";
import EventTool from "../../core/EventTool";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

class FightingBossInfo {
    public id: number;
    public hp: number;

    /** 记录死亡时间 */
    public st: number;

    /** 复活时间 */
    private rt: number = 0;

    private bosscfg: MonsterCFG;

    public dead: boolean = false;

    constructor() {

    }

    public resetHp(): void {
        this.hp = this.bosscfg.hp;
    }

    public setInfo(bossId: number, dead: boolean, hp: number, st: number, rt: number): void {
        this.id = bossId;
        this.dead = dead;
        this.hp = hp;

        this.st = st || 0;;
        this.rt = rt || 0;;

        this.bosscfg = MonsterConfig.instance.getMonsterCfgById(bossId);
    }

    public die(rt: number): void {
        this.rt = rt * 1000;
        this.st = Date.now();

        this.dead = true;

        this.hp = this.bosscfg.hp;
    }

    public revive(): void {
        this.dead = false;

        this.st = 0;

        this.hp = this.bosscfg.hp;
    }

    public get isLive(): boolean {
        return Date.now() - this.st > this.rt;
    }

    public get remTime(): number {
        return this.rt - Date.now() + this.st;
    }

    /**  */
    public deserialize(obj: any): void {
        this.setInfo(obj.id, obj.dead, obj.hp, obj.st, obj.rt);

        // if (this.hp == 0)
        // {
        //     this.dead = true;
        // }

        // if (this.isLive)
        // {
        //     this.revive();
        // }
    }

    public serialize(): object {
        return { id: this.id, dead: this.dead, hp: this.hp, st: this.st, rt: this.rt };
    }
}

export default class RoleBossEntity extends CyObject
{
    private player: Player;

    private bossList: FightingBossInfo[] = [];
    private bossMap: { [bossId: number]: FightingBossInfo };

    constructor(player: Player) 
    {
        super();

        this.player = player;

        this.bossMap = Object.create(null);
    }

    private isResetHp: boolean = false;
    public resetHp(): void 
    {
        if (this.isResetHp) 
        {
            for (let bossinfo of this.bossList) 
            {
                if (bossinfo.isLive) 
                {
                    bossinfo.resetHp();
                }
            }

            DB.updateRoleAttr(this.player.roleid, ["boss"], [this.serializeDB()]);
        }
        this.isResetHp = true;
    }

    public update_sec():void
    {
        for (let bossInfo of this.bossList) 
        {
            if (bossInfo.dead && bossInfo.isLive) 
            {
                this.reviveBoss(bossInfo);
            }
        }

        // let bossId = MapConfig.instance.getMapBossId(this.player.mapid);
        // if (bossId)
        // {
        //     let bossInfo = this.bossMap[bossId];

        //     if (bossInfo && bossInfo.dead)
        //     {
        //         if (bossInfo.isLive)
        //         {
        //             bossInfo.revive();

        //             this.player.emit(PlayerEvent.FIGHTING_BOSS_REVIVE, bossId);

        //             this.player.send(CmdID.s2c_fighting_boss_revive, {bossId:bossId});
        //         }
        //     }
        // }
    }

    private reviveBoss(bossInfo: FightingBossInfo): void {
        bossInfo.revive();

        this.player.emit(PlayerEvent.FIGHTING_BOSS_REVIVE, bossInfo.id);

        this.player.send(CmdID.s2c_fighting_boss_revive, { bossId: bossInfo.id });
    }

    //------------------------------------------------------------------------------------------------------------------------

    /**  */
    public deserialize(objstr: string): void {
        if (objstr) {
            let objList = DataUtil.jsonBy(objstr);
            let len = objList.length;
            for (let i: number = 0; i < len; i++) {
                let bossInfo = new FightingBossInfo();
                bossInfo.deserialize(objList[i]);

                this.bossMap[bossInfo.id] = bossInfo;
                this.bossList.push(bossInfo);
            }
        }

        let bossCfgList = MonsterConfig.instance.bossCfgList;
        for (let bosscfg of bossCfgList) {
            if (!this.bossMap[bosscfg.id]) {
                let bossinfo = new FightingBossInfo();
                bossinfo.setInfo(bosscfg.id, false, bosscfg.hp, 0, 0);

                this.bossMap[bossinfo.id] = bossinfo;
                this.bossList.push(bossinfo);
            }
        }
    }

    public serializeClient(): string {
        return this.serializeDB();
    }

    public serializeDB(): string {
        let len = this.bossList.length;
        let objList: object[] = [];

        for (let i = 0; i < len; i++) {
            let bossInfo = this.bossList[i];
            let bossCfg = MonsterConfig.instance.getMonsterCfgById(bossInfo.id);
            if (bossCfg && (!bossInfo.isLive || bossInfo.hp !== bossCfg.hp))// || !bossInfo.isLive bossCfg.hp != 
            {
                let bossObj = this.bossList[i].serialize();
                objList.push(bossObj);
            }
        }
        return JSON.stringify(objList);
    }

    //------------------------------------------------------------------------------------------------------------------------

    public getBossHp(bossId: number): number {
        let bossInfo = this.bossMap[bossId];
        if (bossInfo) {
            return bossInfo.hp;
        }

        return MonsterConfig.instance.getMonsterCfgById(bossId)?.hp;
    }

    public setBossHp(bossId: number, hp: number): void {
        let bossInfo = this.bossMap[bossId];

        if (bossInfo) {
            bossInfo.hp = hp;
        }
    }

    /** 检测Boss是否存活 */
    public checkBossLive(bossId: number): boolean {
        let bossInfo = this.bossMap[bossId];

        if (bossInfo) {
            // if (bossInfo.isLive)
            // {
            //     this.reviveBoss(bossInfo);
            // }
            return bossInfo.isLive;
        }

        return false;
    }

    public bossDie(bossId: number): void 
    {
        let tmpBossInfo = this.bossMap[bossId];
        if (tmpBossInfo) 
        {
            let bosscfg = MonsterConfig.instance.getMonsterCfgById(bossId);

            tmpBossInfo.die(this.player.prerogative.iszhanshen ? bosscfg.rebirth * 0.5 : bosscfg.rebirth);
        }

        // DB.updateRoleAttr(this.player.roleid, ["boss"], [this.serializeDB()]);

        this.player.send(CmdID.s2c_fighting_boss_die, { bossId: bossId, time: tmpBossInfo.remTime });
    }

    //----------------------------------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        DB.updateRoleAttr(this.player.roleid, ["boss"], [this.serializeDB()]);

        super.onDestroy();
    }
}