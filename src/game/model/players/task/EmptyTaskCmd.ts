import Logger from "../../../gear/Logger";
import Player from "../../playerObj/Player";
import { BaseTaskCmd } from "./BaseTaskCmd";

export class EmptyTaskCmd extends BaseTaskCmd
{
    constructor()
    {
        super();

    }
    
    protected runListen():void
    {
        super.runListen();

    }

    protected stopListen():void
    {
        super.stopListen();
        
    }

    public get isDone():boolean
    {
        return true;
    }
    
    public init(taskId:number, player:Player, extraObj:any):void
    {
        super.init(taskId, player, extraObj);
        
        Logger.error("任务命令配置异常  TaskID:", taskId, '->', this.taskCfg.name);
    }
}