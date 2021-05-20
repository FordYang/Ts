import GameConf from "../../../conf/GameConf";
import { EMailState } from "../../consts/ERole";
import { ErrorConst } from "../../consts/ErrorConst";
import GameUtil from "../../core/GameUtil";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import MailRecord from "../../dbrecord/MailRecord";
import Player from "../playerObj/Player";
import { ItemConfig } from "../../config/ItemConfig";
import { EItemType } from "../../consts/EItem";
import Item from "./Item";
import DBUtil from "../../gear/DBUtil";
import CyObject from "../../core/CyObject";

export default class RoleMailEntity extends CyObject
{
    private player:Player;

    private mailList:MailRecord[] = [];
    private mailMap:{[mailId:number]:MailRecord} = {};

    constructor(player:Player)
    {
        super();
        
        this.player = player;

        this.player.on(CmdID.c2s_mail_set_read, this.onSetRead);
        this.player.on(CmdID.c2s_mail_get_reward, this.onGetReward);
        this.player.on(CmdID.c2s_mail_delete, this.onDelete);
    }

    private onDelete = (bodyObj:{mailId:number})=>
    {
        let mailData = this.mailMap[bodyObj?.mailId];
        if (mailData)
        {
            let tmpRewards = DataUtil.jsonBy(mailData.rewards);
            if (tmpRewards && tmpRewards.length > 0 && mailData.state !== EMailState.GET)
            {
                this.player.send(CmdID.s2c_mail_delete, {code:ErrorConst.NOT_GET, mailId:bodyObj.mailId});
            }
            else
            {
                let idx = this.mailList.indexOf(mailData);
                if (idx != -1)
                {
                    this.mailList.splice(idx, 1);
                }
                delete this.mailMap[bodyObj.mailId];

                // DB.deleteMail(bodyObj.mailId);
                DB.updateFiexd('cy_mail', ['state'], {mailId:bodyObj.mailId}, [EMailState.DEL])

                this.player.send(CmdID.s2c_mail_delete, {code:ErrorConst.SUCCEED, mailId:bodyObj.mailId});
            }
        }
        else
        {
            this.player.send(CmdID.s2c_mail_delete, {code:ErrorConst.REWARD_NOT_EXIST, mailId:bodyObj.mailId});
        }
    }

    private onSetRead = (bodyObj:{mailId:number})=>
    {
        let mailData = this.mailMap[bodyObj?.mailId];
        if (mailData && mailData.state == EMailState.NEW)
        {
            mailData.state = EMailState.READ;
            DB.setMailFlag(bodyObj.mailId, EMailState.READ);
        }
    }

    private onGetReward = (bodyObj:{mailId:number})=>
    {
        let mailData = this.mailMap[bodyObj?.mailId];
        if (mailData && mailData.rewards)
        {
            if (mailData.state != EMailState.GET)
            {
                let isGetSucceed:boolean = false;
                let rewardObjL = DataUtil.jsonBy(mailData.rewards);
                if (rewardObjL)
                {
                    isGetSucceed = this.player.addItemList(rewardObjL, false, "邮件发放");
                }

                if (isGetSucceed)
                {
                    mailData.state = EMailState.GET;
                    DB.setMailFlag(bodyObj.mailId, EMailState.GET, (code)=>
                    {
                        if (code == ErrorConst.SUCCEED)
                        {
                            this.player.send(CmdID.s2c_mail_get_reward, {code:ErrorConst.SUCCEED, mailId:bodyObj.mailId});
                        }
                    });
                }
                else
                {
                    this.player.send(CmdID.s2c_mail_get_reward, {code:ErrorConst.BAG_NOT_ENOUGH, mailId:bodyObj.mailId});
                }
            }
            else
            {
                this.player.send(CmdID.s2c_mail_get_reward, {code:ErrorConst.GOT_THING, mailId:bodyObj.mailId});
            }
        }
        else
        {
            this.player.send(CmdID.s2c_mail_get_reward, {code:ErrorConst.NO_REWARD, mailId:bodyObj.mailId});
        }
    }
    //----------------------------------------------------------------------------------------------------
    
    public readDB():void
    {
        DB.getRoleMail(GameUtil.serverId, this.player.roleid, (err, rows)=>
        {
            if (rows && rows.length > 0)
            {
                for (let record of rows)
                {
                    let mailData = MailRecord.parseDB(record);
                    
                    this.mailMap[mailData.mailId] = mailData;
                    this.mailList.push(mailData);
                }
    
                this.player.send(CmdID.s2c_mail_async_list, this.serializeClient());
            }
        });
    }

    //----------------------------------------------------------------------------------------------------
    public checkNew():void
    {
        DB.getRoleNewMail(GameUtil.serverId, this.player.roleid, (err, rows)=>
        {
            if (err)
            {
                return;
            }

            let newlist:any[] = [];
            for (let row of rows)
            {
                if (!this.mailMap[row.mailId])
                {
                    let record = MailRecord.parseDB(row);
                    newlist.push(record.serializeClient());

                    this.mailMap[record.mailId] = record;
                    this.mailList.push(record);
                }
            }
            
            if (newlist.length > 0)
            {
                this.player.send(CmdID.s2c_mail_async_list, {mailList:newlist});
            }
        });
    }

    public addNewMail(mailDatas:MailRecord[]):void
    {
        let toClientList:any[] = [];

        for (let mailData of mailDatas)
        {
            this.mailMap[mailData.mailId] = mailData;
            this.mailList.push(mailData);
            
            toClientList.push(mailData.serializeClient());
        }

        if (toClientList && toClientList.length > 0)
        {
            this.player.send(CmdID.s2c_mail_async_list, {mailList:toClientList});
        }
    }

    //----------------------------------------------------------------------------------------------------
    public serializeClient()
    {
        let mailList = [];

        for (let mailData of this.mailList)
        {
            mailList.push(mailData.serializeClient());
        }

        return {mailList};

    }
    //---------------------------------------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        this.player.off(CmdID.c2s_mail_set_read, this.onSetRead);
        this.player.off(CmdID.c2s_mail_get_reward, this.onGetReward);
        this.player.off(CmdID.c2s_mail_delete, this.onDelete);

        super.onDestroy();
    }
}