import BaseRoleAttr from "./BaseRoleAttr";

/**　战斗属性 */
export default class RoleFightAttr extends BaseRoleAttr
{
    public deserializeDB(obj:any):void
    {
        this.hp = obj.hp ?? 0;
        this.mp = obj.mp ?? 0;
        this.minzs = obj.minzs ?? 0;
        this.maxzs = obj.maxzs ?? 0;
        this.minfs = obj.minfs ?? 0;
        this.maxfs = obj.maxfs ?? 0;
        this.minds = obj.minds ?? 0;
        this.maxds = obj.maxds ?? 0;
        this.minac = obj.minac ?? 0;
        this.maxac = obj.maxac ?? 0;
        this.atkSpeed = obj.atkSpeed ?? 0;
        this.lucky = obj.lucky ?? 0;
        this.fixeddamage = obj.fixeddamage ?? 0;
        this.fixedac = obj.fixedac ?? 0;
        this.hit = obj.hit ?? 0;
        this.evade = obj.evade ?? 0;
        this.critical = obj.critical ?? 0;
        this.crtdamage = obj.crtdamage ?? 0;
        this.tenacity = obj.tenacity ?? 0;
        this.adddamage = obj.adddamage ?? 0;
        this.addac = obj.addac ?? 0;
        this.absorbhp = obj.absorbhp ?? 0;
        this.absorbmp = obj.absorbmp ?? 0;
    }
}