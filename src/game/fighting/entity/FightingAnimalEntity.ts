import { SkillConfig } from '../../config/SkillConfig';
import SkillCFG from "../../config/cfg/SkillCFG";
import FightingRoom from "../FightingRoom";
import FightingSkillVO from "../vo/FightingSkillVO";
import SkillBuffConfig from '../../config/SkillBuffConfig';
import { EAttrType, ESkillId } from '../../consts/ERole';
import { ErrorConst } from '../../consts/ErrorConst';
import { EFightingHurtType } from '../../consts/EFightingHurtType';
import FightingAnimalAttr from '../vo/FightingAnimalAttr';
import FightingSkillEntity from './FightingSkillEntity';
import FightingSkillBuffVO from '../vo/FightingSkillBuffVO';
import FightingBuffEntity from './FightingBuffEntity';
import CmdID from '../../network/CmdID';
import EFightingPassType from '../../consts/EFightingPassType';
import CyObject from '../../core/CyObject';
import Logger from '../../gear/Logger';
import { ESkillTarget } from '../../consts/ESkillTarget';
import ArrayUtil from '../../gear/ArrayUtil';
import { ESkillRange } from '../../consts/ESkillRange';
import { EFightingSkillStateConst } from '../../consts/EFightingSkillStateConst';
import e from 'express';

export default class FightingAnimalEntity extends CyObject
{
    public eid:number;
    /** 战斗属性 */
    protected _animAttr:FightingAnimalAttr;

    /** 主人实体 */
    public ownerEntity:FightingAnimalEntity;
    public readonly petlist:FightingAnimalEntity[];

    protected fightingRoom:FightingRoom;
    
    protected _isLive:boolean = true;

    // /** 可使用技能列表 */
    protected skillEntity:FightingSkillEntity;

    /** 上次攻击时间 */
    private prevAckTime:number = 0;

    /** 0:野怪  非0队伍ID */
    public teamId:number = 0;

    /** 附加Buff */
    // protected readonly buffVoList:FightingSkillBuffVO[];
    // protected readonly buffAttr:FightingSkillBuffAttr;
    protected readonly buffEntity:FightingBuffEntity;

    /** 触发攻杀 */
    private _triggerPassSkillCFG:SkillCFG;

    public sx:number;
    public sy:number;
    
    public hurtFactor:number = 1;

    constructor()
    {
        super();

        this.moveSt = Date.now();

        this.buffEntity = new FightingBuffEntity();

        this.petlist = [];

        this.skillEntity = new FightingSkillEntity(this);
    }

    //---------------------------------------------------------------------------------------------------
    public setXY(x:number, y:number):void
    {
        this.sx = x;
        this.sy = y;
    }
    //--------------------------------
    /** 锁定目标 */
    protected lockEntity:FightingAnimalEntity;
    protected walkDuration:number = 2000;

    /** 行走路径 */
    protected movePath:number[] = [];

    private moveSt:number = 0;
    private checkMove():void
    {
        if (this.lockEntity)
        {
            if (this.movePath.length === 0)
            {
                this.fightingRoom.findPath(this, this.lockEntity, this.movePath);

                if (this.movePath.length === 0)
                {
                    this.lockEntity = null;
                    return;
                }
            }

            if (Date.now() - this.moveSt >= this.walkDuration)
            {
                if (this.movePath && this.movePath.length >= 2)
                {
                    let tmpX:number = this.movePath[0];
                    let tmpY:number = this.movePath[1];
                    let isMove = this.fightingRoom.animalMove(this, tmpX, tmpY);
                    if (isMove)
                    {
                        this.movePath.splice(0, 2);
                        this.moveSt = Date.now();
                    }
                    else
                    {
                        this.movePath.length = 0;
                    }
                }
            }
        }
    }

    protected checkAttack():void
    {
        if (this.lockEntity && this.lockEntity.isLive)
        {
            // 有锁定
            if (this.isAttack && this.buffEntity.state === EFightingSkillStateConst.NONE)
            {
                let lockEntity = this.lockEntity;

                // 有目标，攻击
                let skillcfg = this.triggerPassSkillCFG;
                skillcfg = skillcfg || this.getCanSkillCfg(lockEntity);//?.skillCfg;

                if (skillcfg) 
                {
                    let tmpDiff = Math.max(Math.abs(this.sx - lockEntity.sx), Math.abs(this.sy - lockEntity.sy));
                    if (skillcfg.distance && tmpDiff > skillcfg.distance)
                    {
                        // 向目标出发
                        this.checkMove();
                    }
                    else
                    {
                        this.prevAckTime = Date.now();

                        this.moveSt = Date.now();
                        // 释放技能
                        if (skillcfg.targetside === ESkillTarget.ENEMY || skillcfg.targetside === ESkillTarget.FRIENDLY)
                        {
                            let hitEidList:number[] = [];
                            this.fightingRoom.getSkillHitList(this, skillcfg, this.lockEntity, hitEidList);

                            this.fightingRoom.attack(this.eid, skillcfg.id, [], hitEidList);
                        }
                        else if (skillcfg.targetside === ESkillTarget.SELF)
                        {
                            this.fightingRoom.attack(this.eid, skillcfg.id, [], [this.eid]);
                        }
                        else
                        {
                            this.fightingRoom.attack(this.eid, skillcfg.id, [], [this.eid]);
                        }
                    }
                }
            }
        }
        else
        {
            // 寻找目标
            let tempEntity = this.fightingRoom.findHitTarget(this);
            // 向目标出发
            if (tempEntity && tempEntity.isLive)
            {
                this.lockEntity = tempEntity;
                this.movePath.length = 0;
            }
        }
    }

    public checkLockEntityCreate(animal:FightingAnimalEntity):void
    {
        if (animal.teamId !== this.teamId)
        {
            if (this.lockEntity && this.lockEntity.hp === this.lockEntity.maxHp)
            {
                let dist1 = Math.abs(this.sx - this.lockEntity.sx) + Math.abs(this.sy - this.lockEntity.sy);
                let dist2 = Math.abs(animal.sx - this.sx) + Math.abs(animal.sy - this.sy);
                if (dist2 < dist1)
                {
                    this.lockEntity = null;
                }
            }
        }
    }

    public checkLockEntityDie():void
    {
        this.movePath.length = 0;
    }

    public checkLockEntityMove(animal:FightingAnimalEntity):void
    {
        if (this.lockEntity && this.lockEntity === animal)
        {
            this.movePath.length = 0;
        }
    }

    //---------------------------------------------------------------------------------------------------

    public init(fightingRoom:FightingRoom):void
    {
        this.fightingRoom = fightingRoom;

        this.hurtFactor = fightingRoom.isPK ? 10 : 1;

        this.buffEntity.setOwner(this);
    }

    public setOwner(ownerEntity:FightingAnimalEntity):void
    {
        this.ownerEntity = ownerEntity;
    }

    //---------------------------------------------------------------------------------------------------
    public recyclePool():void
    {
        this.petlist.length = 0;
        this.buffEntity.recyclePool();
    }

    public setAttr(attr:FightingAnimalAttr):void
    {
        this._animAttr = attr;

        this.teamId = attr.teamId;

        this.setSkillIdList(attr.skillIdList);

        this.buffEntity.reset();
    }

    public setSkillIdList(idList:number[]):void
    {
        let skillIdList:number[] = [];
        for (let skillId of idList)
        {
            if (SkillConfig.instance.getSkillCfgById(skillId))
            {
                skillIdList.push(skillId);
            }
            else
            {
                Logger.log("表中没有技能ID：", skillId);
            }
        }

        this.skillEntity.setSkillIdList(skillIdList);
    }

    public addChildEntity(childEntity:FightingAnimalEntity):void
    {
        childEntity.teamId = this.teamId;
        this.petlist.push(childEntity);
    }

    public get childCount():number
    {
        return this.petlist.length;
    }

    public childDie(childEntity:FightingAnimalEntity):void
    {
        ArrayUtil.fastRemove(this.petlist, childEntity);
        // console.log(`宠物死亡:${this.childCount}`);
    }

    /** 重置技能CD */
    public resumeSkillCD(skillId:number):void
    {
        let skillVo = this.getLearnSkill(skillId);
        if (skillVo)
        {
            skillVo.pauseCD = false;
            skillVo.use();
        }
    }


    //---------------------------------------------------------------------------------------------------

    public get buffIdList()
    {
        return this.buffEntity.buffIdList;
    }

    /** 判断是否可攻击（攻速 */
    public get isAttack():boolean
    {
        let atkSpeed = Math.max(500, this._animAttr.atkSpeed - this.buffEntity.atkSpeek);
        let tempT = Date.now() - this.prevAckTime;
        return tempT >= atkSpeed;
    }

    public get animalAttr():FightingAnimalAttr
    {
        return this._animAttr;
    }

    public get hp():number
    {
        return this._animAttr.hp;
    }
    protected addHp(val:number):void
    {
        if (!this.invincible || val > 0)
        {
            if (val)
            {
                let tmpHp = this.hp + val;
                tmpHp = Math.floor(tmpHp);
                tmpHp = Math.max(0, tmpHp);
                tmpHp = Math.min(tmpHp, this._animAttr.maxhp);
                
                this._animAttr.hp = tmpHp;
                // this.fightingRoom.sendChangeAttr(this.eid, EAttrType.BAT_HP, this.hp);
            }
        }
    }

    public get maxHp():number
    {
        return this._animAttr.maxhp;
    }
    public get mp():number
    {
        return this._animAttr.mp;
    }
    public set mp(val:number)
    {
        this.setMp(val);
    }
    protected setMp(val:number):void
    {
        val ||= 0;
        if (this.mp != val)
        {
            val = Math.floor(val);
            val = Math.max(0, val);
            val = Math.min(val, this._animAttr.maxmp);

            let prevMp:number = this._animAttr.mp;
            this._animAttr.mp = Math.min(this._animAttr.maxmp, val);
            if (prevMp !== this._animAttr.mp)
            {
                // console.log('同步蓝', this.eid, this.name, this.mp);
                this.fightingRoom.sendChangeAttr(this.eid, EAttrType.BAT_MP, this.mp);
            }
        }
    }
    public get maxMp():number
    {
        return this._animAttr.maxmp;
    }

    public get isLive():boolean
    {
        return this._isLive;
    }

    protected changeHp(eid:number, type:EFightingHurtType, changeHp:number, nowHp:number):void
    {
        if (this.invincible)
        {
            if (changeHp < 0)
            {
                this.fightingRoom.sendHpChange(eid, EFightingHurtType.INVINCIBLE, 0, nowHp);
            }
        }
        else
        {
            this.fightingRoom.sendHpChange(eid, type, changeHp, nowHp);
        }
    }

    public addBuffHp(hurtType:EFightingHurtType, changeHp:number):void
    {
        let tmpHp = changeHp < 0 ? changeHp / this.hurtFactor : changeHp;
        this.addHp(tmpHp);

        this.changeHp(this.eid, hurtType, tmpHp, this.hp);
    }

    public changeAttr(type:EAttrType, value:number):void
    {
        this.fightingRoom.sendChangeAttr(this.eid, type, value);
    }

    public sendRemoveBuff(buffEid:number):void
    {
        this.fightingRoom.sendRemoveBuff(this.eid, buffEid);
    }

    /** 是否存在BuffID */
    public checkExistBuffID(buffId:number):boolean
    {
        return this.buffEntity.checkExistBuff(buffId);
    }
    //---------------------------------------------------------------------------------------------------

    public get name():string
    {
        return this._animAttr.name;
    }

    /** 无敌 */
    public get invincible():boolean
    {
        return false;
    }

    public update(dt:number):void
    {
        this.buffEntity.update(dt);

        this.checkAttack();

        // 检查是否死亡
        this.checkDie();
    }

    private getLearnSkill(skillId:number):FightingSkillVO
    {
        return this.skillEntity.getLearnSkillVO(skillId);
    }

    public checkLearnBaseId(baseId:number):boolean
    {
        return !!this.skillEntity.getCfgByBaseId(baseId);
    }

    /** 检测触发被动 */
    public checkTriggerPassSkill():void
    {
        let isTriggerGongsha = this.skillEntity.triggerGongsha;//true;//

        if (isTriggerGongsha)
        {
            // 攻杀
            this.checkLearnBaseId(ESkillId.skill_1002) && (this._triggerPassSkillCFG = this.getLearnSkillId(ESkillId.skill_1002));
        }
    }

    public get triggerPassSkillCFG():SkillCFG
    {
        return this._triggerPassSkillCFG;
    }
    public resetTriggerPassSkillId():void
    {
        this._triggerPassSkillCFG = null;
    }

    public getLearnSkillId(baseId:number):SkillCFG
    {
        return this.skillEntity.getCfgByBaseId(baseId);
    }

    /**
     * 使用技能攻击
     * @param skillId 技能ID
     * @param hitCount 攻击数量
     * @returns 0:可以攻击  1:没有学习这个技能  2:蓝量不足  3:攻击数量太多
     */
    public useSkill(skillcfg:SkillCFG, hitCount:number):number
    {
        if (this.isLive)
        {
            if (this.ownerEntity && !this.ownerEntity.isLive)
            {
                this.fightingRoom.traceError(`攻击者主人已死亡不能释放技能 Atk:${this.eid}_${this.name} Owner:${this.ownerEntity.eid}_${this.ownerEntity.name}`);
                return ErrorConst.ROLE_DIE;
            }

            if (this.buffEntity.state == EFightingSkillStateConst.XUAN_YUN)
            {
                this.fightingRoom.traceError(`眩晕中不能释放技能 Eid:${this.eid} Name:${this.name} SkillID:${skillcfg.name}`);
                return ErrorConst.CIRCUMGYRATION;
            }
            else if (this.buffEntity.state == EFightingSkillStateConst.DING_SHEN)
            {
                this.fightingRoom.traceError(`定身中不能释放技能 Eid:${this.eid} Name:${this.name} SkillID:${skillcfg.name}`);
                return ErrorConst.IMMOBILIZING;
            }
            else
            {
                let skillVo = this.getLearnSkill(skillcfg.id);
                if (skillVo)
                {
                    if (skillVo.skillCfg.spell > this._animAttr.mp)
                    {
                        this.fightingRoom.traceError(`蓝不足 Skill:${skillcfg.name}  ${this.eid}_${this.name}_${this._animAttr.mp}`);
                        return ErrorConst.MP_NOT_ENOUGH;
                    }
                    if (hitCount > skillVo.skillCfg.maxnum)
                    {
                        this.fightingRoom.traceError(`攻击超过最大数 Skill:${skillcfg.name}:${skillcfg.name}   ${hitCount}/${skillVo.skillCfg.maxnum}`);
                        return ErrorConst.SKILL_ATK_MORE;
                    }
                    if (skillVo.cd)
                    {
                        this.fightingRoom.traceError(`CD冷却中 SkillID:${skillcfg.name}`);
                        return ErrorConst.IN_CD;
                    }
                    
                    this.mp -= skillVo.skillCfg.spell;
                    // this.addSkillBuff(null,[], this);
                    this.addSkillBuff(null, this.animalAttr.passBuffIdList, this);
                    skillVo.use();
        
                    return ErrorConst.SUCCEED;
                }
                this.fightingRoom.traceError(`技能未学习 Skill:${skillcfg.name} ${this.eid}_${this.name}`);
                return ErrorConst.FIGHTING_SKILL_NOT_LEARN;
            }
        }
        this.fightingRoom.traceError(`攻击者已死亡 Skill:${skillcfg.name} ${this.eid}_${this.name}`);
        return ErrorConst.DEAD;
    }

    /** 计算增益（回血，回魔） */
    public calcGain():void
    {
        if (this._animAttr.absorbhp)
        {
            this.addHp(this._animAttr.absorbhp);
            this.changeHp(this.eid, EFightingHurtType.XIXIE, this._animAttr.absorbhp, this.hp);
        }
        if (this._animAttr.absorbmp)
        {
            // console.log('回魔', this.eid, this.name, this.mp, this._animAttr.absorbmp);
            this.mp += this._animAttr.absorbmp;
        }
    }

    /** 施法给自己 */
    public hitSelf(atkEntity:FightingAnimalEntity, skillCfg:SkillCFG):void
    {
        if (this.isLive)
        {
            if (skillCfg.addhp)
            {
                let skillAddHp:number = this.maxHp * skillCfg.addhp * 0.01;
                skillAddHp = Math.max(1, skillAddHp / this.hurtFactor);
                this.addHp(skillAddHp);
                this.changeHp(this.eid, EFightingHurtType.HEAL, skillAddHp, this.hp);
            }

            this.addSkillBuff(skillCfg, skillCfg.abilityIds, atkEntity);
        }
        else
        {
            // 已死亡
            this.fightingRoom.traceError(`${atkEntity.name}:${atkEntity.eid}==>${this.name}:${this.eid}  ${this.eid}已死亡`);
        }
    }

    /** 施法给友军 */
    public hitFriendly(atkEntity:FightingAnimalEntity, skillCfg:SkillCFG):void
    {
        if (this.isLive)
        {
            if (skillCfg.addhp)
            {
                let skillAddHp:number = this.maxHp * skillCfg.addhp * 0.01;
                skillAddHp = Math.max(1, skillAddHp / this.hurtFactor);
                this.addHp(skillAddHp);
                this.changeHp(this.eid, EFightingHurtType.HEAL, skillAddHp, this.hp);
            }

            this.addSkillBuff(skillCfg, skillCfg.abilityIds, atkEntity);
        }
        else
        {
            // 已死亡
            this.fightingRoom.traceError(`${atkEntity.name}:${atkEntity.eid}==>${this.name}:${this.eid}  ${this.eid}已死亡`);
        }
    }
    
    public hitEntity(atkEntity:FightingAnimalEntity, skillCfg:SkillCFG, isTwoTrigger:boolean = false):number
    {
        if (this.isLive)
        {
            let evadeVal = atkEntity.hit - this.evade;
            if (evadeVal > Math.random() * 100)
            {
                let skillDamage = this.calcDamage(atkEntity, skillCfg);
                
                if (skillDamage)
                {
                    let effectFlag:EFightingHurtType = atkEntity.isLucky ? EFightingHurtType.LUCKY : (this.isCritical ? EFightingHurtType.BAO_JI : EFightingHurtType.NORMAL);
    
                    let buffEntity = this.buffEntity;
                    if (buffEntity.shiled > 0)
                    {
                        skillDamage = Math.ceil(skillDamage * 0.5);

                        buffEntity.shiled -= skillDamage;
                        if (buffEntity.shiled < 0)
                        {
                            skillDamage = skillDamage - buffEntity.shiled;

                            // this.hp += buffEntity.shiled;
                            buffEntity.shiled = 0;
                            // this.changeHp(this.eid, effectFlag, buffEntity.shiled, this.hp);
                            buffEntity.removeShiledBuff();
                        }
                    }

                    skillDamage = Math.max(1, Math.ceil(skillDamage / this.hurtFactor));
                    this.addHp(-skillDamage);

                    if (effectFlag === EFightingHurtType.NORMAL && atkEntity.ownerEntity)
                    {
                        effectFlag = EFightingHurtType.PET_ATK;
                    }
                    this.changeHp(this.eid, effectFlag, skillDamage, this.hp);
                }
    
                this.checkDie();
                
                if (this.isLive)
                {
                    this.addSkillBuff(skillCfg, skillCfg.abilityIds, atkEntity);

                    if (!isTwoTrigger)
                    {
                        let twoSkillCfg = atkEntity.skillEntity.triggerTwoSkill;
                        if (twoSkillCfg)
                        {
                            // 触发法术精通通知前端
                            this.fightingRoom.player.send(CmdID.s2c_fighting_trigger_pass, {uEid:atkEntity.eid, type:EFightingPassType.FA_SHU_JING_TONG, skillId:skillCfg.id, hitEid:this.eid});

                            this.hitEntity(atkEntity, twoSkillCfg, true);

                            this.fightingRoom?.player?.skillMgr?.addExpBySkillId(ESkillId.skill_2006, 1);
                        }
                    }

                    return skillDamage;
                }
            }
            else
            {
                // 闪避
                this.changeHp(this.eid, EFightingHurtType.SHAN_BI, 0, this.hp);
            }
        }
        else
        {
            // 已死亡
            this.fightingRoom.traceError(`${atkEntity.name}:${atkEntity.eid}==>${this.name}:${this.eid}  ${this.eid}已死亡`);
        }
        return 0;
    }

    /** 计算伤害值 */
    private calcDamage(atkEntity:FightingAnimalEntity, skillcfg:SkillCFG):number
    {
        let hitAttr = this._animAttr;
        let hitBuffAttr = this.buffEntity.buffAttr;

        let atkAttr = atkEntity._animAttr;
        let atkBuffAtt = atkEntity.buffEntity.buffAttr;

        // 基础攻击力
        // Buff增加的攻击力
        let atkBaseAtk = atkEntity.baseAtk;
        let tmpAtk = atkBaseAtk + (atkBaseAtk * atkBuffAtt.atkPercent);
        tmpAtk += atkBuffAtt.atk;

        let baseDef = this.baseDef;
        // Buff增加的攻击力
        let tmpDef = baseDef + (baseDef * hitBuffAttr.ac2);
        tmpDef += hitBuffAttr.ac;

        let damage = Math.max(1, (Math.max(0, tmpAtk - tmpDef * (1 - (skillcfg.bac ?? 0) * 0.01)) + Math.max(0, atkAttr.fixeddamage - hitAttr.fixedac)));
        damage = damage * (1 + (atkAttr.adddamage + atkBuffAtt.injuryincrease - hitAttr.addac - hitBuffAttr.injuryFree) * 0.01 + Math.max(0, (atkAttr.lucky - 20) * 0.05));
        damage = damage * (skillcfg.power2 ? skillcfg.power2 * 0.01 : 1) + (skillcfg.power ?? 0);

        this.isCritical = false;
        if (atkAttr.critical - hitAttr.tenacity > Math.random() * 100)
        {
            this.isCritical = true;
            damage *= (1.5 + atkAttr.crtdamage * 0.01);
        }
        damage = Math.max(1, damage);

        return damage;
    }

    private isCritical:boolean = false;

    /** 战士 */
    private calcZsDamage(atkEntity:FightingAnimalEntity, hpPercent:number, hpFixed:number):number
    {
        let hitAttr = this._animAttr;
        let hitBuffAttr = this.buffEntity.buffAttr;

        let atkAttr = atkEntity._animAttr;
        let atkBuffAtt = atkEntity.buffEntity.buffAttr;

        // 基础攻击力
        // Buff增加的攻击力
        let atkBaseAtk = atkEntity.baseZs;
        let tmpAtk = atkBaseAtk + (atkBaseAtk * atkBuffAtt.atkPercent);
        tmpAtk += atkBuffAtt.atk;

        let baseDef = this.baseDef;
        // Buff增加的攻击力
        let tmpDef = baseDef + (baseDef * hitBuffAttr.ac2);
        tmpDef += hitBuffAttr.ac;

        let damage = Math.max(1, (Math.max(0, tmpAtk - tmpDef) + Math.max(0, atkAttr.fixeddamage - hitAttr.fixedac)));
        damage = damage * (1 + (atkAttr.adddamage + atkBuffAtt.injuryincrease - hitAttr.addac - hitBuffAttr.injuryFree) * 0.01 + Math.max(0, (atkAttr.lucky - 20) * 0.05));
        damage = damage * (hpPercent ? hpPercent * 0.01 : 1) + (hpFixed ?? 0);

        if (atkAttr.critical - hitAttr.tenacity > Math.random() * 100)
        {
            damage *= (1.5 + atkAttr.crtdamage * 0.01);
        }
        damage = damage * Math.max(0, 1 - hitBuffAttr.injuryFree * 0.01);
        damage = Math.max(1, damage);

        return damage;
    }

    private calcFsDamage(atkEntity:FightingAnimalEntity, hpPercent:number, hpFixed:number):number
    {
        let hitAttr = this._animAttr;
        let hitBuffAttr = this.buffEntity.buffAttr;

        let atkAttr = atkEntity._animAttr;
        let atkBuffAtt = atkEntity.buffEntity.buffAttr;

        // 基础攻击力
        // Buff增加的攻击力
        let atkBaseAtk = atkEntity.baseFs;
        let tmpAtk = atkBaseAtk + (atkBaseAtk * atkBuffAtt.fs2);
        tmpAtk += atkBuffAtt.fs;

        let baseDef = this.baseDef;
        // Buff增加的攻击力
        let tmpDef = baseDef + (baseDef * hitBuffAttr.ac2);
        tmpDef += hitBuffAttr.ac;

        let damage = Math.max(1, (Math.max(0, tmpAtk - tmpDef) + Math.max(0, atkAttr.fixeddamage - hitAttr.fixedac)));
        damage = damage * (1 + (atkAttr.adddamage + atkBuffAtt.injuryincrease - hitAttr.addac - hitBuffAttr.injuryFree) * 0.01 + Math.max(0, (atkAttr.lucky - 20) * 0.05));
        damage = damage * (hpPercent ? hpPercent * 0.01 : 1) + (hpFixed ?? 0);

        if (atkAttr.critical - hitAttr.tenacity > Math.random() * 100)
        {
            damage *= (1.5 + atkAttr.crtdamage * 0.01);
        }
        damage = damage * Math.max(0, 1 - hitBuffAttr.injuryFree * 0.01);
        damage = Math.max(1, damage);

        return damage;
    }
    private calcDsDamage(atkEntity:FightingAnimalEntity, hpPercent:number, hpFixed:number):number
    {
        let hitAttr = this._animAttr;
        let hitBuffAttr = this.buffEntity.buffAttr;

        let atkAttr = atkEntity._animAttr;
        let atkBuffAtt = atkEntity.buffEntity.buffAttr;

        // 基础攻击力
        // Buff增加的攻击力
        let atkBaseAtk = atkEntity.baseDs;
        let tmpAtk = atkBaseAtk + (atkBaseAtk * atkBuffAtt.ds2);
        tmpAtk += atkBuffAtt.ds;

        let baseDef = this.baseDef;
        // Buff增加的攻击力
        let tmpDef = baseDef + (baseDef * hitBuffAttr.ac2);
        tmpDef += hitBuffAttr.ac;

        let damage = Math.max(1, (Math.max(0, tmpAtk - tmpDef) + Math.max(0, atkAttr.fixeddamage - hitAttr.fixedac)));
        damage = damage * (1 + (atkAttr.adddamage + atkBuffAtt.injuryincrease - hitAttr.addac - hitBuffAttr.injuryFree) * 0.01 + Math.max(0, (atkAttr.lucky - 20) * 0.05));
        damage = damage * (hpPercent ? hpPercent * 0.01 : 1) + (hpFixed ?? 0);

        if (atkAttr.critical - hitAttr.tenacity > Math.random() * 100)
        {
            damage *= (1.5 + atkAttr.crtdamage * 0.01);
        }
        damage = damage * Math.max(0, 1 - hitBuffAttr.injuryFree * 0.01);
        damage = Math.max(1, damage);

        return damage;
    }

    //--------------------------------------------------------------------------------------------------------

    /** 增加Buff */
    private addSkillBuff(skillcfg:SkillCFG, buffIdList:number[], atkEntity:FightingAnimalEntity):void
    {
        let buffIds = buffIdList;
        if (buffIds)
        {
            let isAdd:boolean = false;

            for (let buffId of buffIds)
            {
                let buffCfg = SkillBuffConfig.instance.getBuffCfgById(buffId);
                let probebility = buffCfg.probability ?? 100;
                if (probebility > Math.random() * 100)
                {
                    if (buffCfg.isoverlay || !this.buffEntity.checkExistBuff(buffId))
                    {
                        let tmpShiled = 0;
                        let tmpAc = 0;
                        let tmpHp = 0;
                        if (buffCfg.special)
                        {
                            if (buffCfg.special[0] === 1)
                            {
                                if (buffCfg.hp > 0)
                                {
                                    tmpHp = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxzs + atkEntity._animAttr.minzs) * 0.5 + buffCfg.hp;
                                }
                                else if (buffCfg.hp < 0)
                                {
                                    tmpHp = -this.calcZsDamage(atkEntity, buffCfg.special[1], buffCfg.hp);
                                }
                                else if (buffCfg.ac)
                                {
                                    tmpAc = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxzs + atkEntity._animAttr.minzs) * 0.5 +　buffCfg.ac;
                                }
                                else if (buffCfg.shiled)
                                {
                                    tmpShiled = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxzs + atkEntity._animAttr.minzs) * 0.5 + buffCfg.shiled;
                                }
                            }
                            else if (buffCfg.special[0] === 2)
                            {
                                if (buffCfg.hp > 0)
                                {
                                    tmpHp = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxfs + atkEntity._animAttr.minfs) * 0.5 + buffCfg.hp;
                                }
                                else if (buffCfg.hp < 0)
                                {
                                    tmpHp = -this.calcFsDamage(atkEntity, buffCfg.special[1], buffCfg.hp);
                                }
                                else if (buffCfg.ac)
                                {
                                    tmpAc = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxfs + atkEntity._animAttr.minfs) * 0.5 +　buffCfg.ac;
                                }
                                else if (buffCfg.shiled)
                                {
                                    tmpShiled = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxfs + atkEntity._animAttr.minfs) * 0.5 + buffCfg.shiled;
                                }
                            }
                            else if (buffCfg.special[0] === 3)
                            {
                                if (buffCfg.hp > 0)
                                {
                                    tmpHp = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxds + atkEntity._animAttr.minds) * 0.5 + buffCfg.hp;
                                }
                                else if (buffCfg.hp < 0)
                                {
                                    tmpHp = -this.calcDsDamage(atkEntity, buffCfg.special[1], buffCfg.hp);
                                }
                                else if (buffCfg.ac)
                                {
                                    tmpAc = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxds + atkEntity._animAttr.minds) * 0.5 +　buffCfg.ac;
                                }
                                else if (buffCfg.shiled)
                                {
                                    tmpShiled = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxds + atkEntity._animAttr.minds) * 0.5 + buffCfg.shiled;
                                }
                            }
                            else if (buffCfg.special[0] === 4)
                            {
                                tmpAc = buffCfg.special[1] * 0.01 * (atkEntity._animAttr.maxac + atkEntity._animAttr.minac) * 0.5 +　buffCfg.ac;
                            }
                        }

                        if (buffCfg.shiled)
                        {
                            if (this.buffEntity.shiled)
                            {
                                console.log("魔法盾未破不能释放", this.name);
                                continue;
                            }

                            if (skillcfg)
                            {
                                let skillvo = this.skillEntity.getLearnSkillVO(skillcfg.id);
                                if (skillvo)
                                {
                                    skillvo.pauseCD = true;
                                }
                            }

                            this.buffEntity.shiled = buffCfg.shiled + tmpShiled;
                        }

                        let buffVo:FightingSkillBuffVO = FightingSkillBuffVO.pool.alloc();
                        buffVo.setData(buffId, atkEntity, this, skillcfg);
                        buffVo.ac = tmpAc || 0;
                        buffVo.hp = tmpHp || 0;
                        this.buffEntity.addBuffVo(buffVo);
                        
                        // console.log('附加Buff:', atkEntity.name, '=>', this.name, '  ', buffVo.buffCfg.name);

                        // console.log("添加Buff：", this.name, skillcfg.id, skillcfg.name);
                        this.fightingRoom.sendAddBuff(this.eid, buffVo.eid, buffId);
                        isAdd = true;
                    }
                    else
                    {
                        this.buffEntity.resetBuffId(buffId);
                    }
                }
            }

            isAdd && this.buffEntity.updateBuffAttr();
        }
    }

    //--------------------------------------------------------------------------------------------------------

    private checkDie():void
    {
        if (this.hp == 0)
        {
            this.die();
        }
    }

    /**
     * 死亡
     */
    public die():void
    {
        if (this.isLive)
        {
            this._isLive = false;

            this.onDie();
        }
    }

    protected onDie():void
    {
        // Logger.log(`生物死亡 Eid:${this.eid} ${this.name} PET:[${this.petlist.map((pet)=>{return pet.eid + "_" + pet.name})}]`);

        let tmplist = this.petlist.concat();
        for (let i = tmplist.length - 1; i >= 0; i--)
        {
            tmplist[i].die();
        }
        this.petlist.length = 0;

        if (this.ownerEntity)
        {
            this.ownerEntity.childDie(this);
        }
        this.ownerEntity = null;
    }

    //--------------------------------------------------------------------------------------------------------
    /** 攻击力 */
    // public get atk():number
    // {
    //     let baseAtk = this.baseAtk;
    //     return baseAtk + this.buffAttr.atk + baseAtk * this.buffAttr.atkPercent;
    // }

    private isLucky:boolean = false;
    public get baseAtk():number
    {
        this.isLucky = Math.random() * 100 < this._animAttr.lucky * 5;
        return this.isLucky ? this._animAttr.maxact : this._animAttr.minact + (Math.random() * (this._animAttr.maxact - this._animAttr.minact));
    }

    /** 战士 */
    public get baseZs():number
    {
        let islucky = Math.random() * 100 < this._animAttr.lucky * 5;
        return islucky ? this._animAttr.maxzs : this._animAttr.minzs + (Math.random() * (this._animAttr.maxzs - this._animAttr.minzs));
    }
    /** 法师 */
    public get baseFs():number
    {
        let islucky = Math.random() * 100 < this._animAttr.lucky * 5;
        return islucky ? this._animAttr.maxfs : this._animAttr.minfs + (Math.random() * (this._animAttr.maxfs - this._animAttr.minfs));
    }
    /** 法师 */
    public get baseDs():number
    {
        let islucky = Math.random() * 100 < this._animAttr.lucky * 5;
        return islucky ? this._animAttr.maxds : this._animAttr.minds + (Math.random() * (this._animAttr.maxds - this._animAttr.minds));
    }


    /** 防御 */
    // public get def():number
    // {
    //     let baseDef = this.baseDef;
    //     return baseDef + this.buffAttr.ac + baseDef * this.buffAttr.ac2 * 0.01;
    // }
    public get baseDef():number
    {
        return this._animAttr.minac + Math.random() * (this._animAttr.maxac - this._animAttr.minac);
    }

    /** 固防 */
    public get fixeddamage():number
    {
        return this._animAttr.fixeddamage;
    }
    /** 闪避(1-100) */
    public get evade():number
    {
        return this._animAttr.evade + this.buffEntity.evade;
    }

    public get hit():number
    {
        return this._animAttr.hit;
    }

    public get lucky():number
    {
        return this._animAttr.lucky;
    }

    //--------------------------------------------------------------------------------------------------------
    /**
     * 获取一个可以使用的技能
     */
    public getCanSkillCfg(targetEntity:FightingAnimalEntity):SkillCFG
    {
        return this.skillEntity.getCanSkillVo(this, targetEntity)?.skillCfg;
    }

    /**
     * 获取受伤最严重的友军（包括自己);
     */
    public getMaxInjuredTeamEntity():FightingAnimalEntity
    {
        // 血量触发
        let maxHpRate = 100 * this.hp / this.maxHp;
        let maxInjuredEntity:FightingAnimalEntity = this;

        let petlist = this.petlist;
        for (let pet of petlist)
        {
            let petHpRate = 100 * pet.hp / pet.maxHp;
            if (maxHpRate > petHpRate)
            {
                maxHpRate = petHpRate;
                maxInjuredEntity = pet;
            }
        }
        return maxInjuredEntity;
    }
    //--------------------------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        this.petlist.length = 0;

        this.lockEntity = null;

        this.skillEntity.destroy();
        this.buffEntity.destroy();

        super.onDestroy();
    }
}