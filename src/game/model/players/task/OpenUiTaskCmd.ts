import { EUI } from "../../../consts/EUI";
import PlayerEvent from "../../../consts/PlayerEvent";
import { BaseTaskCmd } from "./BaseTaskCmd";

/** 打开面板 param1 = ui_id */
export class OpenUiTaskCmd extends BaseTaskCmd
{
    constructor()
    {
        super();

    }

    private get isOk():boolean
    {
        return this.extraObj ?? false;
    }

    private set isOk(value:boolean)
    {
        this.extraObj = value;
    }

    private onOpenUi = (uiId:EUI)=>
    {
        if (uiId === this.taskCfg.parameter1)
        {
            this.isOk = true;
    
            this.done();
        }
    }
    
    protected runListen():void
    {
        super.runListen();

        this.player.on(PlayerEvent.OPEN_UI, this.onOpenUi);
    }

    protected stopListen():void
    {
        super.stopListen();

        this.player.off(PlayerEvent.OPEN_UI, this.onOpenUi);
    }

    public get isDone():boolean
    {
        return this.isOk;
    }
    
}