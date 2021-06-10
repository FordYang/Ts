import { EQuality } from "../../consts/EGame";
import CyObject from "../../core/CyObject";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

export default class RoleKillMonsterEntity extends CyObject
{
    private player: Player;

    //-------------------------------------------------------------------------------------------------------------

    private tujianMap: { [monsterId: number]: number };
    private totalMap: { [monsterId: number]: number };

    private saveDirty: boolean = false;

    constructor(player: Player) 
    {
        super();

        this.player = player;

        this.tujianMap = {};
        this.totalMap = {};
    }

    public update_min(): void 
    {
        this.saveDB();
    }

    private saveDB(): void 
    {
        if (this.saveDirty) 
        {
            this.saveDirty = false;

            let tujian = this.serializeTujianDB();
            let total = this.serializeTotalDB();
            DB.updateRoleAttr(this.player.roleid, ["kill_monster"], [DataUtil.toJson({tujian:tujian, total:total})]);
        }
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------

    public serializeTujianClient(): string 
    {
        return JSON.stringify(this.tujianMap);
    }

    public serializeTotalClient(): string 
    {
        return JSON.stringify(this.totalMap);
    }

    /**
     * 
     * @param killMonsterByte 杀怪数（会被模块清零）"monsterId,killnum;monsterId,killnum;..."
     * @param killTotalMonsterByte 总杀怪数 "monsterId,killnum;monsterId,killnum;..."
     */
    public deserializeDB(killmonster:string): void 
    {
        let dbObj:{tujian:number[], total:number[]} = DataUtil.jsonBy(killmonster);
        if (dbObj)
        {
            let tmplist = dbObj.tujian;
            if (tmplist)
            {
                for (let i:number = 0; i < tmplist.length; i+=2)
                {
                    this.tujianMap[tmplist[i]] = tmplist[i + 1];
                }
            }

            tmplist = dbObj.total;
            if (tmplist)
            {
                for (let i:number = 0; i < tmplist.length; i+=2)
                {
                    this.totalMap[tmplist[i]] = tmplist[i + 1];
                }
            }
        }
    }

    public serializeTujianDB():number[] 
    {
        let retlist:number[] = [];
        for (let monsterId in this.tujianMap) 
        {
            retlist.push(parseInt(monsterId));
            retlist.push(this.tujianMap[monsterId]);
        }
        return retlist;
    }

    public serializeTotalDB(): number[]  
    {
        let retlist:number[] = [];
        for (let monsterId in this.totalMap) 
        {
            retlist.push(parseInt(monsterId));
            retlist.push(this.totalMap[monsterId]);
        }
        return retlist;
    }

    public asynClient(monsterId: number): void 
    {
        let killcount = this.getKillMonster(monsterId);
        let killtotal = this.getTotalKillMonster(monsterId);

        this.player.send(CmdID.s2c_sync_kill_monster_count, { monsterId: monsterId, count: killcount, totalcount: killtotal });
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------
    /** 增加杀怪数 */
    public addKillMonster(monsterId: number, count: number): void {
        this.saveDirty = true;
        this.tujianMap[monsterId] = (this.tujianMap[monsterId] || 0) + count;
        this.totalMap[monsterId] = (this.totalMap[monsterId] || 0) + count;

        this.asynClient(monsterId);
    }

    /** 重置杀怪数 */
    public resetKillMonster(monsterId: number): void {
        this.saveDirty = true;
        this.tujianMap[monsterId] = 0;

        this.asynClient(monsterId);
    }

    /** 消耗杀怪数 */
    public expendKillMonster(monsterId: number): void {
        this.saveDirty = true;
        this.tujianMap[monsterId] = Math.max(this.tujianMap[monsterId] - monsterId, 0);

        this.asynClient(monsterId);
    }

    /** 获取杀怪数 */
    public getKillMonster(monsterId: number): number {
        return this.tujianMap[monsterId] ?? (this.tujianMap[monsterId] = 0);
    }

    /** 获取总杀怪数 */
    public getTotalKillMonster(monsterId: number): number 
    {
        return this.totalMap[monsterId] ?? (this.totalMap[monsterId] = 0);
    }

    /** 检测是否满足杀怪数 */
    public checkKillMonster(monsterId: number, count: number): boolean {
        return this.getKillMonster(monsterId) >= count;//Math.random() > 0.5;//true;//
    }
    /**--------------------------------------------------------------------------------- */
    /**品质数量 */
    public getEquipByQuality(quality: EQuality) {
        return this.player.bag.equipRecord[quality];
    }

    /**获取技能学习个数 */
    public getSkillLearnCnt() {
        let slist = this.player.learnSkillIdList;
        /**去除普通攻击 */
        return slist.length - 1;
    }

    //-----------------------------------------------------------------------------------
    protected onDestroy():void
    {
        this.saveDB();
        
        super.onDestroy();
    }
}