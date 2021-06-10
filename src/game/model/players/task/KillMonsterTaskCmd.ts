import PlayerEvent from "../../../consts/PlayerEvent";
import Player from "../../playerObj/Player";
import { BaseTaskCmd } from "./BaseTaskCmd";

export class KillMonsterTaskCmd extends BaseTaskCmd
{
    private get killcount():number
    {
        return this.extraObj ?? 0;
    }

    private set killcount(value:number)
    {
        this.extraObj = value;
    }
    
    protected runListen():void
    {
        super.runListen();

        this.killcount ||= 0;

        this.player.on(PlayerEvent.FIGHTING_KILL_MONSTER, this.onKillMonster);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.FIGHTING_KILL_MONSTER, this.onKillMonster);
    }

    public get isDone():boolean
    {
        return this.killcount >= this.taskCfg.parameter2;
    }

    private onKillMonster = (monsterId:number)=>
    {
        if (this.taskCfg.parameter3 && this.taskCfg.parameter3.indexOf(monsterId) !== -1)
        {
            this.killcount ++;

            if (this.isDone)
            {
                this.done();
            }
        }
    }

    protected onDestroy():void
    {

        super.onDestroy();
    }
}