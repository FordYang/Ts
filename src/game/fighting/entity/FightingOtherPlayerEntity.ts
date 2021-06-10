import FightingBasePlayerEntity from "./FightingPlayerEntity";

export class FightingOtherPlayerEntity extends FightingBasePlayerEntity
{

    protected onDie():void
    {
        super.onDie();
        
        this.fightingRoom.diePlayer(this);
    }
}