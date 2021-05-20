import JingmaiConfig from "../../config/JingmaiConfig";
import { EProfessionType } from "../../consts/ERole";
import CFGAttachAttr from "./CFGAttachAttr";

export default class RoleJingmaiAttachAttr extends CFGAttachAttr
{
    
    constructor(profession:EProfessionType) 
    {
        super(profession);
        
        this.attachName = "精脉";
    }

    public updateAttrValue(id:number):void
    {
        this.reset();
        
        let xueweiCfgList = JingmaiConfig.instance.xueweiList;
        for (let i: number = 0; i < xueweiCfgList.length; i++) 
        {
            if (id >= xueweiCfgList[i].id) 
            {
                this.addCFG(xueweiCfgList[i]);
            }
        }
    }
}