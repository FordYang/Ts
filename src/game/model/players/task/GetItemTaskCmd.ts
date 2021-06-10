import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 获得物品 param1 = itemId */
export class GetItemTaskCmd extends BaseTaskCmd
{
    private onGetItem = (itemId:number, quality:number)=>
    {
        if (this.taskCfg.parameter1 === itemId && (!this.taskCfg.parameter2 || this.taskCfg.parameter2 === quality))
        {
            if (this.isDone)
            {
                this.done();
            }
        }
    }

    protected runListen():void
    {
        super.runListen();

        this.player.on(PlayerEvent.HERO_GET_ITEM, this.onGetItem);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_GET_ITEM, this.onGetItem);
    }

    public get isDone():boolean
    {
        return this.player.bag.getCountByItemId(this.taskCfg.parameter1) > 0;
    }
}