import { IProfessionCFG } from "../../config/cfg/ProfessionCFG";
import { ProfessionConfig } from "../../config/ProfessionConfig";
import { EProfessionType } from "../../consts/ERole";
import BaseRoleAttr from "../../model/attachAttr/BaseRoleAttr";
import RoleAttr from "../../model/attachAttr/RoleAttr";
import { TotalRoleAttr } from "../../model/attachAttr/TotalRoleAttr";
import Player from "../../model/playerObj/Player";
import FightingAnimalAttr from "./FightingAnimalAttr";

export default class FightingPlayerAttr extends FightingAnimalAttr
{
    private attr:BaseRoleAttr;

    public profession:EProfessionType;
    public eid:number = 0;

    private professioncfg:IProfessionCFG;
    
    constructor()
    {
        super();

    }

    public initValue(eid:number, name:string, level:number, profession:EProfessionType, teamId:number, attr:BaseRoleAttr, skillIdList:number[], passBuffIdList:number[]):void
    {
        this.eid = eid;

        this.name = name;
        this.level = level;
        this.teamId = teamId;

        this.profession = profession;
        this.professioncfg = ProfessionConfig.instance.getProfessionCfgById(this.profession);
        
        this.attr = attr;
        this.hp = this.maxhp = this.attr.totalHp;
        this.mp = this.maxmp = this.attr.totalMp;
        
        this.skillIdList =  skillIdList;

        this.passBuffIdList = passBuffIdList;

        this.updateAttr();
    }

    public get walkDuration():number
    {
        return this.professioncfg.walkwait * 1000;
    }

    /** 复活 */
    public revive():void
    {
        this.hp = this.maxhp = this.attr.totalHp;
        this.mp = this.maxmp = this.attr.totalMp;
    }

    public upgradeLevel():void
    {
        this.level = this.level;

        this.hp = this.maxhp;
        this.mp = this.maxhp;
    }

    public upgradeSkill(skillIdList:number[]):void
    {
        this.skillIdList =  skillIdList;
    }

    public updateAttr():void
    {
        this.hp = this.hp * (this.attr.totalHp / this.maxhp);
        this.mp = this.mp * (this.attr.totalMp / this.maxmp);
        this.maxhp = this.attr.totalHp;
        this.maxmp = this.attr.totalMp;
        // this.maxhp = this.attr.hp / this.maxhp;

        this.atkSpeed = this.attr.atkSpeed;

        this.minac = this.attr.minac;
        this.maxac = this.attr.maxac;
        
        this.minact = this.attr.minAtk;
        this.maxact = this.attr.maxAtk;

        this.minzs = this.attr.minzs;
        this.maxzs = this.attr.maxzs;
        this.minfs = this.attr.minfs;
        this.maxfs = this.attr.maxfs;
        this.minds = this.attr.minds;
        this.maxds = this.attr.maxds;

        this.lucky = this.attr.lucky;

        this.fixeddamage = this.attr.fixeddamage;
        this.fixedac = this.attr.fixedac;
        this.hit = 90 + this.attr.hit;
        this.evade = this.attr.evade;
        this.critical = this.attr.critical;
        this.tenacity = this.attr.tenacity;

        this.adddamage = this.attr.adddamage;
        this.addac = this.attr.addac;

        this.crtdamage = this.attr.crtdamage;

        this.absorbhp = this.attr.absorbhp;
        this.absorbmp = this.attr.absorbmp;
    }
}