import PlayerEvent from "../../../consts/PlayerEvent";
import Player from "../../playerObj/Player";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 经脉 lv >= param1 || xueweiId >= param2 */
export class JingmaiTaskCmd extends BaseTaskCmd
{

    protected runListen():void
    {
        super.runListen();

        this.player.on(PlayerEvent.HERO_JING_MAI_CHANGE, this.onJingmaiChange);
    }

    private onJingmaiChange = ()=>
    {
        if (this.isDone)
        {
            this.done();
        }
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_JING_MAI_CHANGE, this.onJingmaiChange);
    }

    public get isDone():boolean
    {
        return this.player.jingmaiEntity.getLv() >= this.taskCfg.parameter1 || this.player.jingmaiEntity.getXueweiId() >= this.taskCfg.parameter2;
    }
}