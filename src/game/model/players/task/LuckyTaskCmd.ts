import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 幸运达到 lucky >= param1 */
export class LuckyTaskCmd extends BaseTaskCmd
{
    private get lucky():number
    {
        return this.extraObj ?? 0;
    }

    private set lucky(value:number)
    {
        this.extraObj = value;
    }

    private onAttrChange = ()=>
    {
        this.lucky = this.player.totalAttr.lucky;

        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();

        this.lucky = this.player.totalAttr.lucky;

        this.player.on(PlayerEvent.HERO_FIGHT_ATTR_CHANGE, this.onAttrChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_FIGHT_ATTR_CHANGE, this.onAttrChange);
    }

    public get isDone():boolean
    {
        return this.lucky >= this.taskCfg.parameter1;
    }
}