import { IProfessionCFG } from "../../config/cfg/ProfessionCFG";
import { EAttrType, EProfessionType } from "../../consts/ERole";
import BaseRoleAttr from "./BaseRoleAttr";

export default class RoleAttr extends BaseRoleAttr {
    private professioncfg: IProfessionCFG;
    private lv: number;

    constructor() 
    {
        super(EProfessionType.ZHANSHI);

        this.attachName = "角色基础属性";
    }

    public setPlayerCfg(professioncfg: IProfessionCFG, lv: number): void 
    {
        this.professioncfg = professioncfg;
        this.setProfession(professioncfg.id);

        this.setLv(lv);
    }

    public setLv(lv: number): void 
    {
        if (this.lv != lv) 
        {
            this.lv = lv;
            let professioncfg = this.professioncfg;

            this.setAttrValue(EAttrType.HP, Math.ceil(professioncfg.hp + lv * professioncfg.g_hp));
            this.setAttrValue(EAttrType.MP, Math.ceil(professioncfg.mp + lv * professioncfg.g_mp));
            this.setAttrValue(EAttrType.MIN_ZS, Math.ceil(professioncfg.minzs + lv * professioncfg.g_minzs));
            this.setAttrValue(EAttrType.MAX_ZS, Math.ceil(professioncfg.maxzs + lv * professioncfg.g_maxzs));
            this.setAttrValue(EAttrType.MIN_FS, Math.ceil(professioncfg.minfs + lv * professioncfg.g_minfs));
            this.setAttrValue(EAttrType.MAX_FS, Math.ceil(professioncfg.maxfs + lv * professioncfg.g_maxfs));
            this.setAttrValue(EAttrType.MIN_DS, Math.ceil(professioncfg.minds + lv * professioncfg.g_minds));
            this.setAttrValue(EAttrType.MAX_DS, Math.ceil(professioncfg.maxds + lv * professioncfg.g_maxds));
            this.setAttrValue(EAttrType.MIN_AC, Math.ceil(professioncfg.minac + lv * professioncfg.g_minac));
            this.setAttrValue(EAttrType.MAX_AC, Math.ceil(professioncfg.maxac + lv * professioncfg.g_maxac));
        }
    }
    
    protected getOneAttrFighting(attrId: number): number 
    {
        if (attrId === EAttrType.ATK_SPD)
        {
            return 0;
        }
        return super.getOneAttrFighting(attrId);
    }
}