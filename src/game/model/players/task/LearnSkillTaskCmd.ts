import { SkillConfig } from "../../../config/SkillConfig";
import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 学习技能 param1（不填代表学习任意技能） = skillid  param2 技能等级（param1技能等级>param2) */
export class LearnSkillTaskCmd extends BaseTaskCmd
{
    private get skillLv():number
    {
        return this.extraObj ?? 0;
    }

    private set skillLv(value:number)
    {
        this.extraObj = value;
    }

    private updateSkillLv():void
    {
        let tempMaxLv:number = 0;

        let skilllist = this.player.skillMgr.learnSkillIdList;
        for (let skillId of skilllist)
        {
            let skillcfg = SkillConfig.instance.getSkillCfgById(skillId);
            if (!this.taskCfg.parameter1 || skillcfg.baseId === this.taskCfg.parameter1)
            {
                tempMaxLv = Math.max(skillcfg.level, tempMaxLv);
            }
        }
        
        this.skillLv = tempMaxLv;
    }
    
    private onSkillChange = ()=>
    {
        this.updateSkillLv();

        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();

        this.updateSkillLv();

        this.player.on(PlayerEvent.HERO_SKILL_CHANGE, this.onSkillChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_SKILL_CHANGE, this.onSkillChange);
    }

    public get isDone():boolean
    {
        return this.skillLv >= (this.taskCfg.parameter2 ?? 0);
    }
}