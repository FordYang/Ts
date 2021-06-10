import { EItemKey } from "../consts/EItem";
import { EProfessionType } from "../consts/ERole";
import { NewTaskCFG } from "./cfg/NewTaskCFG";

export class NewTaskConfig
{
    private static _instance: NewTaskConfig;
    public static get instance(): NewTaskConfig 
    {
        if (!NewTaskConfig._instance) 
        {
            NewTaskConfig._instance = new NewTaskConfig();
        }
        return NewTaskConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: NewTaskCFG[];
    private _tableMap:{[taskId:number]:NewTaskCFG};

    constructor() 
    {

    }

    public parseJson(jsonTable: NewTaskCFG[]): void 
    {
        jsonTable.sort((a, b)=>{
            return a.order === b.order ? a.id - b.id : a.order - b.order;
        });

        this._table = jsonTable;
        this._tableMap = Object.create(null);


        this._tableMap[this._table[0].id] = this._table[0];

        let zsTaskCfg:NewTaskCFG;// = this._table[0];
        let fsTaskCfg:NewTaskCFG;// = this._table[0];
        let dsTaskCfg:NewTaskCFG;// = this._table[0];
        let tempTaskCfg:NewTaskCFG;
        let tasklen = this._table.length;
        for (let i:number = 0; i < tasklen; i++)
        {
            tempTaskCfg = this._table[i];

            if (i === 0)
            {
                zsTaskCfg = tempTaskCfg;
                fsTaskCfg = tempTaskCfg;
                dsTaskCfg = tempTaskCfg;
            }
            else
            {
                if (tempTaskCfg.profession === EProfessionType.ZHANSHI)
                {
                    zsTaskCfg._zsNext = tempTaskCfg;
                    zsTaskCfg = tempTaskCfg;
                }
                else if (tempTaskCfg.profession === EProfessionType.FASHI)
                {
                    dsTaskCfg._dsNext = tempTaskCfg;
                    dsTaskCfg = tempTaskCfg;
                }
                else if (tempTaskCfg.profession === EProfessionType.DAOSHI)
                {
                    dsTaskCfg._dsNext = tempTaskCfg;
                    dsTaskCfg = tempTaskCfg;
                }
                else
                {
                    zsTaskCfg._zsNext = tempTaskCfg;
                    zsTaskCfg = tempTaskCfg;
    
                    dsTaskCfg._dsNext = tempTaskCfg;
                    dsTaskCfg = tempTaskCfg;
    
                    fsTaskCfg._fsNext = tempTaskCfg;
                    fsTaskCfg = tempTaskCfg;
                }
            }

            tempTaskCfg._rewardlist = [];
            if (tempTaskCfg.yuanbao)
            {
                tempTaskCfg._rewardlist.push({itemId:EItemKey.itemid_103037, count:tempTaskCfg.yuanbao, quality:1});
            }
            if (tempTaskCfg.gold)
            {
                tempTaskCfg._rewardlist.push({itemId:EItemKey.itemid_103035, count:tempTaskCfg.gold, quality:1});
            }
            if (tempTaskCfg.exp)
            {
                tempTaskCfg._rewardlist.push({itemId:EItemKey.itemid_103046, count:tempTaskCfg.exp, quality:1});
            }
            if (tempTaskCfg.reward1)
            {
                while (tempTaskCfg.reward1.length >= 2)
                {
                    tempTaskCfg._rewardlist.push({itemId:tempTaskCfg.reward1.shift(), count:tempTaskCfg.reward1.shift(), quality:1});
                }
            }
            if (tempTaskCfg.reward2)
            {
                while (tempTaskCfg.reward2.length >= 3)
                {
                    tempTaskCfg._rewardlist.push({itemId:tempTaskCfg.reward2.shift(), count:tempTaskCfg.reward2.shift(), quality:tempTaskCfg.reward2.shift()});
                }
            }
            
            tempTaskCfg.zs_reward = [];
            if (tempTaskCfg.reward_zs)
            {
                while (tempTaskCfg.reward_zs.length >= 3)
                {
                    tempTaskCfg.zs_reward.push({itemId:tempTaskCfg.reward_zs.shift(), count:tempTaskCfg.reward_zs.shift(), quality:tempTaskCfg.reward_zs.shift()});
                }
            }
            tempTaskCfg.fs_reward = [];
            if (tempTaskCfg.reward_fs)
            {
                while (tempTaskCfg.reward_fs.length >= 3)
                {
                    tempTaskCfg.fs_reward.push({itemId:tempTaskCfg.reward_fs.shift(), count:tempTaskCfg.reward_fs.shift(), quality:tempTaskCfg.reward_fs.shift()});
                }
            }
            tempTaskCfg.ds_reward = [];
            if (tempTaskCfg.reward_ds)
            {
                while (tempTaskCfg.reward_fs.length >= 3)
                {
                    tempTaskCfg.ds_reward.push({itemId:tempTaskCfg.reward_fs.shift(), count:tempTaskCfg.reward_fs.shift(), quality:tempTaskCfg.reward_fs.shift()});
                }
            }

            this._tableMap[tempTaskCfg.id] = tempTaskCfg;
        }
    }

    //--------------------------------------------------------------------------------------
    public get firstTaskCfg():NewTaskCFG
    {
        return this._table[0];
    }

    public getTaskCfgById(taskId:number):NewTaskCFG
    {
        return this._tableMap[taskId];
    }

    public getZsNext(taskId:number):NewTaskCFG
    {
        let tempTaskCfg = this.getTaskCfgById(taskId);
        return tempTaskCfg._zsNext;
    }

    public getFsNext(taskId:number):NewTaskCFG
    {
        let tempTaskCfg = this.getTaskCfgById(taskId);
        return tempTaskCfg._fsNext;
    }

    public getDsNext(taskId:number):NewTaskCFG
    {
        let tempTaskCfg = this.getTaskCfgById(taskId);
        return tempTaskCfg._dsNext;
    }

    public getNextByProfession(profession:EProfessionType, taskId:number):NewTaskCFG
    {
        let tempTaskCfg = this.getTaskCfgById(taskId);
        if (profession === EProfessionType.ZHANSHI)
        {
            return tempTaskCfg._zsNext;
        }
        else if (profession === EProfessionType.FASHI)
        {
            return tempTaskCfg._fsNext;
        }
        return tempTaskCfg._dsNext;
    }
}
