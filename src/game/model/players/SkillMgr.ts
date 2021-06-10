import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import CompositeRoleAttr from "../attachAttr/CompositeRoleAttr";
import Player from "../playerObj/Player";
import Skill from "./Skill";

export default class SkillMgr {
    owner: Player;
    skills: Skill[];
    _combat: number;

    /**技能属性 */
    public readonly totalAttr: CompositeRoleAttr;

    constructor(owner: Player) {
        this.owner = owner;
        this.skills = [];
        this._combat = 0;
        this.totalAttr = new CompositeRoleAttr();
        this.totalAttr.attachName = "技能";
        this.totalAttr.clearChildAttr();
    }

    private get professionCfg() {
        return this.owner.professionCfg;
    }

    /**可用技能列表 */
    public get learnSkillIdList(): number[] {
        let learnIdList: number[] = [];
        for (let skill of this.skills) {
            if (skill.pugong) {
                learnIdList.push(skill.baseId);
            } else {
                if (skill.state && skill.isauto) {
                    let skillId = parseInt(skill.baseId.toString() + (skill.level + skill.affixLv));
                    learnIdList.push(skillId);
                }
            }
        }
        return learnIdList;
    }

    /**技能叠加 */
    _skillAddLv: number = 0;
    get skillAddLv() {
        return this._skillAddLv;
    }
    set skillAddLv(AllLen: number) {
        this._skillAddLv = AllLen;
    }

    /**装备对技能的加成 */
    checkSkillLv() {
        let len = 0;
        let partEquip = this.owner.rolePart.partEquip;
        let table = this.owner.rolePart.requirePart(partEquip);
        let addLvPool = [];
        for (let equip of table) {
            if (equip) {
                len += equip.getAllSkillCnt;
                if (equip.special != 0) {
                    addLvPool.push(equip.special);
                }
            }
        }
        this.skillAddLv = len;
        if (addLvPool.length > 0)
            this.checkAddSkillLv(addLvPool);
        /**全技能加成 */
        for (let skill of this.skills) {
            skill.setAddLv(len);
            this.owner.send(CmdID.s2c_skill_change, { skill: skill.toObj() });
        }
        // this.owner.emit(PlayerEvent.HERO_SKILL_CHANGE);
    }

    /**检查具体的技能等级 */
    private checkAddSkillLv(addLvPool: number[]) {
        for (let skill of this.skills) {
            skill.resetAddLv();
        }
        /**附加 */
        addLvPool.forEach(code => {
            let skill = this.getSkillvoById(code);
            if (skill) {
                skill.addLvByEquip();
            }
        });
    }

    /**技能战力 */
    public skillCombat() {
        let combat = 0;
        for (let skill of this.skills) {
            if (skill.sConfig && skill.sConfig.vcombat && skill.state != 0)
                combat += skill.sConfig.vcombat;
        }
        this._combat = combat;
    }

    public getSkillByLevel() {
        let len = 0;
        for (let skill of this.skills) {
            if (skill.state != 0 && !skill.pugong) len++;
        }
        return len;
    }

    /**玩家技能初始化 */
    initSkill() {
        this.totalAttr.setProfession(this.owner.profession);

        let pugongId = this.professionCfg.skill;
        let slist = new Skill(this.owner, pugongId, true);
        this.skills.push(slist);

        let skillcfgs = this.professionCfg.skillid;
        for (let sId of skillcfgs) {
            let slist = new Skill(this.owner, sId);
            this.skills.push(slist);
        }
        this.setAttr();
    }

    /**实例化技能 */
    setSkill(data: string) {
        if (data) {
            let __skill = JSON.parse(data);
            for (let sdata of __skill) {
                let skillvo = this.getSkillvoById(sdata.baseId);
                if (skillvo) {
                    skillvo.setData(sdata);
                    skillvo.setAddLv(this.skillAddLv);
                }
            }
            this.setAttr();
            this.skillCombat();
        }
    }

    /**设置技能属性 */
    setAttr() {
        this.totalAttr.clearChildAttr();
        for (let skill of this.skills) {
            this.totalAttr.addChildAttr(skill.buffAttr);
        }
    }

    /**技能数据 */
    getSkillvoById(baseid: number) {
        for (let skill of this.skills) {
            if (skill.baseId == baseid) return skill;
        }
        return null;
    }

    /**基础的 */
    onAuto(baseId: number, isauto: boolean) {
        for (let skill of this.skills) {
            if (skill.baseId == baseId) {
                skill.setAuto(isauto);
                this.owner.emit(PlayerEvent.HERO_SKILL_CHANGE);
                break;
            }
        }
    }

    /**技能升级 */
    onUpgrade(id: number) {
        for (let skill of this.skills) {
            if (skill.baseId == id) {
                if (skill.isCanUp(this.owner)) {
                    let tempNextSo = skill.sConfig;
                    this.owner.bag.deleteBagItem(tempNextSo.booknum[0], tempNextSo.booknum[1]);
                    this.owner.bag.deleteBagItem(tempNextSo.pagenum[0], tempNextSo.pagenum[1]);
                    skill.upgrade();
                    this.skillCombat();
                    this.owner.send(CmdID.s2c_skill_change, { skill: skill.toObj() });
                } else {
                    this.owner.send(CmdID.s2c_notice, {
                        code: ErrorConst.MATERIAL_NOT_ENOUGH
                    });
                    Logger.debug("不能升级");
                }
                break;
            }
        }
        this.owner.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
        this.owner.emit(PlayerEvent.HERO_SKILL_CHANGE);
    }

    /**激活技能 */
    onActive(id: number) {
        for (let skill of this.skills) {
            if (skill.baseId == id) {
                skill.state = 1;
                skill.updateAttr();
                this.skillCombat();
                this.owner.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
                this.owner.emit(PlayerEvent.HERO_SKILL_CHANGE);
                break;
            }
        }
    }

    /**增加技能 */
    addExpBySkillId(id: number, exp: number) {
        let skill = this.getSkillvoById(id);
        if (skill) {
            let tmpExp = skill.curexp;

            skill.addExp(exp);

            if (tmpExp !== skill.curexp) {
                this.owner.send(CmdID.s2c_skill_change, { skill: skill.toObj() });
            }
        }
    }

    /**转换需要的数据 */
    toObj() {
        let skilldata = [];
        for (let obj of this.skills) {
            skilldata.push(obj.toObj());
        }
        return skilldata;
    }

    toDB() {
        let skilldata = [];
        for (let obj of this.skills) {
            skilldata.push(obj.toObj());
        }
        return DataUtil.toJson(skilldata, "{}");
    }
}