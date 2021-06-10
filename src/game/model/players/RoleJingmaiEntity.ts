import { JingmaiCFG } from "../../config/cfg/JingmaiCFG";
import { JingmaiXueweiCFG } from "../../config/cfg/JingmaiXueweiCFG";
import JingmaiConfig from "../../config/JingmaiConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import CyObject from "../../core/CyObject";
import Agent from "../../network/Agent";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import RoleJingmaiAttachAttr from "../attachAttr/RoleJingmaiAttachAttr";
import Player from "../playerObj/Player";

/** 经脉实体 */
export default class RoleJingmaiEntity extends CyObject
{
    private player:Player;

    private lv:number;
    private xueweiId:number;
    private xueweiCfg:JingmaiXueweiCFG;

    private _attachAttr:RoleJingmaiAttachAttr;

    constructor(player:Player)
    {
        super();
        
        this.player = player;

        this.lv = 1;
        this.xueweiId = 1000;

        this._attachAttr = new RoleJingmaiAttachAttr(player.profession);
    }

    public getLv():number
    {
        return this.lv;
    }
    public getXueweiId():number
    {
        return this.xueweiId;
    }

    public get attachAttr():RoleJingmaiAttachAttr
    {
        return this._attachAttr;
    }

    //---------------------------------------------------------------------------------------------------
    /** 序列化到前端 */
    public serializeClient():string
    {
        return this.serializeDB();
    }

    public serializeDB():string
    {
        return JSON.stringify({lv:this.lv, xueweiId:this.xueweiId});
    }

    public deserialize(jingmaiJson:{lv:number, xueweiId:number}):void
    {
        if (jingmaiJson)
        {
            this.lv = jingmaiJson.lv;
            this.xueweiId = jingmaiJson.xueweiId;
    
            this.updateAttachAttr();
        }

        this._attachAttr.setProfession(this.player.profession);
    }

    //---------------------------------------------------------------------------------------------------
    private updateAttachAttr():void
    {
        this.xueweiCfg = JingmaiConfig.instance.getXueweiCfg(this.lv, this.xueweiId);

        if (this.xueweiCfg)
        {
            this._attachAttr.updateAttrValue(this.xueweiCfg.id);
        }
    }

    //---------------------------------------------------------------------------------------------------

    public sendUpgrad(code:number, lv:number, xueweiId:number):void
    {
        this.player.send(CmdID.s2c_role_jingmai_upgrade, {code, lv:lv, xueweiId:xueweiId});
    }

    //---------------------------------------------------------------------------------------------------
    /**
     * 请求升级 检查是否满级；检查消耗是否满足；
     * @param bodyObj 
     */
    public c2sUpgrade(bodyObj:any):void
    {
        let nextCfg = JingmaiConfig.instance.getNextXueweiCfg(this.lv, this.xueweiCfg? this.xueweiCfg.jmid : 1, this.xueweiId);
        
        if (nextCfg)
        {
            // 检查材料 (等背包)
            let costItem1 = nextCfg.costgold;
            if (costItem1)
            {
                let costCount1 = this.player.getItemCount(costItem1[0]);
                if (costItem1[1] > costCount1)
                {
                    // 材料不足
                    this.sendUpgrad(ErrorConst.MATERIAL_NOT_ENOUGH, 0, 0);
                    return;
                }
            }
            let costItem2 = nextCfg.costitem;
            if (costItem2)
            {
                let costCount2 = this.player.getItemCount(costItem2[0]);
                if (costItem2[1] > costCount2)
                {
                    // 材料不足
                    this.sendUpgrad(ErrorConst.MATERIAL_NOT_ENOUGH, 0, 0);
                    return;
                }
            }
            if (nextCfg.needlvl > this.player.level)
            {
                this.sendUpgrad(ErrorConst.LV_NOT_ENOUGH, 0, 0);
                return;
            }

            costItem1 && this.player.addItem(costItem1[0], -costItem1[1],"经脉升级", false);
            costItem2 && this.player.addItem(costItem2[0], -costItem2[1],"经脉升级", false);

            this.lv = nextCfg.lvl;
            this.xueweiId = nextCfg.xwid;

            this.updateAttachAttr();

            DB.updateRoleAttr(this.player.roleid, ["jingmai"], [this.serializeDB()]);

            this.sendUpgrad(ErrorConst.SUCCEED, nextCfg.lvl, nextCfg.xwid);
            
            this.player.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
            this.player.emit(PlayerEvent.HERO_JING_MAI_CHANGE);
        }
        else
        {
            // 已满级
            this.sendUpgrad(ErrorConst.MAX_LV, 0, 0);
        }
    }

    //----------------------------------------------------------------------------------------------------------------

    protected onDestroy()
    {

        super.onDestroy();
    }
}