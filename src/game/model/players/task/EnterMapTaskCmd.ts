import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 进入地图 mapId = param1 */
export class EnterMapTaskCmd extends BaseTaskCmd
{
    private get isOk():boolean
    {
        return this.extraObj ?? false;
    }

    private set isOk(value:boolean)
    {
        this.extraObj = value;
    }

    private onMapChange = (mapid:number)=>
    {
        if (this.taskCfg.parameter1 === mapid)
        {
            this.isOk = true;

            this.done();
        }
    }

    protected runListen():void
    {
        super.runListen();

        this.isOk = this.player.mapid === this.taskCfg.parameter1;
        
        this.player.on(PlayerEvent.HERO_MAP_CHANGE, this.onMapChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_MAP_CHANGE, this.onMapChange);
    }

    public get isDone():boolean
    {
        return this.isOk;
    }
}