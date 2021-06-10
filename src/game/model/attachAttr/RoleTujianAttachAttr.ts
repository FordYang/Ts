import { EProfessionType } from "../../consts/ERole";
import CFGAttachAttr from "./CFGAttachAttr";

export default class RoleTujianAttachAttr extends CFGAttachAttr
{
    constructor(profession:EProfessionType) 
    {
        super(profession);

        this.attachName = "图鉴";
    }
    
}