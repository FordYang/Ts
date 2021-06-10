import { ENewTaskCmdID, ENewTaskType } from "../../consts/ENewTask";
import { EProfessionType } from "../../consts/ERole";

/**任务 */
export interface NewTaskCFG 
{
    id:number;

    /** 任务顺序 */
    order:number;

    name:string;

    /** 
     * "任务类型
        1.主线
        2.支线
        3.日常
        4.周常"
     */
    type:ENewTaskType;
    /** 描述 */
    describe:string;
    /** 接受等级 */
    lvl:number;
    /** "职业限制
        不填：无限制
        1.战士
        2法师
        3道士"
 */
    profession:EProfessionType;
    /** 奖励1（不带品质 [itemId, count, ...] */
    reward1:number[];
    /** 奖励2 （带品质 [itemId, count, quality, ...] */
    reward2:number[];

    /** 战士奖励 */
    reward_zs:number[];
    /** 法师奖励 */
    reward_fs:number[];
    /** 道士奖励 */
    reward_ds:number[];
    
    /** 是否引导 */
    guide:boolean;
    /** 任务目标 */
    type2:ENewTaskCmdID;
    /** 目标参数1 */
    parameter1:number;
    /** 目标参数2 */
    parameter2:number;
    /** 参数3 数组类型 */
    parameter3:number[];
    /**  */
    exp:number;
    gold:number;
    yuanbao:number;

    //--------------------------------------------------------------------
    _rewardlist:{itemId:number, count:number, quality:number}[];

    zs_reward:{itemId:number, count:number, quality:number}[];
    fs_reward:{itemId:number, count:number, quality:number}[];
    ds_reward:{itemId:number, count:number, quality:number}[];
    
    _zsNext:NewTaskCFG;
    _fsNext:NewTaskCFG;
    _dsNext:NewTaskCFG;
}