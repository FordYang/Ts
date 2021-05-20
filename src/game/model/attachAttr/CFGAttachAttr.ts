import { AttachAttrCFG } from "../../config/cfg/AttachAttrCFG";
import BaseRoleAttr from "./BaseRoleAttr";

export default class CFGAttachAttr extends BaseRoleAttr
{

    /**　添加激活属性 */
    public addCFG(attrCfg: AttachAttrCFG): void 
    {
        this.hp += attrCfg.hp || 0;
        this.mp += attrCfg.mp || 0;
        this.minac += attrCfg.minac || 0;
        this.maxac += attrCfg.maxac || 0;
        this.minzs += attrCfg.minzs || 0;
        this.maxzs += attrCfg.maxzs || 0;
        this.minfs += attrCfg.minfs || 0;
        this.maxfs += attrCfg.maxfs || 0;
        this.minds += attrCfg.minds || 0;
        this.maxds += attrCfg.maxds || 0;
        this.fixeddamage += attrCfg.fixeddamage || 0;
        this.fixedac += attrCfg.fixedac || 0;
        this.hit += attrCfg.hit || 0;
        this.evade += attrCfg.evade || 0;
        this.critical += attrCfg.critical || 0;
        this.tenacity += attrCfg.tenacity || 0;
        this.atkSpeed += attrCfg.atkspeed || 0;
    }
    //--------------------------------------------------------------------------------------------------------------
    
}