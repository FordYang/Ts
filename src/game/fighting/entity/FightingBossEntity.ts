import MonsterConfig from "../../config/MonsterConfig";
import { EFightingHurtType } from "../../consts/EFightingHurtType";
import FightingMonsterEntity from "./FightingMonsterEntity";

export default class FightingBossEntity extends FightingMonsterEntity
{

    protected changeHp(eid:number, type:EFightingHurtType, changeHp:number, nowHp:number):void
    {
        super.changeHp(eid, type, changeHp, nowHp);

        this.fightingRoom.statBossHp(this.monsterId, nowHp);
    }

    public get dropIdList():number[]
    {
        return MonsterConfig.instance.getDropIdList(this._monsterAttr.monsterId, 4);
    }
    
    protected onDie():void
    {
        this.fightingRoom.dieBoss(this);

        super.onDie();
    }
}