import SkillCFG from "../../config/cfg/SkillCFG";
import { SkillConfig } from "../../config/SkillConfig";
import { ESkillId } from "../../consts/ERole";
import CyObject from "../../core/CyObject";
import FightingSkillVO from "../vo/FightingSkillVO";
import FightingAnimalEntity from "./FightingAnimalEntity";

export default class FightingSkillEntity extends CyObject
{
    private _owner:FightingAnimalEntity;

    private skillIdMap:{[skillId:number]:SkillCFG};
    private baseIdMap:{[skillId:number]:number};

    private skillVoMap:{[skillId:number]:FightingSkillVO};
    public skillVoList:FightingSkillVO[];

    constructor(owner:FightingAnimalEntity)
    {
        super();

        this._owner = owner;

        this.skillIdMap = {};
        this.baseIdMap = {};

        this.skillVoMap = {};
        this.skillVoList = [];
    }

    public setSkillIdList(skillIdList:number[]):void
    {
        skillIdList = skillIdList || [];
        
        this.skillVoList.length = 0;
        this.skillIdMap = {};
        this.baseIdMap = {};
        this.skillVoMap = {};
        
        let baseSkillId:number;
        for (let skillId of skillIdList)
        {
            let skillVo = new FightingSkillVO(this._owner, skillId);
            this.skillVoList.push(skillVo);
            this.skillVoMap[skillId] = skillVo;

            if (skillId > 10000)
            {
                baseSkillId = parseInt(skillId.toString().substr(0, 4));
            }
            else
            {
                baseSkillId = skillId;
            }
            this.baseIdMap[baseSkillId] = skillId;

            let skillCfg = SkillConfig.instance.getSkillCfgById(skillId);
            this.skillIdMap[skillId] = skillCfg;
        }

        this.skillVoList.sort((a, b)=>
        {
            return b.priority - a.priority;
        });
    }

    public getCfgByBaseId(baseId:number):SkillCFG
    {
        let skillId = this.baseIdMap[baseId];
        if (skillId)
        {
            let skillcfg = this.skillIdMap[skillId];
            return skillcfg;
        }
        return null;
    }

    /** 获取一个可以使用的技能VO */
    public getCanSkillVo(atkEntity:FightingAnimalEntity, targetEntity:FightingAnimalEntity):FightingSkillVO
    {
        let resultSkillVo:FightingSkillVO;
        for (let skillvo of this.skillVoList)
        {
            if (this._owner.mp >= skillvo.skillCfg.spell)
            {
                if (!skillvo.cd && skillvo.isTrigger)
                {
                    if (!resultSkillVo)
                    {
                        resultSkillVo = skillvo;
                    }

                    let tmpDist = Math.max(Math.abs(atkEntity.sx - targetEntity.sx), Math.abs(atkEntity.sy - targetEntity.sy));
                    if (skillvo.skillCfg.distance >= tmpDist)
                    {
                        return skillvo;
                    }
                }
            }
        }
        return resultSkillVo;
    }

    /** 是否学习过这个技能 */
    public checkLearnBySkillId(skillId:number):boolean
    {
        return !!this.skillIdMap[skillId];
    }

    public getLearnSkillVO(skillId:number):FightingSkillVO
    {
        return this.skillVoMap[skillId];
    }

    /** 法术精通 */
    public get triggerTwoSkill():SkillCFG
    {
        if (this.baseIdMap[ESkillId.skill_2006])
        {
            let skillcfg = this.getCfgByBaseId(ESkillId.skill_2006);
            if (skillcfg.gailv > Math.random() * 100)
            {
                return skillcfg;
            }
        }
        return null;
    }

    /** 攻杀 */
    public get triggerGongsha():boolean
    {
        if (this.baseIdMap[ESkillId.skill_1002])
        {
            let skillcfg = this.getCfgByBaseId(ESkillId.skill_1002);
            if (skillcfg.gailv > Math.random() * 100)
            {
                return true;
            }
        }
        return false;
    }

    //-----------------------------------------------------------------------------------------------------
    protected onDestroy():void
    {
        
        super.onDestroy();
    }
}