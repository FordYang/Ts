import SkillCFG from "../../config/cfg/SkillCFG";
import { SkillConfig } from "../../config/SkillConfig";
import { ESkillId } from "../../consts/ERole";
import { ESkillTriggerType } from "../../consts/ESkillTriggerType";
import Logger from "../../gear/Logger";
import FightingAnimalEntity from "../entity/FightingAnimalEntity";

/** 技能 */
export default class FightingSkillVO
{
    private _skillCfg:SkillCFG;
    private _owner:FightingAnimalEntity;

    // private isUse:boolean = false;

    public pauseCD:boolean = false;

    /** 上次施法时间 */
    private cdSt:number;

    constructor(owner:FightingAnimalEntity, skillId:number)
    {
        this._owner = owner;
        this.skillCfg = SkillConfig.instance.getSkillCfgById(skillId);
        
        this.cdSt = -100;
    }

    public get skillId():number
    {
        return this.skillCfg.id;
    }

    public get skillCfg():SkillCFG
    {
        return this._skillCfg;
    }
    public set skillCfg(val:SkillCFG)
    {
        this._skillCfg = val;
    }

    /** 技能优先级 */
    public get priority():number
    {
        return this._skillCfg.priority;
    }

    /** 使用当前技能，重置 */
    public use():void
    {
        this.cdSt = process.uptime();
        // this.isUse = true;
    }

    /** 技能是否冷却中 */
    public get cd():boolean
    {
        if (this.pauseCD)
        {
            return true;
        }
        return process.uptime() - this.cdSt < this.skillCfg.basecd;
    }

    /** 技能触发类型 */
    public get isTrigger():boolean
    {
        let skillcfg = this._skillCfg;
        if (skillcfg.triggertype === ESkillTriggerType.ACTIVE)
        {
            // 主动
            return true;
        }
        else if (skillcfg.triggertype === ESkillTriggerType.PASSIVE)
        {
            return false;
            // let baseId = SkillConfig.instance.getBaseId(skillcfg.id);
            // if (baseId === ESkillId.skill_1002 || baseId === ESkillId.skill_2006)
            // {
            //     return false;
            // }
            // // 被动
            // return !this.isUse;
        }
        else if (skillcfg.triggertype === ESkillTriggerType.HP)
        {
            // 血量触发
            let hpRate = 100 * this._owner.hp / this._owner.maxHp;
            if (skillcfg.parameter1 > hpRate)
            {
                return true;
            }

            let petlist = this._owner.petlist;
            for (let pet of petlist)
            {
                let diff = Math.min(Math.abs(this._owner.sx - pet.sx), Math.abs(this._owner.sy - pet.sy));
                if (diff <= skillcfg.areaarg1)
                {
                    let petHpRate = 100 * pet.hp / pet.maxHp;
                    if (skillcfg.parameter1 > petHpRate)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        else if (skillcfg.triggertype === ESkillTriggerType.DEAD)
        {
            // 死亡触发
            return !this._owner.isLive;
        }
        else if (skillcfg.triggertype === ESkillTriggerType.BUFF)
        {
            // Buff不存在时触发
            if (skillcfg.parameter1)
            {
                return !this._owner.checkExistBuffID(skillcfg.parameter1);
            }
            return false;
        }
        else if (skillcfg.triggertype === ESkillTriggerType.SUMMON)
        {
            // 召唤物
            return skillcfg.petnum > this._owner.childCount;
        }

        return false;
    }
}