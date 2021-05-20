import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 进行N次洗练 param1 = count */
export class XilianTaskCmd extends BaseTaskCmd
{
    private get count():number
    {
        return this.extraObj ?? 0;
    }

    private set count(value:number)
    {
        this.extraObj = value;
    }

    private onXilianChange = ()=>
    {
        this.count ++;
        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();

        this.count ||= 0;

        this.player.on(PlayerEvent.HERO_XI_LIAN_CHANGE, this.onXilianChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_XI_LIAN_CHANGE, this.onXilianChange);
    }

    public get isDone():boolean
    {
        return this.count >= this.taskCfg.parameter1;
    }
}