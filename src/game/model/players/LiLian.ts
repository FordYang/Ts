import { ILiLianCFG } from "../../config/cfg/LiLianCFG";
import { LilianConfig } from "../../config/LilianConfig";
import { TaskConfig } from "../../config/TaskConfig";
import { ERichesType } from "../../consts/EGame";
import { EItemKey } from "../../consts/EItem";
import { EEQuipPart } from "../../consts/ERole";
import { ErrorConst } from "../../consts/ErrorConst";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";
export enum eTaskType {
    /**等级 */
    level = 1,
    /**击杀怪物 */
    monster = 2,
    /**获得物品 */
    getItem = 3,
    /**获取品质装备 */
    getQualityEquip = 4,
    /**战力 */
    combat = 5,
    /**金币 */
    coin = 6,
    /**强化 */
    intensify = 7,
    /**技能 */
    skill = 8,
    /**幸运 */
    lucky = 9,
    /**历练章节 */
    lilian = 10,
    /**洗练 */
    remake = 11
}
export default class LiLian {
    owner: Player
    constructor(owner: Player) {
        this.owner = owner;
    }
    private get equipRecord() {
        return this.owner.bag.equipRecord;
    }
    private get intensifyData() {
        return this.owner.rolePart.intensifyData;
    }
    private get skillMgr() {
        return this.owner.skillMgr;
    }
    /**领取历练奖励 */
    public onReceiveLiLian(lilianId: number, taskId: number) {
        let progress: number = 0;
        let total: number = 0;
        let taskCfg = TaskConfig.instance.getTaskCfgById(taskId);
        let lilianCfg = LilianConfig.instance.getLilianCfgById(lilianId);

        switch (taskCfg.type) {
            case eTaskType.level:/**第一参数 */
                progress = this.owner.level;
                total = taskCfg.parameter1;
                break;
            case eTaskType.monster:/**第二参数 */
                progress = this.owner.killMonsterEntity.getTotalKillMonster(taskCfg.parameter1);
                total = taskCfg.parameter2;
                break;
            case eTaskType.getItem:/**第二参数 */
                break;
            case eTaskType.getQualityEquip:/**第二参数 */
                progress = this.equipRecord[taskCfg.parameter1];
                total = taskCfg.parameter2;
                break;
            case eTaskType.combat:/**第一参数 */
                progress = this.owner.getCombat();
                total = taskCfg.parameter1;
                break;
            case eTaskType.coin:/**第一参数 */
                // progress = roleVo.task.all_coin;
                total = taskCfg.parameter1;
                break;
            case eTaskType.intensify:/**第一参数 */
                progress = this.getAllIntensifyLv();
                total = taskCfg.parameter1;
                break;
            case eTaskType.skill:/**第一参数 */
                progress = this.skillMgr.getSkillByLevel();
                total = taskCfg.parameter1;
                break;
            case eTaskType.lilian:/**第一参数 */
                progress = this.getCompleteByStage(taskCfg.parameter1);
                total = this.getTaskByStage(lilianCfg);
                break;
            case eTaskType.remake:/**第一参数 */
                progress = this.owner.xilian;
                total = taskCfg.parameter1;
                // this.lab_schedule.string = "进度：" + 0 + "/" + taskCfg.parameter1;
                break;
        }
        if (progress >= total) {
            if (this.owner.taskReceived.indexOf(taskId) != -1) {
                /**已经领取成功 */
                this.owner.send(CmdID.s2c_notice, {
                    code: ErrorConst.MATERIAL_NOT_ENOUGH
                })
            } else {
                /**成功 */
                let count = taskCfg.reward[1];
                let itemId = taskCfg.reward[0];
                if (itemId == EItemKey.itemid_103035) {
                    this.owner.addMoney(ERichesType.Money, count, "历练奖励");
                } else if (itemId == EItemKey.itemid_103037) {
                    this.owner.addMoney(ERichesType.Yuanbao, count, "历练奖励");
                } else {
                    this.owner.addItem(itemId, count, "历练奖励", false, null, true);
                }
                this.owner.taskReceived.push(taskId);
                this.owner.send(CmdID.s2c_lilian_received, {
                    taskReceived: this.owner.taskReceived
                });
            }
        } else {
            this.owner.send(CmdID.s2c_notice, {
                code: ErrorConst.MATERIAL_NOT_ENOUGH
            });
        }
    }

    /** 全身强化最低等级 */
    private getAllIntensifyLv(): number {
        let intensifys = [];
        let _intensify = this.intensifyData;
        for (let part in EEQuipPart) {
            let value = DataUtil.numberBy(part);
            if (isNaN(value)) {
                continue;
            }
            if (value > 0)
                intensifys.push(_intensify[value]);
        }
        let minLv = Math.min.apply(null, intensifys);
        return minLv;
    }

    /**完成数量 */
    private getCompleteByStage(stage: number): number {
        let tasks = [];
        let tasklist = this.owner.taskReceived;
        for (let list of tasklist) {
            if (Math.floor(list / 1000) == stage) tasks.push(list);
        }
        return tasks.length;
    }

    /**获取总共多少个任务 */
    private getTaskByStage(lilianCfg: ILiLianCFG): number {
        // let taskCfgs: ILiLianCFG = LilianConfig.instance.getCfgById(liliancfg);// ConfigTool.instance.getCfgById(eResKey.lilian, this._lilinaId);
        if (lilianCfg && lilianCfg.task) {
            return lilianCfg.task.length - 1;
        }
        /**最后一个任务要去掉 */
        return 0;
    }
}