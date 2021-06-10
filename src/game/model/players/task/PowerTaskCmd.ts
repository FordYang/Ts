import PlayerEvent from "../../../consts/PlayerEvent";
import Player from "../../playerObj/Player";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 战力达到 power >= param1 */
export class PowerTaskCmd extends BaseTaskCmd
{
    private get maxPower():number
    {
        return this.extraObj ?? this.player.getCombat();
    }

    private set maxPower(value:number)
    {
        this.extraObj = value;
    }
    
    private onPowerChange = (power:number)=>
    {
        this.maxPower = Math.max(this.maxPower, power);

        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();
        
        this.maxPower = this.player.getCombat();

        this.player.on(PlayerEvent.HERO_POWER_CHANGE, this.onPowerChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_POWER_CHANGE, this.onPowerChange);
    }

    public get isDone():boolean
    {
        return this.maxPower >= this.taskCfg.parameter1;
    }
}