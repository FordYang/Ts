import { ProfessionConfig } from "../../config/ProfessionConfig";
import { EAttrType, EProfessionType } from "../../consts/ERole";
import BaseAttachAttr from "./BaseAttachAttr";
import BaseRoleAttr from "./BaseRoleAttr";

export class TotalRoleAttr extends BaseRoleAttr
{
    
    protected attrList:BaseAttachAttr[] = [];

    constructor()
    {
        super(EProfessionType.UNKNOW);
    }

    public addChildAttr(attr:BaseAttachAttr):void
    {
        this.attrList.push(attr);
    }

    public clearChildAttr()
    {
        this.attrList = [];
    }

    public setProfession(profession:EProfessionType):void
    {
        super.setProfession(profession);

        let professioncfg = ProfessionConfig.instance.getProfessionCfgById(profession);
        if (professioncfg)
        {
            this.atkSpeed = professioncfg.atkspeed;
        }
    }

    /** 获取增加属性值 */
    public getAttrById(attrId: number): number 
    {
        let attrValue = super.getAttrById(attrId);
        for (let attr of this.attrList) 
        {
            if (attrId === EAttrType.ATK_SPD)
            {
                attrValue -= attr.getAttrById(attrId);
            }
            else
            {
                attrValue += attr.getAttrById(attrId);
            }
        }
        return attrValue;
    }

    /** 获取增加战力 */
    public getFighting(): number 
    {
        let fightingValue:number = 0;
        for (let attr of this.attrList)
        {
            fightingValue += attr.getFighting();
        }
        return fightingValue;
    }

    public toString():string
    {
        let str = "------------------------------------------------------------------------------------------\n";
        str += this.getFighting() + "\n" + this.desc + "\n";
        for (let attr of this.attrList)
        {
            str += "---------------------------------------------------\n";
            str += attr.attachName + "   " + attr.getFighting() + '\n' + attr.desc + "\n";
        }
        str += "------------------------------------------------------------------------------------------";
        return str;
    }
}