import { ErrorConst } from "../../consts/ErrorConst";
import GameEvent from "../../consts/GameEvent";
import EventTool from "../../core/EventTool";
import FightingRoom from "../../fighting/FightingRoom";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";
import MapConfig from "../../config/MapConfig";
import PlayerEvent from "../../consts/PlayerEvent";
import MonsterConfig from "../../config/MonsterConfig";
import { ItemConfig } from "../../config/ItemConfig";
import { EMapType } from "../../consts/EGame";
import CyObject from "../../core/CyObject";
import Logger from "../../gear/Logger";
import DBUtil from "../../gear/DBUtil";

export class OffTrustRewardRecord {
    role_id: number;

    monster_id: number;
    quality: number;

    gold: number;

    exp: number;

    itemlist: { itemId: number, count: number, quality: number }[];

    /** 获取时间戳  秒 */
    time: number;//秒

    constructor(roleid: number, monsterid: number, quality: number, gold: number, exp: number, itemlist: { itemId: number, count: number, quality: number }[], time: number) {
        this.role_id = roleid;

        this.monster_id = monsterid;
        this.quality = quality;

        this.gold = gold;
        this.exp = exp;

        this.itemlist = itemlist;

        this.time = time;
    }

    public serializeDB() {
        return { role_id: this.role_id, monster_id: this.monster_id, quality: this.quality, gold: this.gold, exp: this.exp, itemlist: DataUtil.toJson(this.itemlist), time: this.time };
    }
}

/**
 * 离线托管
 */
export default class RoleOffTrustEntity extends CyObject {
    public static readonly TRUST_MAX_TIME: number = 1000 * 60 * 60 * 12;//30000;//120000;//30000;//
    private _inTrust: boolean = false;

    private trustStime: number = 0;

    private currentMapId: number = 0;

    private defaultMapId: number = 0;
    private mapIdList: number[] = [];
    private isAutoBuyHp: boolean;
    private isAutoBuyMp: boolean;

    private isReadGainDB: boolean = false;

    //--------------------------------------------------------------
    /** 挂机收获 */
    private gainGold: number = 0;
    private gainExp: number = 0;
    private killMonsterQualityList: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    private killMonsterMap: { [monsterKey: string]: { monsterId: number, quality: number, count: number } } = {};
    private gainItemMap: { [itemKey: string]: { itemId: number, quality: number, count: number } } = {};

    private rewardListIdx: number = 0;
    private gainRewardList: OffTrustRewardRecord[] = [];
    //--------------------------------------------------------------

    private player: Player;

    constructor(player: Player) {
        super();

        this.player = player;
        this.player.on(CmdID.c2s_req_off_trust, this.onSetOffTrust);

        this.fightingRoom = this.player.fightingRoom;

        this.trustStime = Date.now();
    }

    public log(message?: any, ...optionalParams: any[]): void {
        // Logger.log(message, ...optionalParams);
    }

    public get inTrust(): boolean {
        return this._inTrust;
    }

    /**
     * 
     * @param bodyObj //flag 0 托管  1 去消托管
     */
    private onSetOffTrust = (bodyObj: { flag: number, info: { mapIdList: number[], autoBuyHp: boolean, autoBuyMp: boolean } }) => {
        this.resetGain();

        let a = true;
        if (this.player.prerogative.istuoguan)//
        {
            let mapcfg = MapConfig.instance.getMapCfgById(this.player.mapid);
            if (mapcfg.type === EMapType.battle) {
                if (bodyObj) {
                    if (bodyObj.flag === 0) {
                        let info = bodyObj.info;

                        let tmpmapcfg = MapConfig.instance.getMapCfgById(this.player.mapid);
                        if (tmpmapcfg && tmpmapcfg.type === 2) {
                            this.currentMapId = this.player.mapid;
                        }

                        let mapidlist: number[] = info?.mapIdList ?? [];
                        if (mapidlist.length > 0) {
                            mapidlist.sort((amapid, bmapid) => {
                                let amapcfg = MapConfig.instance.getMapCfgById(amapid);
                                let bmapcfg = MapConfig.instance.getMapCfgById(bmapid);
                                return bmapcfg.limitpower - amapcfg.limitpower;
                            });

                        }
                        this.setOffTrust(true, Date.now(), mapidlist, this.player.mapid, info?.autoBuyHp, info?.autoBuyMp);
                        this.player.send(CmdID.s2c_req_off_trust_ack, { code: ErrorConst.SUCCEED, rte: RoleOffTrustEntity.TRUST_MAX_TIME / 1000 });
                    }
                    else {
                        this.player.send(CmdID.s2c_req_off_trust_ack, { code: ErrorConst.FAILED });
                    }

                    DB.updateRoleAttr(this.player.roleid, ["off_trust"], [this.serializeRoleDB()]);
                }
                else {
                    this.player.send(CmdID.s2c_req_off_trust_ack, { code: ErrorConst.FAILED });
                }
            }
            else {
                this.player.send(CmdID.s2c_req_off_trust_ack, { code: ErrorConst.FAILED });
            }
        }
        else {
            this.player.send(CmdID.s2c_req_off_trust_ack, { code: ErrorConst.FAILED });
        }
    }

    private setOffTrust(intrust: boolean, st?: number, mapIdList?: number[], defaultMapId?: number, isAutoBuyHp?: boolean, isAutoBuyMp?: boolean): void {
        this._inTrust = intrust;

        if (this._inTrust) {
            this.mapIdList = mapIdList;
            this.mapIdList.sort((mapIdA, mapIdB) => {
                let mapcfgA = MapConfig.instance.getMapCfgById(mapIdA);
                let mapcfgB = MapConfig.instance.getMapCfgById(mapIdB);

                return mapcfgA.limitpower - mapcfgB.limitpower;
            });

            this.defaultMapId = defaultMapId;

            this.isAutoBuyHp = isAutoBuyHp ?? false;
            this.isAutoBuyMp = isAutoBuyMp ?? false;

            this.trustStime = st;
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    private resetGain(): void {
        this._inTrust = false;

        this.trustStime = 0;

        this.gainExp = 0;
        this.gainGold = 0;
        this.killMonsterQualityList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.killMonsterMap = {};
        this.gainItemMap = {};

        this.rewardListIdx = 0;
        this.gainRewardList.length = 0;
    }

    /** 杀怪统计 */
    public killDrop(monsterId: number, quality: number, exp: number, gold: number, itemObjList: { itemId: number, count: number, quality: number }[], 
                        recyclelist: { itemId: number, count: number, quality: number }[]): void 
    {
        if (this._inTrust && this.trusting) {
            this.gainExp += exp;
            this.gainGold += gold;

            // this.log('杀怪', monsterId, this.gainExp);

            let monsterObj = this.killMonsterMap[`${monsterId}_${quality}`];//.push({monsterId, quality});
            if (monsterObj) {
                monsterObj.count++;
            }
            else {
                this.killMonsterMap[`${monsterId}_${quality}`] = { monsterId, quality, count: 1 };
            }
            this.killMonsterQualityList[quality] = this.killMonsterQualityList[quality] + 1;

            let tmplist: { itemId: number, count: number, quality: number }[] = [];
            for (let itemObj of itemObjList) {
                tmplist.push({ itemId: itemObj.itemId, quality: itemObj.quality, count: itemObj.count });
                this.pushItem(itemObj.itemId, itemObj.quality, itemObj.count);
            }
            for (let itemObj of recyclelist)
            {
                this.pushItem(itemObj.itemId, itemObj.quality, itemObj.count);
            }

            let rewardObj = new OffTrustRewardRecord(this.player.roleid, monsterId, quality, gold, exp, tmplist, Math.floor(Date.now() / 1000));
            this.pushReward(rewardObj);

            // let sql = DBUtil.createInsert("cy_debug_trust", {role_id:rewardObj.role_id, monster_id:rewardObj.monster_id, exp:rewardObj.exp, st:new Date()});
            // DB.query(sql);
        }
    }

    private pushItem(itemId: number, quality: number, count: number): void {
        let itemo = this.gainItemMap[`${itemId}_${quality}`];
        if (itemo) {
            itemo.count += count;
        }
        else {
            this.gainItemMap[`${itemId}_${quality}`] = { itemId, quality, count };
        }
    }

    /**  */
    private pushReward(reward: OffTrustRewardRecord): void {
        let tmpIdx = this.rewardListIdx % 20;
        this.gainRewardList[tmpIdx] = reward;
        this.rewardListIdx++;
    }

    //---------------------------------------------------------------------------------------------------------------------

    /** 登录检查 */
    public loginCheck(): void {
        this.stopTrust();

        if (this._inTrust) {
            this.log('离线托管：重新登录', this.gainExp);

            if (this.isReadGainDB) {
                this.player.send(CmdID.s2c_off_trust_init, {
                    rts: Math.floor((Date.now() - this.trustStime) / 1000),
                    rte: RoleOffTrustEntity.TRUST_MAX_TIME / 1000,
                    info: this.serializeGainClient(),
                    setting: this.serializeSetClient()
                });
            }
            else {
                DB.selectOffTrustList(this.player.roleid).then((data: { code: number, rows: any }) => {
                    if (data.code === ErrorConst.SUCCEED) {
                        this.gainRewardList.length = 0;

                        let rows = data.rows;
                        if (rows) {
                            for (let row of rows) {
                                let rewardObj = new OffTrustRewardRecord(row.role_id, row.monster_id, row.quality, row.gold, row.exp, DataUtil.jsonBy(row.itemlist), row.time);
                                this.pushReward(rewardObj);
                            }
                        }
                    }
                    this.player.send(CmdID.s2c_off_trust_init, {
                        rts: Math.floor((Date.now() - this.trustStime) / 1000),
                        rte: RoleOffTrustEntity.TRUST_MAX_TIME / 1000,
                        info: this.serializeGainClient(),
                        setting: this.serializeSetClient()
                    });
                    this.isReadGainDB = true;
                });
            }
        }
    }

    /** 玩家离线时检查 */
    public checkOffTrust(): boolean {
        if (this._inTrust && this.trusting) {
            this.startTrust();
            return true;
        }

        return false;
    }
    //---------------------------------------------------------------------------------------------------------------------

    /**  */
    private startTrust(): void {
        this.switchMap(true);

        EventTool.on(GameEvent.ENTER_FRAME_SEC, this.onCheckAttack);
        this.player.on(PlayerEvent.FIGHTING_HERO_DIE, this.onHeroDie);
        this.player.on(PlayerEvent.FIGHTING_BOSS_DIE, this.onBossDie);
        this.player.on(PlayerEvent.FIGHTING_BOSS_REVIVE, this.onBossRevive);
    }

    //----------------------------------------------------------------------------

    /**
     * Boss复活，检测当前地图是否有Boss，没有进入切换Boss地图检测
     */
    private onBossRevive = (bossId: number) => {
        let bosscfg = MonsterConfig.instance.getMonsterCfgById(bossId);
        this.log("trust ---> Boss复活", bossId, bosscfg.name);

        let mapcfg = this.fightingRoom.mapcfg;
        if (mapcfg) {
            let currentBossDead = this.player.bossEntity.checkBossLive(mapcfg.boss);
            if (!currentBossDead && mapcfg.id !== bossId) {
                for (let mapid of this.mapIdList) {
                    mapcfg = MapConfig.instance.getMapCfgById(mapid);
                    if (mapcfg.boss === bossId) {
                        this.switchMap();
                        return;
                    }
                }
            }
        }
        else {
            this.switchMap(true);
        }
    }

    /**
     * 当前Boss死亡，进入切换Boss地图检测
     * @param bossId 
     */
    private onBossDie = (bossId: number) => {
        let bosscfg = MonsterConfig.instance.getMonsterCfgById(bossId);
        this.log("trust ---> Boss死亡", bossId, bosscfg.name);

        let cmapcfg = this.fightingRoom.mapcfg;
        // let tmapcfg = MapConfig.instance.getMapCfgById(this.cMapId);
        if (cmapcfg) {
            if (cmapcfg.boss === bossId) {
                this.switchMap();
            }
        }
        else {
            this.switchMap(true);
        }
    }

    private heroDieTimeId: any;
    /**
     * 主角死亡，进入切换地图检测
     */
    private onHeroDie = () => {
        this.log("trust ---> 角色死亡");

        clearTimeout(this.heroDieTimeId);
        this.heroDieTimeId = setTimeout(() => {
            this.switchMap(true);
        }, 30000);
    }


    //----------------------------------------------------------------------------
    private switchTimeId: any;

    /** 切换地图 */
    private switchMap(force: boolean = false): void {
        let targetMapId: number = 0;

        clearTimeout(this.heroDieTimeId);
        this.heroDieTimeId = null;
        clearTimeout(this.switchTimeId);

        let tmpMapIdList = this.mapIdList.concat();
        if (this.currentMapId) {
            tmpMapIdList.push(this.currentMapId);
        }
        for (let mapId of tmpMapIdList) {
            let mapcfg = MapConfig.instance.getMapCfgById(mapId);
            if (mapcfg.boss && this.player.bossEntity.checkBossLive(mapcfg.boss)) {
                targetMapId = mapId;
                break;
            }
        }

        if (targetMapId === 0) {
            targetMapId = this.defaultMapId || tmpMapIdList[0];
        }

        let cmapcfg = this.fightingRoom.mapcfg;
        if (force || !cmapcfg || targetMapId !== cmapcfg.id) {
            this.log("trust ---> 切换地图倒计时", this.fightingRoom.mapcfg?.id, '->', targetMapId);

            this.fightingRoom.stop();

            this.switchTimeId = setTimeout(() => {
                this.fightingRoom.start(targetMapId);
            }, this.player.prerogative?.istuoguan ? 0 : 30000);
        }
    }

    private stopTrust(): void 
    {
        clearTimeout(this.switchTimeId);

        EventTool.off(GameEvent.ENTER_FRAME_SEC, this.onCheckAttack);
        this.player.off(PlayerEvent.FIGHTING_HERO_DIE, this.onHeroDie);
        this.player.off(PlayerEvent.FIGHTING_BOSS_DIE, this.onBossDie);
        this.player.off(PlayerEvent.FIGHTING_BOSS_REVIVE, this.onBossRevive);
    }

    //---------------------------------------------------------------------------------------------------------------------
    private fightingRoom: FightingRoom;

    /** 自动战斗 */
    private onCheckAttack = () => 
    {
        // 挂机最长时间
        if (this.trusting) 
        {
            this.player.trust_autoBuy();
        }
        else 
        {
            this.player.destroy();
        }
    }

    private get trusting(): boolean {
        return RoleOffTrustEntity.TRUST_MAX_TIME > Date.now() - this.trustStime;
    }

    //---------------------------------------------------------------------------------------------------------------------
    public saveDB(): void {
        let resultlist = this.gainRewardList.map((o) => {
            return o.serializeDB();
        });

        DB.insertOffTrustGainList(this.player.roleid, resultlist);

        DB.updateRoleAttr(this.player.roleid, ["off_trust"], [this.serializeRoleDB()]);
    }

    public deserializeRoleDB(str: string): void {
        let obj: { istrust: boolean, st: number, mapIdList: number[], defaultMapId: number, isAutoBuyHp: boolean, isAutoBuyMap: boolean, gold: number, exp: number, kill: string, reward: string, cMapId: number } = DataUtil.jsonBy(str);
        if (obj) {
            // let killBuf = Buffer.from(obj.kill, "utf-8");

            this.gainGold = obj.gold;
            this.gainExp = obj.exp;

            this.killMonsterQualityList = DataUtil.jsonBy(obj.kill) || [];

            // let killlen = killBuf.readUInt8();
            // for (let i:number = 0; i < killlen; i++)
            // {
            //     if (killBuf.byteLength >= (i + 1) * 6 + 1)
            //     {
            //         let monsterId:number = killBuf.readUInt32LE(i * 6 + 1);
            //         let quality = killBuf.readUInt8(i * 6 + 5);
            //         let count = killBuf.readUInt8(i * 6 + 6);

            //         let monstercfg = MonsterConfig.instance.getMonsterCfgById(monsterId);
            //         if (monstercfg)
            //         {
            //             this.killMonsterMap[`${monsterId}_${quality}`] = {monsterId, quality, count};
            //         }
            //     }
            // }

            let rewardlist = DataUtil.jsonBy(obj.reward);//Buffer.from(obj.reward);//
            // if (rewardlist.byteLength > 0)
            {
                let rewardLen = rewardlist?.length || 0;//rewardlist.readUInt8();
                for (let i: number = 0; i < rewardLen; i++) {
                    // if (rewardBuf.byteLength >= (i + 1) * 6 + 1)
                    {
                        let itemId = rewardlist[i * 3];// rewardlist.readUInt32LE(i * 6 + 1);
                        let quality = rewardlist[i * 3 + 1];//rewardlist.readUInt8(i * 6 + 5);
                        let count = rewardlist[i * 3 + 2];//rewardlist.readUInt8(i * 6 + 6);

                        let itemcfg = ItemConfig.instance.getItemCfgById(itemId);
                        if (itemcfg) {
                            this.pushItem(itemId, quality, count);
                        }
                    }
                }
            }

            this.currentMapId = obj.cMapId;
            this.setOffTrust(obj.istrust, obj.st * 1000, obj.mapIdList, obj.defaultMapId, obj.isAutoBuyHp, obj.isAutoBuyMap);
        }
    }

    public serializeGainClient(): string {
        let itemlist = Object.values(this.gainItemMap);
        // let killlist = Object.values(this.killMonsterMap);
        let clientObj = { gainlist: this.gainRewardList, gold: Math.ceil(this.gainGold), exp: Math.ceil(this.gainExp), itemlist: itemlist, killlist: this.killMonsterQualityList };
        let msg = DataUtil.toJson(clientObj);
        // let o = DataUtil.jsonBy(msg);
        return msg;
    }

    public serializeSetClient(): string {
        let msg = DataUtil.toJson({ defaultMapId: this.defaultMapId, mapIdList: this.mapIdList, autoBuyHp: this.isAutoBuyHp, autoBuyMp: this.isAutoBuyMp });
        return msg;
    }

    public serializeRoleDB(): string {
        if (this._inTrust) {
            // let killMonsterList = Object.values(this.killMonsterMap);
            // let monsterLen = killMonsterList.length;
            // let monsterBuff = Buffer.alloc(monsterLen * 6 + 1);
            // monsterBuff.writeUInt8(monsterLen);
            // for (let i:number = 0; i < monsterLen; i++)
            // {
            //     // if (monsterBuff.byteLength > (i + 1) * 6 + 1)
            //     {
            //         let monsterobj = killMonsterList[i];
            //         monsterBuff.writeUInt32LE(monsterobj.monsterId, i * 6 + 1);
            //         monsterBuff.writeUInt8(monsterobj.quality, i * 6 + 5);
            //         monsterBuff.writeUInt8(monsterobj.count, i * 6 + 6);
            //     }
            // }

            let rewardstr = "";

            let rewardItemList = Object.values(this.gainItemMap);
            if (rewardItemList?.length > 0) {
                let itemLen = rewardItemList.length;
                // let itembuff = Buffer.alloc(itemLen * 6 + 1);
                // itembuff.writeUInt8(itemLen, 0);
                let itemlist: number[] = [];
                for (let i: number = 0; i < itemLen; i++) {
                    // if (itemBuff.byteLength > (i + 1) * 6 + 1)
                    {
                        let itemObj = rewardItemList[i];

                        // itembuff.writeUInt32LE(itemObj.itemId, i * 6 + 1);
                        // itembuff.writeUInt8(itemObj.quality, i * 6 + 5);
                        // itembuff.writeUInt8(itemObj.count, i * 6 + 6);
                        itemlist.push(itemObj.itemId);
                        itemlist.push(itemObj.quality);
                        itemlist.push(itemObj.count);
                    }
                }

                rewardstr = DataUtil.toJson(itemlist);//itembuff.toString("utf-8");//
            }

            let monsterstr = DataUtil.toJson(this.killMonsterQualityList);// monsterBuff.toString("utf-8");

            let obj = {
                istrust: this.inTrust, st: Math.floor(this.trustStime / 1000),
                mapIdList: this.mapIdList, cMapId: this.currentMapId,
                defaultMapId: this.defaultMapId,
                isAutoBuyHp: this.isAutoBuyHp, isAutoBuyMp: this.isAutoBuyMp,
                gold: Math.floor(this.gainGold), exp: Math.floor(this.gainExp), kill: monsterstr, reward: rewardstr
            };

            return DataUtil.toJson(obj);
        }
        return null;
    }
    //---------------------------------------------------------------------------------------------------------------------

    protected onDestroy(): void {
        clearTimeout(this.heroDieTimeId);

        this.saveDB();

        this.stopTrust();
        this.player.off(CmdID.c2s_req_off_trust, this.onSetOffTrust);
        this.player = null;

        super.onDestroy();
    }
}