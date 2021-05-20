import SkillBuffConfig from "../../config/SkillBuffConfig";
import { SkillConfig } from "../../config/SkillConfig";
import { ESkillId } from "../../consts/ERole";
import BaseRoleAttr from "../attachAttr/BaseRoleAttr";
import Player from "../playerObj/Player";

/**技能 */
export default class Skill {
    /**技能ID */
    baseId: number;
    /**技能等级 */
    level: number;
    /**激活状态 */
    state: number;
    /**当前经验值 */
    curexp: number;
    /**是否自动释放 */
    isauto: boolean;
    /**是否普攻 */
    pugong: boolean;

    /**附加等级 */
    private addLv: number;
    readonly buffAttr: BaseRoleAttr;
    /**角色信息 */
    private player: Player;
    constructor(player: Player, sId: number, pugong: boolean = false) {
        this.player = player;
        this.baseId = 0;
        this.level = 1;
        this.state = 0;
        this.curexp = 0;
        this.isauto = true;
        this.pugong = false;

        this.addLv = 0;
        this.baseId = sId;
        this.pugong = pugong;
        this.buffAttr = new BaseRoleAttr(player.profession);
    }

    private get id() {
        return (this.baseId % 1000) == 999 ? this.baseId : parseInt(this.baseId.toString() + this.level);
    }

    /**技能 */
    public get sConfig() {
        return SkillConfig.instance.getSkillCfgById(Number(this.baseId + "" + this.level));
    }

    public get sNextConfig() {
        return SkillConfig.instance.getSkillCfgById(this.id + 1);
    }

    /**装备叠加等级 */
    private _equipAddLv: number;
    private get equipAddLv() {
        if (this._equipAddLv)
            return this._equipAddLv;
        return 0;
    }
    /**装备叠加等级 */
    resetAddLv() {
        this._equipAddLv = 0;
    }
    /**装备叠加等级 */
    addLvByEquip() {
        this._equipAddLv++;
    }

    /**是否能够升级 */
    public isCanUp(owner: Player): boolean {
        let tempNextSo = this.sConfig;
        if (tempNextSo && tempNextSo.exp) {
            if (this.curexp >= tempNextSo.exp) {
                // 升级
                let meetBook = tempNextSo.booknum ? owner.bag.getCountByItemId(tempNextSo.booknum[0]) >= tempNextSo.booknum[1] : false;
                let meetPage = tempNextSo.pagenum ? owner.bag.getCountByItemId(tempNextSo.pagenum[0]) >= tempNextSo.pagenum[1] : false;

                return meetBook && meetPage;
            }
        }
        return false;
    }

    /**设置数据 */
    setData(data: any) {
        if (data) {
            this.level = data.level;
            this.state = data.state;
            this.isauto = data.isauto;
            this.baseId = data.baseId;
            this.pugong = data.pugong;
            this.curexp = data.curexp;
            this.updateAttr();
        }
    }

    /**附加等级 */
    setAddLv(lv: number) {
        this.addLv = lv;
        this.updateAttr();
    }

    /**增加经验值 */
    addExp(exp: number) {
        this.curexp += exp;
        if (this.curexp > this.sConfig.exp) {
            this.curexp = this.sConfig.exp;
        }
    }

    /**升级 */
    upgrade() {
        this.level++;
        this.curexp = 0;
        this.updateAttr();
    }

    /**设置自动 */
    setAuto(isAuto: boolean) {
        this.isauto = isAuto;
    }

    /**附加等级 */
    get affixLv() {
        let _addLv = this.addLv + this.equipAddLv;
        if (!_addLv) _addLv = 0;
        if (_addLv > 10) _addLv = 10;
        if (this.baseId == ESkillId.skill_1001 || this.baseId == ESkillId.skill_2001 || this.baseId == ESkillId.skill_3001) {
            if (_addLv > 5) _addLv = 5;
        }
        return _addLv;
    }

    /**技能叠加后的加成 */
    getSkillCfgsByLv() {
        if (!this.pugong && this.state) {
            let skillId = parseInt(this.baseId.toString() + (this.level + this.affixLv));
            let skillCfgs = SkillConfig.instance.getSkillCfgById(skillId);
            if (skillCfgs)
                return skillCfgs;
        }
        return this.sConfig;
    }

    /**刷新属性 */
    updateAttr() {
        let _iConfigs = this.getSkillCfgsByLv();
        if (!_iConfigs) return;
        this.buffAttr.reset();
        if (this.state != 1) return;
        let abilityIds = _iConfigs.abilityIds;
        if (!abilityIds) return;
        for (let ability of abilityIds) {
            let buffCfgs = SkillBuffConfig.instance.getBuffCfgById(ability);
            if (buffCfgs && !buffCfgs.duration) {
                /**吸血 */
                if (buffCfgs.addhp > 0) this.buffAttr.absorbhp += buffCfgs.addhp;
                /**吸蓝 */
                if (buffCfgs.addmp > 0) this.buffAttr.absorbmp += buffCfgs.addmp;
                /**攻击力 */
                if (buffCfgs.zs > 0) {
                    this.buffAttr.minzs += buffCfgs.zs;
                    this.buffAttr.maxzs += buffCfgs.zs;
                }
                /**魔法值 */
                if (buffCfgs.fs > 0) {
                    this.buffAttr.minfs += buffCfgs.fs;
                    this.buffAttr.maxfs += buffCfgs.fs;
                }
                /**道术 */
                if (buffCfgs.ds > 0) {
                    this.buffAttr.minds += buffCfgs.ds;
                    this.buffAttr.maxds += buffCfgs.ds;
                }
                /**防御 */
                if (buffCfgs.ac > 0) {
                    this.buffAttr.minac += buffCfgs.ac;
                    this.buffAttr.maxac += buffCfgs.ac;
                }
            }
        }
    }

    /**数据转换 */
    toObj() {
        return {
            baseId: this.baseId,
            level: this.level,
            curexp: this.curexp,
            state: this.state,
            isauto: this.isauto,
            pugong: this.pugong,
            equiplv: this.equipAddLv
        }
    }
}