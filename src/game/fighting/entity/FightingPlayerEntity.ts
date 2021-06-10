import PlayerEvent from "../../consts/PlayerEvent";
import GameUtil from "../../core/GameUtil";
import Player from "../../model/playerObj/Player";
import CmdID from "../../network/CmdID";
import FightingPlayerAttr from "../vo/FightingPlayerAttr";
import FightingAnimalEntity from "./FightingAnimalEntity";

export default class FightingPlayerEntity extends FightingAnimalEntity
{
    protected player:Player;
    protected playerAttr:FightingPlayerAttr;

    constructor()
    {
        super();
    }

    public setPlayer(player:Player, attr:FightingPlayerAttr):void
    {
        this.player = player;
        
        this.player?.on(PlayerEvent.HERO_FIGHT_ATTR_CHANGE, this.onUpdateAttr);
        this.player?.on(PlayerEvent.HERO_SKILL_CHANGE, this.onSkillChange);
        this.player?.on(PlayerEvent.HERO_LEVEL_CHANGE, this.onUpgradeLevel);

        this.setAttr(attr);
    }

    public setAttr(playerAttr:FightingPlayerAttr):void
    {
        super.setAttr(playerAttr);

        this.playerAttr = playerAttr;

        this.walkDuration = playerAttr.walkDuration;

        this.eid = playerAttr.eid || GameUtil.getAutoAddId();;
    }

    private onUpdateAttr = ()=>
    {
        let tmpmaxhp = this.maxHp;
        let tmpmaxmp = this.maxMp;

        this.playerAttr.updateAttr();

        if (tmpmaxhp !== this.maxHp || tmpmaxmp !== this.maxMp)
        {
            this.fightingRoom?.player?.send(CmdID.s2c_fighting_sync_hero_hpmp, {hp:this.hp, maxhp:this.maxHp, mp:this.mp, maxmp:this.maxMp});
        }
    }

    private onSkillChange = ()=>
    {
        this.playerAttr.upgradeSkill(this.player.learnSkillIdList);

        this.setSkillIdList(this.playerAttr.skillIdList);
    }

    private onUpgradeLevel = ()=>
    {
        this.playerAttr.upgradeLevel();
    }

    protected onDestroy()
    {
        this.player?.off(PlayerEvent.HERO_FIGHT_ATTR_CHANGE, this.onUpdateAttr);
        this.player?.off(PlayerEvent.HERO_SKILL_CHANGE, this.onSkillChange);
        this.player?.off(PlayerEvent.HERO_LEVEL_CHANGE, this.onUpgradeLevel);

        super.onDestroy();
    }
}