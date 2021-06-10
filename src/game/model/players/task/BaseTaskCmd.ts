import { NewTaskCFG } from "../../../config/cfg/NewTaskCFG";
import { NewTaskConfig } from "../../../config/NewTaskConfig";
import { ENewTaskState } from "../../../consts/ENewTask";
import { EProfessionType } from "../../../consts/ERole";
import CyObject from "../../../core/CyObject";
import DataUtil from "../../../gear/DataUtil";
import CmdID from "../../../network/CmdID";
import Player from "../../playerObj/Player";
import { RoleTaskEntity } from "../RoleTaskEntity";

export class BaseTaskCmd extends CyObject
{
    protected player:Player;
    protected taskEntity:RoleTaskEntity;

    public taskCfg:NewTaskCFG;
    
    private _extraObj:any;


    constructor()
    {
        super();
    }

    public getRewardListByProfession(profession:EProfessionType)
    {
        if (profession === EProfessionType.DAOSHI)
        {
            return this.taskCfg._rewardlist.concat(this.taskCfg.ds_reward);
        }
        else if (profession === EProfessionType.FASHI)
        {
            return this.taskCfg._rewardlist.concat(this.taskCfg.fs_reward);
        }
        else
        {
            return this.taskCfg._rewardlist.concat(this.taskCfg.zs_reward);
        }
    }

    public get taskId():number
    {
        return this.taskCfg.id;
    }

    public get nextTaskCfg()
    {
        return NewTaskConfig.instance.getNextByProfession(this.player.profession, this.taskId);
    }

    protected initExtra():void
    {

    }

    public get extraObj()
    {
        return this._extraObj;
    }

    public set extraObj(value:any)
    {
        if (this._extraObj !== value)
        {
            this._extraObj = value;

            if (this._extraObj)
            {
                this.player.send(CmdID.s2c_task_update_extra, {taskId:this.taskId, extra:DataUtil.toJson(this._extraObj)});
            }
        }
    }

    public init(taskId:number, player:Player, extraObj:any):void
    {
        this.taskCfg = NewTaskConfig.instance.getTaskCfgById(taskId);

        this.player = player;
        this.taskEntity = this.player.taskEntity;

        this._extraObj = extraObj;

        this.checkCanOpen();
    }

    public checkCanOpen():boolean
    {
        if (!this.islisten && this.isCanOpen && !this.isDone)
        {
            this.runListen1();
            return true;
        }
        return false;
    }

    private islisten:boolean = false;
    private runListen1():void
    {
        if (this.islisten === false)
        {
            this.islisten = true;
    
            this.runListen();
        }
    }

    protected runListen():void
    {

    }

    private stopListen1():void
    {
        if (this.islisten)
        {
            this.islisten = false;

            this.stopListen();
        }
    }
    
    protected stopListen():void
    {

    }

    /** 是否可以开启这个任务 */
    public get isCanOpen():boolean
    {
        return !this.taskCfg.lvl || this.player.level >= this.taskCfg.lvl;
    }

    public get isDone():boolean
    {
        return false;
    }

    public done():void
    {
        this.stopListen1();

        this.taskEntity.doneTask(this);
    }
    //----------------------------------------------------------------------------------

    public getDB()
    {
        return {taskId:this.taskCfg.id, extra:this._extraObj}; 
    }

    public get clientData()
    {
        return {taskId:this.taskCfg.id, isDone:this.isDone, extra:this._extraObj};
    }

    public get openData()
    {
        return {taskId:this.taskCfg.id, extra:DataUtil.toJson(this._extraObj)};
    }

    //----------------------------------------------------------------------------------

    protected onDestroy()
    {
        this.stopListen1();

        this.player = null;

        super.onDestroy();
    }
}