import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 强化次数 param1 */
export class IntensityTaskCmd extends BaseTaskCmd
{
    private get count():number
    {
        return this.extraObj ?? 0;
    }

    private set count(value:number)
    {
        this.extraObj = value;
    }

    private onIntensifyChange = ()=>
    {
        this.count++;

        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();
        
        this.count ||= 0;

        this.player.on(PlayerEvent.HERO_INTENSIFY_CHANGE, this.onIntensifyChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_INTENSIFY_CHANGE, this.onIntensifyChange);
    }

    public get isDone():boolean
    {
        return this.count >= this.taskCfg.parameter1 || this.player.rolePart.maxIntensifyPart >= this.taskCfg.parameter1;
    }
}