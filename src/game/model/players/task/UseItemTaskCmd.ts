import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 穿戴装备个数  param1 = count */
export class UseItemTaskCmd extends BaseTaskCmd
{
    constructor()
    {
        super();
    }

    private get useCount():number
    {
        return this.extraObj ?? 0;
    }

    private set useCount(value:number)
    {
        this.extraObj = value;
    }

    private onUseItem = (itemId:number)=>
    {
        if (this.taskCfg.parameter1 === itemId)
        {
            this.useCount ++;

            if (this.isDone)
            {
                this.done();
            }
        }
    }
    
    protected runListen():void
    {
        super.runListen();
        
        this.useCount ||= 0;

		this.player.on(PlayerEvent.HERO_USE_ITEM, this.onUseItem);
    }

    protected stopListen():void
    {
        super.stopListen();
        
		this.player.off(PlayerEvent.HERO_USE_ITEM, this.onUseItem);
    }

    public get isDone():boolean
    {
        return this.useCount >= this.taskCfg.parameter2;
    }
}