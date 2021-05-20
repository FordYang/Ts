import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 穿戴装备个数  param1 = count */
export class SlotCountTaskCmd extends BaseTaskCmd
{
    constructor()
    {
        super();
    }

    private get count():number
    {
        return this.extraObj ?? 0;
    }

    private set count(value:number)
    {
        this.extraObj = value;
    }

    private onEquipPut = ()=>
    {
        this.count = this.player.rolePart.equipCount;
        
        if (this.isDone)
        {
            this.done();
        }
    }
    
    protected runListen():void
    {
        super.runListen();

        this.count = this.player.rolePart.equipCount;
        
		this.player.on(PlayerEvent.HERO_EQUIP_PUT, this.onEquipPut);
    }

    protected stopListen():void
    {
        super.stopListen();
        
		this.player.off(PlayerEvent.HERO_EQUIP_PUT, this.onEquipPut);
    }

    public get isDone():boolean
    {
        return this.count >= this.taskCfg.parameter1;
    }
    
}