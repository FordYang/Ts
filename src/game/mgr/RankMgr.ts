import ServerConf from "../../conf/ServerConf";
import LanguageConfig from "../config/LanguageConfig";
import { ProfessionConfig } from "../config/ProfessionConfig";
import { ERankType } from "../consts/ERankType";
import { EProfessionType } from "../consts/ERole";
import { ErrorConst } from "../consts/ErrorConst";
import { ESystemNoticeType } from "../consts/ESystemNoticeType";
import GameEvent from "../consts/GameEvent";
import EventTool from "../core/EventTool";
import GameUtil from "../core/GameUtil";
import DataUtil from "../gear/DataUtil";
import DBUtil from "../gear/DBUtil";
import Logger from "../gear/Logger";
import Player from "../model/playerObj/Player";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import CmdID from "../network/CmdID";
import DBForm from "../utils/DBForm";

interface RankRecord
{
    id:number;
    /** 1：等级排行  2：战力排行  */
    type:number;
    /** role */
    role_server_id:number;

    role_id:number;

    role_profession:number;

    role_name:string;

    role_level:number;

    role_level_exp:number;

    role_power:number;
}

class RankPlayerInfo
{
    /** 新记录 */
    isNew:boolean = false;
    isDirty:boolean = false;

    type:ERankType;
    role_server_id:number;
    role_id:number;
    role_profession:number;
    role_name:string;
    role_level:number = 0;
    role_level_exp:number;
    role_power:number = 0;


    constructor(type:ERankType)
    {
        this.type = type;

        this.isNew = true;
    }

    public parseDB(obj:any):void
    {
        this.isNew = false;

        Object.assign(this, obj);
    }

    public parsePlayer(player:Player):void
    {
        this.isDirty = true;

        this.role_server_id = player.serverid;
        this.role_id = player.roleid;
        this.role_profession = player.profession;
        this.role_name = player.name;
        this.role_level = player.level;
        this.role_level_exp = player.levelExp;
        this.role_power = player.getCombat();
    }

    public serializeClient()
    {
        return {type:this.type, serverId:this.role_server_id, roleId:this.role_id, profession:this.role_profession, 
                        roleName:this.role_name, roleLevel:this.role_level, levelExp:this.role_level_exp, rolePower:this.role_power};
    }

    public serverialDB()
    {
        return {type:this.type, role_server_id:this.role_server_id, role_id:this.role_id, role_profession:this.role_profession,
                    role_name:this.role_name, role_level:this.role_level, role_level_exp:this.role_level_exp, role_power:this.role_power};
    }

    public saveDB()
    {
        return new Promise<number>((resolve)=>
        {
            if (this.isDirty)
            {
                this.isDirty = false;
    
                let sql:string;
                if (this.isNew)
                {
                    this.isNew = false;
                    sql = DBUtil.createInsert("cy_rank1", this.serverialDB());
                }
                else
                {
                    sql = DBUtil.createUpdate("cy_rank1", this.serverialDB(), {type:this.type, role_id:this.role_id});
                }
                DBForm.instance.asyncQuery(sql).then((data)=>
                {
                    if (data.err)
                    {
                        resolve(ErrorConst.FAILED);
                        return;
                    }

                    resolve(ErrorConst.SUCCEED);
                });
            }
            else
            {
                resolve(ErrorConst.SUCCEED);
            }
        });
    }

    // public serializePowerClient()
    // {
    //     return {id:this.role_id, name:this.role_name, power:this.role_power};
    // }
}

export default class RankMgr
{
    public static readonly instance = new RankMgr();

    private static MAX_LENGTH:number = 100;

    //--------------------------------------------------------------------------
    private powerMap:{[role_id:number]:RankPlayerInfo};
    private powerList:RankPlayerInfo[];

    private levelMap:{[role_id:number]:RankPlayerInfo};
    private levelList:RankPlayerInfo[];

    private mobaiZhanshi:RankPlayerInfo;
    private mobaiFashi:RankPlayerInfo;
    private mobaiDaoshi:RankPlayerInfo;

    constructor()
    {
        this.powerList = [];
        this.powerMap = {};

        this.levelList = [];
        this.levelMap = {};

        this.mobaiZhanshi = new RankPlayerInfo(ERankType.MOBAI);
        this.mobaiFashi = new RankPlayerInfo(ERankType.MOBAI);
        this.mobaiDaoshi = new RankPlayerInfo(ERankType.MOBAI);
    }

    private delRecord(id:number):void
    {
        let delSql = DBUtil.createDelete('cy_rank1', {id:id});
        DBForm.instance.query(delSql)
    }

    public readDB():void
    {
        let sql = `select * from cy_rank1 where role_server_id=${GameUtil.serverId}`;
        DBForm.instance.asyncQuery(sql).then((data)=>
        {
            if (data.err)
            {
                Logger.error("数据库错误：排行榜读取失败");
                return;
            }

            this.powerList = [];
            this.powerMap = {};
    
            this.levelList = [];
            this.levelMap = {};

            let records:RankRecord[] = data.data;
            for (let record of records)
            {
                if (record.type === ERankType.LEVEL)
                {
                    if (this.levelList.length < RankMgr.MAX_LENGTH)
                    {
                        if (this.levelMap[record.role_id])
                        {
                            this.delRecord(record.id);
                        }
                        else
                        {
                            let info = new RankPlayerInfo(ERankType.LEVEL);
                            info.parseDB(record);

                            this.levelList.push(info);
                            this.levelMap[info.role_id] = info;  
                        }
                    }
                    else
                    {
                        this.delRecord(record.id);
                    }
                }
                else if (record.type === ERankType.POWER)
                {
                    if (this.powerList.length < RankMgr.MAX_LENGTH)
                    {
                        if (this.powerMap[record.role_id])
                        {
                            this.delRecord(record.id);
                        }
                        else
                        {
                            let info = new RankPlayerInfo(ERankType.POWER);
                            info.parseDB(record);
                            this.powerList.push(info);
                            this.powerMap[info.role_id] = info;
                        }
                    }
                    else
                    {
                        this.delRecord(record.id);
                    }
                }
                else if (record.type === ERankType.MOBAI)
                {
                    if (record.role_profession === EProfessionType.ZHANSHI)
                    {
                        this.mobaiZhanshi.parseDB(record);
                    }
                    else if (record.role_profession === EProfessionType.FASHI)
                    {
                        this.mobaiFashi.parseDB(record);
                    }
                    else if (record.role_profession === EProfessionType.DAOSHI)
                    {
                        this.mobaiDaoshi.parseDB(record);
                    }
                }
            }
        });

        let minNum:number = 0;
        EventTool.on(GameEvent.ENTER_FRAME_MIN, ()=>
        {
            if (minNum++ > 11)
            {
                minNum = 0;

                this.saveDB();
            }
        });
    }

    public checkMobaiNotice(player:Player):void
    {
        if (this.mobaiDaoshi.role_id === player.roleid || this.mobaiFashi.role_id === player.roleid || this.mobaiZhanshi.role_id === player.roleid)
        {
            let professioncfg = ProfessionConfig.instance.getProfessionCfgById(player.profession);

            let msg:string = LanguageConfig.instance.getFormatDesc(1001, professioncfg.name, player.name);//`天下第一${professioncfg.name}：${player.name}已上线，大家有怨报怨有仇报仇`;
            PlayerMgr.shared.broadcast(CmdID.s2c_sys_notice, {type:ESystemNoticeType.PAO_MA_DENG, msg});
        }
    }

    public updatePower(player:Player):void
    {
        if (this.powerMap[player.roleid])
        {
            this.powerMap[player.roleid].parsePlayer(player);
        }
        else
        {
            if (this.powerList.length >= RankMgr.MAX_LENGTH)
            {
                let lastInfo = this.powerList[this.powerList.length - 1];
    
                if (player.getCombat() > lastInfo.role_power)
                {
                    this.updateRankInfo(lastInfo, this.powerMap, player);
                }
            }
            else
            {
                this.createRankInfo(ERankType.POWER, this.powerList, this.powerMap, player);
            }
        }
    }

    public updateLevel(player:Player):void
    {
        if (this.levelMap[player.roleid])
        {
            this.levelMap[player.roleid].parsePlayer(player);
        }
        else
        {
            if (this.levelList.length >= RankMgr.MAX_LENGTH)
            {
                let lastInfo = this.levelList[this.levelList.length - 1];
    
                if (player.level > lastInfo.role_level || (player.level === lastInfo.role_level && player.levelExp > lastInfo.role_level_exp))
                {
                    this.updateRankInfo(lastInfo, this.levelMap, player);
                }
            }
            else
            {
                this.createRankInfo(ERankType.LEVEL, this.levelList, this.levelMap, player);
            }
        }
    }

    private updateRankInfo(info:RankPlayerInfo, map:{[roleId:number]:RankPlayerInfo}, player:Player):void
    {
        delete map[info.role_id];
        info.parsePlayer(player);
        map[info.role_id] = info;

        this.sort(info.type);
    }

    private createRankInfo(type:ERankType, list:RankPlayerInfo[], map:{[roleId:number]:RankPlayerInfo}, player:Player):void
    {
        let info = new RankPlayerInfo(type);

        info.parsePlayer(player);

        list.push(info);
        map[info.role_id] = info;
    }

    //---------------------------------------------------------------------------
    private sort(type:ERankType):void
    {
        if (type === ERankType.LEVEL)
        {
            this.sortLevel();
        }
        else if (type === ERankType.POWER)
        {
            this.sortPower();
        }
    }

    private sortLevel():void
    {
        this.levelList.sort((a, b)=>
        {
            if (b.role_level === a.role_level)
            {
                return b.role_level_exp - a.role_level_exp;
            } 
            return b.role_level - a.role_level;
        });
    }
    
    private sortPower():void
    {
        this.powerList.sort((a, b)=>{
            return b.role_power - a.role_power;
        });
    }
    //---------------------------------------------------------------------------
    public get toClientLevel()
    {
        return this.levelList.map((info)=>{
            return info.serializeClient();
        });
    }

    public get toClientPower()
    {
        return this.powerList.map((info)=>{
            return info.serializeClient();
        });
    }
    //---------------------------------------------------------------------------
    public shenQinMobai(player:Player):void
    {
        let tmpInfo:RankPlayerInfo;
        if (player.profession === EProfessionType.ZHANSHI)
        {
            tmpInfo = this.mobaiZhanshi;
        }
        else if (player.profession === EProfessionType.DAOSHI)
        {
            tmpInfo = this.mobaiDaoshi;
        }
        else if (player.profession === EProfessionType.FASHI)
        {
            tmpInfo = this.mobaiFashi;
        }

        if (player.getCombat() > tmpInfo.role_power)
        {
            tmpInfo.parsePlayer(player);

            player.send(CmdID.s2c_rank_shenqing_mobai, {code:ErrorConst.SUCCEED});
            PlayerMgr.shared.broadcast(CmdID.s2c_rank_sync_mobai, this.toClientMobai);
        }
        else
        {
            if (player.roleid !== tmpInfo.role_id)
            {
                player.send(CmdID.s2c_rank_shenqing_mobai, {code:ErrorConst.RANK_MOBAI_SHENQING_FAILED});
            }
        }
    }

    public get toClientMobai()
    {
        return {zhanshi:this.mobaiZhanshi.serializeClient(), fashi:this.mobaiFashi.serializeClient(), daoshi:this.mobaiDaoshi.serializeClient()};
    }
    //---------------------------------------------------------------------------

    public saveDB()
    {
        let plist:Promise<any>[] = [];

        plist.push(this.mobaiFashi.saveDB());
        plist.push(this.mobaiDaoshi.saveDB());
        plist.push(this.mobaiZhanshi.saveDB());

        if (this.levelList)
        {
            for (let info of this.levelList)
            {
                plist.push(info.saveDB());
            }
        }

        if (this.powerList)
        {
            for (let info of this.powerList)
            {
                plist.push(info.saveDB());
            }
        }

        return Promise.allSettled(plist);
    }
}