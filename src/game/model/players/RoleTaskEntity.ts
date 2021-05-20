import { NewTaskConfig } from "../../config/NewTaskConfig";
import { TaskConfig } from "../../config/TaskConfig";
import { ENewTaskCmdID, ENewTaskState } from "../../consts/ENewTask";
import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import CyObject from "../../core/CyObject";
import ArrayUtil from "../../gear/ArrayUtil";
import DataUtil from "../../gear/DataUtil";
import MailMgr from "../../mgr/MailMgr";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";
import { BaseTaskCmd } from "./task/BaseTaskCmd";
import { EmptyTaskCmd } from "./task/EmptyTaskCmd";
import { EnterMapTaskCmd } from "./task/EnterMapTaskCmd";
import { GetCoinTaskCmd } from "./task/GetCoinTaskCmd";
import { GetItemTaskCmd } from "./task/GetItemTaskCmd";
import { IntensityTaskCmd } from "./task/IntensityTaskCmd";
import { JingmaiTaskCmd } from "./task/JingmaiTaskCmd";
import { KillMonsterTaskCmd } from "./task/KillMonsterTaskCmd";
import { LearnSkillTaskCmd } from "./task/LearnSkillTaskCmd";
import { LevelTaskCmd } from "./task/LevelTaskCmd";
import { LuckyTaskCmd } from "./task/LuckyTaskCmd";
import { OpenUiTaskCmd } from "./task/OpenUiTaskCmd";
import { PowerTaskCmd } from "./task/PowerTaskCmd";
import { RecycleCountTaskCmd } from "./task/RecycleCountTaskCmd";
import { SlotCountTaskCmd } from "./task/SlotCountTaskCmd";
import { TujianTaskCmd } from "./task/TujianTaskCmd";
import { UseItemTaskCmd } from "./task/UseItemTaskCmd";
import { XilianTaskCmd } from "./task/XilianTaskCmd";

export class RoleTaskEntity extends CyObject
{
    private player:Player;

    private openTaskCmdList:BaseTaskCmd[] = [];

    private doneIdList:number[] = [];

    //--------------------------------------------------------------------------------------

    constructor(player:Player)
    {
        super();

        this.player = player;
        this.player.on(CmdID.c2s_task_done, this.onC2sTaskDone);
        this.player.on(PlayerEvent.HERO_LEVEL_CHANGE, this.onLevelChange);
    }

    private onLevelChange = ()=>
    {
        for (let taskCmd of this.openTaskCmdList)
        {
            let isopen = taskCmd.checkCanOpen();

            isopen && this.player.send(CmdID.s2c_task_open, taskCmd.openData);
        }
    }

    private getTaskCmdById(taskId:number):BaseTaskCmd
    {
        for (let taskCmd of this.openTaskCmdList)
        {
            if (taskCmd.taskId === taskId)
            {
                return taskCmd;
            }
        }

        return null;
    }

    private onC2sTaskDone = (bodyObj:{taskId:number})=>
    {
        let taskcmd = this.getTaskCmdById(bodyObj?.taskId);
        if (taskcmd && taskcmd.isDone)
        {
            this.doneIdList.push(taskcmd.taskId);
            this.player.send(CmdID.s2c_task_done_ack, {taskId:bodyObj.taskId});

            let rewardlist = taskcmd.getRewardListByProfession(this.player.profession);
            if (rewardlist && rewardlist.length > 0)
            {
                // 领取奖励
                let taskCfg = taskcmd.taskCfg;

                let isOk = this.player.addItemList(rewardlist, false, '任务奖励');
                if (isOk === false)
                {
                    MailMgr.instance.sendSysMail(this.player.roleid, '任务奖励', taskCfg.describe, rewardlist);
                }
            }
    
            ArrayUtil.fastRemove(this.openTaskCmdList, taskcmd);
            let nextTaskCfg = taskcmd.nextTaskCfg;
            if (nextTaskCfg)
            {
                let nextTaskCmd = this.createTaskCmd(nextTaskCfg.id);
                this.openTaskCmdList.push(nextTaskCmd);
                
                if (nextTaskCmd.isCanOpen)
                {
                    this.player.send(CmdID.s2c_task_open, nextTaskCmd.openData);

                    if (nextTaskCmd.isDone)
                    {
                        this.player.send(CmdID.s2c_task_done, {taskId:nextTaskCmd.taskId});
                    }
                }
            }
            taskcmd.destroy();

            DB.updateRoleAttr(this.player.roleid, ["task"], [this.serializeDB()]);
        }
        else
        {
            this.player.send(CmdID.s2c_notice, {code: ErrorConst.FAILED});
        }
    }

    public doneTask(taskcmd:BaseTaskCmd):void
    {
        this.player.send(CmdID.s2c_task_done, {taskId:taskcmd.taskId});
    }

    private createTaskCmd(taskId:number, extraObj?:any):BaseTaskCmd
    {
        let taskCfg = NewTaskConfig.instance.getTaskCfgById(taskId);

        if (!taskCfg)
        {
            return null;
        }

        let taskcmd:BaseTaskCmd;
        if (taskCfg.type2 === ENewTaskCmdID.LEVEL)
        {
            taskcmd = new LevelTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.KILL_MONSTER)
        {
            taskcmd = new KillMonsterTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.GET_ITEM)
        {
            taskcmd = new GetItemTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.ENTER_MAP)
        {
            taskcmd = new EnterMapTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.POWER)
        {
            taskcmd = new PowerTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.GET_COIN)
        {
            taskcmd = new GetCoinTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.INTENSIFY)
        {
            taskcmd = new IntensityTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.LEARN_SKILL)
        {
            taskcmd = new LearnSkillTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.LUCKY)
        {
            taskcmd = new LuckyTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.XI_LIAN)
        {
            taskcmd = new XilianTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.JING_MAI)
        {
            taskcmd = new JingmaiTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.TU_JIAN)
        {
            taskcmd = new TujianTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.SLOT_COUNT)
        {
            taskcmd = new SlotCountTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.RECYCLE_COUNT)
        {
            taskcmd = new RecycleCountTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.OPEN_UI)
        {
            taskcmd = new OpenUiTaskCmd();
        }
        else if (taskCfg.type2 === ENewTaskCmdID.USE_ITEM)
        {
            taskcmd = new UseItemTaskCmd();
        }
        else
        {
            taskcmd = new EmptyTaskCmd();
        }

        taskcmd.init(taskId, this.player, extraObj);
        
        return taskcmd;
    }

    public deserializeDB(taskstr:string):void
    {
        let taskObj:{openList:{taskId:number, extra?:any}[], 
                    doneIdList:number[]} = DataUtil.jsonBy(taskstr);

        this.doneIdList = taskObj?.doneIdList ?? [];
        let list = taskObj?.openList;
        if (list)
        {
            for (let taskobj of list)
            {
                let taskcmd = this.createTaskCmd(taskobj.taskId, taskobj.extra);
                this.openTaskCmdList.push(taskcmd);
            }
        }
        else
        {
            let taskcfg = NewTaskConfig.instance.firstTaskCfg;

            let taskcmd = this.createTaskCmd(taskcfg.id);
            this.openTaskCmdList.push(taskcmd);
        }
    }

    public serializeDB()
    {
        let openList:any[] = [];
        for (let taskcmd of this.openTaskCmdList)
        {
            openList.push(taskcmd.getDB());
        }
        let taskObj = { openList, doneIdList:this.doneIdList };
        return DataUtil.toJson(taskObj);
    }

    public serializeClien()
    {
        let openList:any[] = [];
        for (let taskcmd of this.openTaskCmdList)
        {
            openList.push(taskcmd.clientData);
        }
        let taskObj = { openList, doneIdList:this.doneIdList };
        return DataUtil.toJson(taskObj);
    }

    //--------------------------------------------------------------------------------------
    // 测试
    /** 重置任务 */
    public testReset():void
    {
        this.testTaskSet(NewTaskConfig.instance.firstTaskCfg.id);
    }

    public testTaskSet(taskId:number):void
    {
        let taskcfg = NewTaskConfig.instance.getTaskCfgById(taskId);

        if (taskcfg)
        {
            for (let taskCmd of this.openTaskCmdList)
            {
                this.player.send(CmdID.s2c_task_done, {taskId:taskCmd.taskId});
                taskCmd.destroy();
            }
            this.openTaskCmdList.length = 0;
    
            let taskcmd = this.createTaskCmd(taskcfg.id);
            this.openTaskCmdList.push(taskcmd);
            this.player.send(CmdID.s2c_task_open, taskcmd.openData);
        }
        else
        {
            console.error("重置任务错误，ID不存在", taskId);
        }
    }

    //--------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        DB.updateRoleAttr(this.player.roleid, ["task"], [this.serializeDB()]);

        this.player.off(PlayerEvent.HERO_LEVEL_CHANGE, this.onLevelChange);
        this.player.off(CmdID.c2s_task_done, this.onC2sTaskDone);
        this.player = null;

        for (let taskcmd of this.openTaskCmdList)
        {
            taskcmd.destroy();
        }
        this.openTaskCmdList = null;

        this.doneIdList = null;

        super.onDestroy();
    }
}