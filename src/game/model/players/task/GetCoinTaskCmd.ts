import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 获得金币 coin >= param1 */
export class GetCoinTaskCmd extends BaseTaskCmd
{
    private get maxCoin():number
    {
        return this.extraObj ?? this.player.money;
    }

    private set maxCoin(value:number)
    {
        this.extraObj = Math.max(this.maxCoin, value);
    }

    private onCoinChange = (coin:number)=>
    {
        this.maxCoin = coin;

        if (this.isDone)
        {
            this.done();
        }
    }
    
    protected runListen():void
    {
        super.runListen();

        this.maxCoin = this.player.money;
        this.player.on(PlayerEvent.HERO_COIN_CHANGE, this.onCoinChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_COIN_CHANGE, this.onCoinChange);
    }

    public get isDone():boolean
    {
        return this.maxCoin >= this.taskCfg.parameter1;
    }
}