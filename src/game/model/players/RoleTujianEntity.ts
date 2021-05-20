import { TujianMonsterCFG } from "../../config/cfg/TujianMonsterCFG";
import MonsterConfig from "../../config/MonsterConfig";
import { TujianMonsterConfig } from "../../config/TujianMonsterConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import CyObject from "../../core/CyObject";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import RoleTujianAttachAttr from "../attachAttr/RoleTujianAttachAttr";
import Player from "../playerObj/Player";

/** 图鉴 */
export default class RoleTujianEntity extends CyObject
{
    private player: Player;

    /** ID <=> Lv */
    private monsterMap: { [monsterId: number]: number };

    private _tujianAttachAttr: RoleTujianAttachAttr;

    constructor(player: Player) 
    {
        super();

        this.player = player;

        this.monsterMap = {};

        this._tujianAttachAttr = new RoleTujianAttachAttr(this.player.profession);
    }

    public get attachAttr(): RoleTujianAttachAttr 
    {
        return this._tujianAttachAttr;
    }

    public getQualityByMonsterId(monsterId:number)
    {
        return this.monsterMap[monsterId];
    }
    //---------------------------------------------------------------------------------------------------

    public deserializeDB(bytes: Buffer): void 
    {
        if (bytes && bytes.byteLength % 4 == 0) 
        {
            let len = bytes.byteLength;

            let monsterId: number;
            let monsterLv: number;
            for (let i: number = 0; i < len; i += 4) {
                monsterId = bytes.readInt16LE(i);
                monsterLv = bytes.readInt16LE(i + 2);
                if (MonsterConfig.instance.getMonsterCfgById(monsterId)) 
                {
                    this.monsterMap[monsterId] = monsterLv;
                }
            }

            this.updateAttachAttr();
        }

        this.attachAttr.setProfession(this.player.profession);
    }

    private serializeDB(): Buffer {
        let len = Object.keys(this.monsterMap).length;

        let serBytes: Buffer = Buffer.alloc(len * 4);
        let idx: number = 0;
        for (let monsterId in this.monsterMap) {
            serBytes.writeInt16LE(parseInt(monsterId), idx * 4);
            serBytes.writeInt16LE(this.monsterMap[monsterId], idx * 4 + 2);
            idx++;
        }
        return serBytes
    }

    public serializeClient(): string {
        return JSON.stringify(this.monsterMap);
    }
    //---------------------------------------------------------------------------------------------------
    public sendUpgrad(code: number, monsterId: number, monsterLv: number): void {
        this.player.send(CmdID.s2c_role_tujian_upgrade, { code: code, monsterId: monsterId, monsterLv: monsterLv });
    }
    //---------------------------------------------------------------------------------------------------

    public c2sUpgrade(bodyObj: { monsterId: number }): void 
    {
        let tjMonsterCfg = TujianMonsterConfig.instance.getMonsterInfoByLv(bodyObj.monsterId, 1);

        if (!tjMonsterCfg) {
            // 怪物ID不存在
            this.sendUpgrad(ErrorConst.NO_MONSTER_ID, 0, 0);

            return;
        }

        // 升级  （判断最大等级；杀怪数是否满足；清空杀怪数，加奖励
        let monsterLv = this.monsterMap[bodyObj.monsterId] ?? 0;
        let nextLv: number = monsterLv + 1;

        if (TujianMonsterConfig.instance.checkMaxLv(bodyObj.monsterId, monsterLv)) 
        {
            // 已达到最大值 
            this.sendUpgrad(ErrorConst.MAX_LV, 0, 0);
            return;
        }

        if (this.checkKillMonster(bodyObj.monsterId, nextLv)) 
        {
            this.monsterMap[bodyObj.monsterId] = nextLv;
            this.updateAttachAttr();

            /** 升级后杀怪数重置 */
            this.player.killMonsterEntity.resetKillMonster(bodyObj.monsterId);

            DB.updateRoleAttr(this.player.roleid, ["tujian"], [this.serializeDB()]);

            // 满足杀怪数可升级
            this.sendUpgrad(ErrorConst.SUCCEED, bodyObj.monsterId, nextLv);

            tjMonsterCfg = TujianMonsterConfig.instance.getMonsterInfoByLv(bodyObj.monsterId, nextLv);

            let rewards = tjMonsterCfg?.reward;
            // 发奖励
            if (rewards && rewards.length) 
            {
                for (let i: number = 0; i < rewards.length; i += 2) 
                {
                    this.player.addItem(rewards[i], rewards[i + 1], "图鉴奖励", false, null, true);
                }
            }

            this.player.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
            this.player.emit(PlayerEvent.HERO_TUJIAN_CHANGE);
        }
        else 
        {
            this.sendUpgrad(ErrorConst.MONSTER_KILL_NUM, 0, 0);
        }
    }

    /**
     * 
     * @param monsterId 
     * @param lv 
     * @returns 
     */
    private checkKillMonster(monsterId: number, lv: number): boolean {
        let tujianMonsnterCfg = TujianMonsterConfig.instance.getMonsterInfoByLv(monsterId, lv);
        return this.player.killMonsterEntity.checkKillMonster(monsterId, tujianMonsnterCfg.killnum);
    }

    private updateAttachAttr(): void 
    {
        this._tujianAttachAttr.reset();

        let tujianCfg: TujianMonsterCFG;
        for (let monsterId in this.monsterMap) 
        {
            tujianCfg = TujianMonsterConfig.instance.getMonsterInfoByLv(parseInt(monsterId), this.monsterMap[monsterId]);

            if (tujianCfg) 
            {
                this._tujianAttachAttr.addCFG(tujianCfg);
            }
            else 
            {
                Logger.log(`图鉴表中未找到怪物 MonsterID:${monsterId}`);
            }
        }
    }

    //-----------------------------------------------------------------------------------
    protected onDestroy():void
    {
        
        super.onDestroy();
    }
}