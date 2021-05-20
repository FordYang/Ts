import { CiZhuiConfig } from "../../config/CiZhuiConfig";
import { EAttrType, EProfessionType } from "../../consts/ERole";
import BaseAttachAttr from "./BaseAttachAttr";

export default class BaseRoleAttr extends BaseAttachAttr 
{
    private _attrMap:{[attrId:number]:number};

    constructor(profession:EProfessionType) 
    {
        super(profession);

        this._attrMap = {};
    }

    public reset(): void 
    {
        for (let attrId in this._attrMap)
        {
            this._attrMap[attrId] = 0;
        }
    }

    /** 根据属性ID获取属性值 */
    public getAttrById(attrId: number): number 
    {
        return this._attrMap[attrId] ?? 0;
    }

    /** 设置属性值 */
    protected setAttrValue(attrId: number, value: number): void 
    {
        if (this._attrMap[attrId] !== value) 
        {
            this._attrMap[attrId] = value;
        }
    }

    protected addAttrValue(attrId: number, value: number) 
    {
        this._attrMap[attrId] = this.getAttrById(attrId) + value;
    }

    //--------------------------------------------------------------------------------------------------------------

    /** 获取战斗力 */
    public getFighting(): number 
    {
        let fighting: number = 0;

        Object.keys(this._attrMap).forEach((v)=>
        {
            let attrId = Number(v);

            if (attrId !== EAttrType.AC && attrId !== EAttrType.ZS && attrId !== EAttrType.FS && attrId !== EAttrType.DS)
            {
                if (attrId < CiZhuiConfig.MAX_ATTR_ID) 
                {
                    fighting += this.getOneAttrFighting(attrId);
                }
            }
        });
        
        // 防御
        fighting += Math.ceil((Math.abs(this.maxac - this.minac) / 2 + this.minac) * CiZhuiConfig.instance.getVcombat(EAttrType.AC));
        // 攻击 
        fighting += Math.ceil((Math.abs(this.maxAtk - this.minAtk) / 2 + this.minAtk) * CiZhuiConfig.instance.getVcombat(this.professionAtkAttrId));

        return Math.ceil(fighting);
    }

    protected getOneAttrFighting(attrId:number): number 
    {
        let result = this.getAttrById(attrId) * CiZhuiConfig.instance.getVcombat(attrId);
        return Math.ceil(result);
    }
}