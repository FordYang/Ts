import SkillBuffCFG from "../../config/cfg/SkillBuffCFG";
import SkillCFG from "../../config/cfg/SkillCFG";
import SkillBuffConfig from "../../config/SkillBuffConfig";
import { ESkillId } from "../../consts/ERole";
import CyObject from "../../core/CyObject";
import GameUtil from "../../core/GameUtil";
import { IPoolObject } from "../../core/memop/IPoolObject";
import { Pool } from "../../core/memop/Pool";
import { PoolObject } from "../../core/PoolObject";
import FightingAnimalEntity from "../entity/FightingAnimalEntity";

/** 技能Buff */
export default class FightingSkillBuffVO implements IPoolObject
{
    public static pool:Pool<FightingSkillBuffVO> = new Pool(FightingSkillBuffVO, 1000);

    //-------------------------------------------------------------------------------------------
    public eid:number;

    public hp:number = 0;
    public ac:number = 0;

    public buffId:number;
    public atkEntity:FightingAnimalEntity;
    public hitEntity:FightingAnimalEntity;
    private skillCfg:SkillCFG;

    private _buffCfg:SkillBuffCFG;

    /** 上次施法时间 */
    private st:number;
    private validT:number;

    /** 永久Buff */
    private permanent:boolean;

    constructor()
    {
        
    }

    public recyclePool():void
    {
        this.eid = 0;
        this.buffId = 0;
        this.atkEntity = null;
        this.hitEntity = null;
        this.skillCfg = null;
        this._buffCfg = null;

        this.st = 0;
        this.validT = 0;
        this.permanent = false;
    }

    public setData(buffId:number, atkEntity:FightingAnimalEntity, hitEntity:FightingAnimalEntity, skillcfg:SkillCFG):void
    {
        this.eid =  GameUtil.getAutoAddId();
        this.buffId = buffId;
        this.atkEntity = atkEntity;
        this.hitEntity = hitEntity;
        this.skillCfg = skillcfg;
        
        this._buffCfg = SkillBuffConfig.instance.getBuffCfgById(buffId);

        this.st = process.uptime();
        this.validT = this._buffCfg.duration;

        this.permanent = !this._buffCfg.duration;
    }

    public resetSt():void
    {
        this.st = process.uptime();
    }

    /** 是否有效 */
    public get isValid():boolean
    {
        return this.permanent || process.uptime() - this.st < this.validT;
    }

    /**  */
    public get buffCfg():SkillBuffCFG
    {
        return this._buffCfg;
    }

    /** 是否是魔法盾 */
    public get isMagicShild():boolean
    {
        return this.skillCfg?.baseId === ESkillId.skill_2005;
    }

    public removeMagicShild():void
    {
        if (this.isMagicShild)
        {
            this.atkEntity?.resumeSkillCD(this.skillCfg.id);
        }
    }
}