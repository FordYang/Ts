import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 图鉴 monsterId = param1  quality >= param2 */
export class TujianTaskCmd extends BaseTaskCmd
{
    private get quality():number
    {
        return this.extraObj ?? 0;
    }

    private set quality(value:number)
    {
        this.extraObj = value;
    }

    private onTujianChange = ()=>
    {
        if (this.isDone)
        {
            this.quality = this.player.tujianEntity.getQualityByMonsterId(this.taskCfg.parameter1);

            this.done();
        }
    }
    
    protected runListen():void
    {
        super.runListen();

        this.quality = this.player.tujianEntity.getQualityByMonsterId(this.taskCfg.parameter1);
        
        this.player.on(PlayerEvent.HERO_TUJIAN_CHANGE, this.onTujianChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_TUJIAN_CHANGE, this.onTujianChange);
    }

    public get isDone():boolean
    {
        return this.taskCfg.parameter2 >= this.quality;
    }
}