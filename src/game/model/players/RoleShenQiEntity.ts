import { ShenQiConfig } from "../../config/ShenQiConfig";
import { ERichesType } from "../../consts/EGame";
import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import CyObject from "../../core/CyObject";
import DataUtil from "../../gear/DataUtil";
import DateUtil from "../../gear/DateUtil";
import DBUtil from "../../gear/DBUtil";
import CmdID from "../../network/CmdID";
import DBForm from "../../utils/DBForm";
import { RoleShenqiAttachAttr } from "../attachAttr/RoleShenqiAttachAttr";
import Player from "../playerObj/Player";

export class RoleShenQiEntity extends CyObject
{

    private player:Player;

    private shenqiMap:{[type:number]:{shenQiId:number, skillLv:number}};

    public attachAttrMap:{[type:number]:RoleShenqiAttachAttr};

    constructor(player:Player)
    {
        super();

        this.player = player;

        this.attachAttrMap = {};//

        this.player.on(CmdID.c2s_shenqi_upgrade, this.onC2SUpgrade);
        this.player.on(CmdID.c2s_shenqi_skill_upgrade, this.onC2SSkillUpgrade);
    }

    /**　附加的被动Buff */
    public get passBuffIdList():number[]
    {
        let buffIdList:number[] = [];
        let objlist = Object.values(this.shenqiMap);
        for (let type in objlist)
        {
            let obj = objlist[type];
            if (obj.skillLv)
            {
                let shenqicfg = ShenQiConfig.instance.getCFGBySkillLv(parseInt(type), obj.skillLv);
                if (shenqicfg && shenqicfg.skill)
                {
                    buffIdList.push(shenqicfg.skill);
                }
            }
        }
        return buffIdList;
    }

    private onC2SSkillUpgrade = (bodyObj:{type:number})=>
    {
        if (bodyObj && bodyObj.type)
        {
            let shenqiObj = this.getObjById(bodyObj.type);
            let nextLv:number = shenqiObj.skillLv + 1; 
            let needItemList = ShenQiConfig.instance.getCFGBySkillLv(bodyObj.type, nextLv)?.needvalue2;
            if (needItemList && needItemList.length > 0)
            {
                let shenqicfg = ShenQiConfig.instance.getCFGById(shenqiObj.shenQiId);
                if (shenqicfg.lvl >= nextLv)
                {
                    for (let i:number = 0; i < needItemList.length; i+=2)
                    {
                        let itemcount = this.player.getItemCount(needItemList[i]);
                        if (needItemList[i + 1] > itemcount)
                        {
                            this.player.send(CmdID.s2c_shenqi_skill_upgrade, {code:ErrorConst.MATERIAL_NOT_ENOUGH});
                            return;
                        }
                    }
    
                    for (let i:number = 0; i < needItemList.length; i+=2)
                    {
                        this.player.addItem(needItemList[i], -needItemList[i+1], "申请神器等级");
                    }
                    
                    shenqiObj.skillLv = nextLv;
                    this.saveDB();
    
                    this.player.send(CmdID.s2c_shenqi_skill_upgrade, {code:ErrorConst.SUCCEED, type:bodyObj.type, 
                                                shenQiId:shenqiObj.shenQiId, skillLv:shenqiObj.skillLv});
                }
                else
                {
                    this.player.send(CmdID.s2c_shenqi_skill_upgrade, {code:ErrorConst.LV_NOT_ENOUGH});
                }
            }
            else
            {
                // 满级
            }
        }
    }

    private onC2SUpgrade = (bodyObj:{type:number})=>
    {
        if (bodyObj && bodyObj.type)
        {
            let shenqiObj = this.getObjById(bodyObj.type);
            let nextId:number = shenqiObj.shenQiId + 1; 

            let shenqiCfg = ShenQiConfig.instance.getCFGById(nextId);
            if (shenqiCfg)
            {
                if (this.player.level >= shenqiCfg.needvalue)
                {
                    if (this.player.money >= shenqiCfg.costgold && this.player.getShenQiMoney() >= shenqiCfg.costmineral)
                    {
                        this.player.addMoney(ERichesType.Money, -shenqiCfg.costgold, "升级神器");
                        this.player.addShenQiMoney(-shenqiCfg.costmineral);
    
                        shenqiObj.shenQiId = nextId;
    
                        this.attachAttrMap[bodyObj.type].updateAttrValue(nextId);
                        this.saveDB();
    
                        this.player.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
    
                        this.player.send(CmdID.s2c_shenqi_upgrade, {code:ErrorConst.SUCCEED, type:bodyObj.type, 
                                                    shenQiId:shenqiObj.shenQiId, skillLv:shenqiObj.skillLv});
                    }
                    else
                    {
                        this.player.send(CmdID.s2c_shenqi_upgrade, {code:ErrorConst.MATERIAL_NOT_ENOUGH});
                    }
                }
                else
                {
                    this.player.send(CmdID.s2c_shenqi_skill_upgrade, {code:ErrorConst.LV_NOT_ENOUGH});
                }
            }
            else
            {
                // 满级
            }
        }
    }

    private getObjById(type:number)
    {
        return this.shenqiMap[type] || (this.shenqiMap[type] = {shenQiId:1000, skillLv:0});
    }

	//---------------------------------------------------------------------------------------------------------------

    public saveDB():void
    {
        let sql = DBUtil.createUpdate("cy_role", {shenqi:DataUtil.toJson(this.shenqiMap)}, {role_id:this.player.roleid});
        DBForm.instance.query(sql);
    }

    public deserializeDB(shenqi:string):void 
    {
        this.shenqiMap = DataUtil.jsonBy(shenqi) || {};
        if (!this.shenqiMap[1])
        {
            this.shenqiMap[1] = {shenQiId:1000, skillLv:0};
        }
        if (!this.shenqiMap[2])
        {
            this.shenqiMap[2] = {shenQiId:2000, skillLv:0};
        }

        for (let type in this.shenqiMap)
        {
            this.attachAttrMap[type] = new RoleShenqiAttachAttr(this.player.profession);
            this.attachAttrMap[type].updateAttrValue(this.shenqiMap[type].shenQiId);
        }
    }
    
    public serializeClient():string
    {
        return DataUtil.toJson(this.shenqiMap);
    }

	//---------------------------------------------------------------------------------------------------------------
    protected onDestroy()
    {
        this.player.off(CmdID.c2s_shenqi_upgrade, this.onC2SUpgrade);
        this.player.off(CmdID.c2s_shenqi_skill_upgrade, this.onC2SUpgrade);
        this.player = null;

        super.onDestroy();
    }
}