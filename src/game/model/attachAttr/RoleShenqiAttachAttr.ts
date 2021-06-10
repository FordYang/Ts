import JingmaiConfig from "../../config/JingmaiConfig";
import { ShenQiConfig } from "../../config/ShenQiConfig";
import { EProfessionType } from "../../consts/ERole";
import CFGAttachAttr from "./CFGAttachAttr";

export class RoleShenqiAttachAttr extends CFGAttachAttr
{
    
    constructor(profession:EProfessionType) 
    {
        super(profession);
        
        this.attachName = "神器";
    }

    public updateAttrValue(id:number):void
    {
        this.reset();

        let minValue = Math.floor(id / 1000) * 1000;
        let shenqiTable = ShenQiConfig.instance.table;
        for (let i: number = 0; i < shenqiTable.length; i++) 
        {
            if (id > minValue && id >= shenqiTable[i].id) 
            {
                this.addCFG(shenqiTable[i]);
            }
        }
    }
}