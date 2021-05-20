import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 回收N次装备 param1 = count  */
export class RecycleCountTaskCmd extends BaseTaskCmd
{
    private get recycleCount():number
    {
        return this.extraObj ?? 0;
    }

    private set recycleCount(value:number)
    {
        this.extraObj = value;
    }

    constructor()
    {
        super();

    }

    private onItemRecycle = ()=>
    {
        this.recycleCount ++;

        if (this.isDone)
        {
            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();
        
        this.recycleCount ||= 0;

		this.player.on(PlayerEvent.HERO_ITEM_RECYCLE, this.onItemRecycle);
    }

    protected stopListen():void
    {
        super.stopListen();
        
		this.player.off(PlayerEvent.HERO_ITEM_RECYCLE, this.onItemRecycle);
    }

    public get isDone():boolean
    {
        return this.recycleCount >= this.taskCfg.parameter1;
    }
    
}