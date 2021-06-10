import { ENewTaskState } from "../../../consts/ENewTask";
import PlayerEvent from "../../../consts/PlayerEvent";
import Player from "../../playerObj/Player";
import { BaseTaskCmd } from "./BaseTaskCmd";

 /** 提升等级  lv >= param1 */
export class LevelTaskCmd extends BaseTaskCmd
{
    private get roleLv():number
    {
        return this.extraObj ?? 0;
    }

    private set roleLv(value:number)
    {
        this.extraObj = value;
    }

    protected runListen():void
    {
        super.runListen();

        this.roleLv = this.player.level;

        this.player.on(PlayerEvent.HERO_LEVEL_CHANGE, this.onLevelChange);
    }

    protected stopListen():void
    {
        super.stopListen();
        
        this.player.off(PlayerEvent.HERO_LEVEL_CHANGE, this.onLevelChange);
    }

    public get isDone():boolean
    {
        return this.roleLv >= this.taskCfg.parameter1;
    }

    private onLevelChange = ()=>
    {
        this.roleLv = this.player.level;

        if (this.isDone)
        {
            this.done();
        }
    }

    protected onDestroy():void
    {

        super.onDestroy();
    }

}