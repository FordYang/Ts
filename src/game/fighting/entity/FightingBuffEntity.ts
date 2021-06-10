import { EFightingHurtType } from "../../consts/EFightingHurtType";
import { EAttrType } from "../../consts/ERole";
import { EFightingSkillStateConst } from "../../consts/EFightingSkillStateConst";
import CyObject from "../../core/CyObject";
import { IPoolObject } from "../../core/memop/IPoolObject";
import ArrayUtil from "../../gear/ArrayUtil";
import FightingSkillBuffAttr from "../vo/FightingSkillBuffAttr";
import FightingSkillBuffVO from "../vo/FightingSkillBuffVO";
import FightingAnimalEntity from "./FightingAnimalEntity";

/**
 * Buff实体
 */
export default class FightingBuffEntity extends CyObject implements IPoolObject
{
    /** 附加Buff */
    protected readonly buffVoList:FightingSkillBuffVO[];
    public readonly buffAttr:FightingSkillBuffAttr;

    private owner:FightingAnimalEntity;

    /** 当前护盾 */
    private _shiled:number = 0;
    /** 当前护盾最大值 */
    // private _shiled2:number = 0;
    
    /** 状态 0：无 1：眩晕  2：定身 */
    protected _state:number = EFightingSkillStateConst.NONE;
    /** 掉血类型 */
    public hurtType:EFightingHurtType = EFightingHurtType.BUFF;
    
    constructor()
    {
        super();
        
        this.buffAttr = new FightingSkillBuffAttr();
        this.buffVoList = [];
    }

    public recyclePool():void
    {
        this.owner = null;
        
        this.reset();
    }

    public reset():void
    {
        this._state = EFightingSkillStateConst.NONE;

        this.buffAttr.reset();
        this.buffVoList.length = 0;
    }

    //----------------------------------------------------------------------------------------------------------------
    public setOwner(owner:FightingAnimalEntity):void
    {
        this.owner = owner;
    }

    public get buffIdList()
    {
        let idlist:{uEid:number, buffId:number}[] = [];

        for (let buffvo of this.buffVoList)
        {
            idlist.push({uEid:buffvo.eid, buffId:buffvo.buffId});
        }

        return idlist;
    }

    public get atkSpeek():EFightingSkillStateConst
    {
        return this.buffAttr.atkSpeek;
    }

    /** 状态 0：无 1：眩晕  2：定身 */
    public get state():EFightingSkillStateConst
    {
        return this._state;
    }

    public get shiled():number
    {
        return this._shiled;
    }

    public set shiled(val:number)
    {
        if (this._shiled !== val)
        {
            if (val >= 0)
            {
                this.owner.changeAttr(EAttrType.SHILED, Math.max(0, val));
            }
        }

        this._shiled = val;

        // console.log("魔法盾 值 ", val);
    }

    public get evade():number
    {
        return this.buffAttr.evade;
    }

    //----------------------------------------------------------------------------------------------------------------

    private buffT:number = 0;
    private buffObj:{hp:number, mp:number} = {hp:0, mp:0};
    public update(dt:number):void
    {
        this.buffObj.hp += (this.buffAttr.hp + (this.buffAttr.hpPercent * 0.01) * this.owner.maxHp) * dt;
        this.buffObj.mp += this.buffAttr.mp;
        if (process.uptime() - this.buffT >= 1)
        {
            this.buffT = process.uptime();

            // 计算BUFF伤害
            this.owner.mp += this.buffObj.mp;

            if (this.buffObj.hp)
            {
                // console.log("Buff造成伤害:HP", this.buffObj.hp);
                this.owner.addBuffHp(this.hurtType, this.buffObj.hp);
            }

            this.buffObj.hp = this.buffObj.mp = 0;
            
            // 刷新Buff效果
            for (let i:number = this.buffVoList.length - 1; i >= 0; i--)
            {
                let buffVo = this.buffVoList[i];
                
                if (!buffVo.isValid)
                {
                    this.removeBuff(buffVo);
                }
            }
        }
    }

    public addBuffVo(buffVo:FightingSkillBuffVO):void
    {
        // console.log("添加Buff", buffVo.buffId, buffVo.buffCfg.name);
        this.buffVoList.push(buffVo);
    }

    //-------------------------------------------------
    public removeShiledBuff():void
    {
        for (let buffVo of this.buffVoList)
        {
            if (buffVo.buffCfg.shiled)
            {
                this.removeBuff(buffVo);
                break;
            }
        }
    }

    //-------------------------------------------------

    /** 删除Buff */
    private removeBuff(buffVo:FightingSkillBuffVO):void
    {
        this.owner.sendRemoveBuff(buffVo.eid);
        
        if (buffVo.isMagicShild)
        {
            // console.log("魔法盾破", buffEntity?.hitEntity.name);
            this.shiled = 0;
            buffVo.removeMagicShild();
        }
        FightingSkillBuffVO.pool.free(buffVo);
        // buffVo.destroy();

        let idx = this.buffVoList.indexOf(buffVo);
        if (idx != -1)
        {
            ArrayUtil.fastRemoveIdx(this.buffVoList, idx);

            this.updateBuffAttr();
        }
    }

    public updateBuffAttr():void
    {
        this._state = EFightingSkillStateConst.NONE;
        this.hurtType = EFightingHurtType.BUFF;

        this.buffAttr.reset();
        for (let buffVo of this.buffVoList)
        {
            let baseBuffId:number = Math.floor(buffVo.buffId / 100);
            if (baseBuffId === 1006 || baseBuffId === 2003)
            {
                this.hurtType = EFightingHurtType.ZHUO_SHAO;
            }
            else if (baseBuffId === 3004)
            {
                this.hurtType = EFightingHurtType.ZHONG_DU;
            }
            else if (baseBuffId === 1003)
            {
                this.hurtType = EFightingHurtType.LIU_XIE;
            }

            if (buffVo.buffCfg.state && (buffVo.buffCfg.state !== EFightingSkillStateConst.NONE))
            {
                this._state = buffVo.buffCfg.state;
            }
            this.buffAttr.addBuff(buffVo);
        }
    }

    public checkExistBuff(buffId:number):boolean
    {
        for (let buffVo of this.buffVoList)
        {
            if (buffVo.buffId == buffId)
            {
                return true;
            }
        }
        return false;
    }

    /** 重新添加，重置时间 */
    public resetBuffId(buffId:number):void
    {
        for (let buffVo of this.buffVoList)
        {
            if (buffVo.buffId == buffId)
            {
                buffVo.resetSt();
            }
        }
    }

    //----------------------------------------------------------------------------------------------------------------
    protected onDestroy():void
    {
        for (let buffVo of this.buffVoList)
        {
            FightingSkillBuffVO.pool.free(buffVo);
            // buffVo.destroy();
        }
        this.buffVoList.length = 0;

        this.owner = null;

        super.onDestroy();
    }
}