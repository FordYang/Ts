import { ErrorConst } from "../consts/ErrorConst";
import DataUtil from "../gear/DataUtil";
import DB from "../utils/DB";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import MailRecord from "../dbrecord/MailRecord";
import Logger from "../gear/Logger";

/**
 * 邮件管理器
 */
export default class MailMgr 
{
    public static readonly instance: MailMgr = new MailMgr();

    //--------------------------------------------------------------------------------------------

    public checkNew(toRoleId:number):void
    {
        let playerList = PlayerMgr.shared.playerL;

        for (let player of playerList)
        {
            if (player.online && (!toRoleId || player.roleid === toRoleId))
            {
                player.mailEntity.checkNew();
            }
        }
    }

    public sendSysMail(toRoleId:number, title:string, content:string, rewards:{itemId:number, count:number, quality:number}[]):void
    {
        DB.getRoleBaseInfoByRoleId(toRoleId, (error: any, rows:{role_id:number, server_id:number, role_name:string}[]) => 
        {
            if (error)
            {
                return;
            }

            if (rows.length > 0)
            {
                let {role_id, server_id} = rows[0];

                let mailData = MailRecord.createNewMail(toRoleId, server_id, 0, "系统", title, content, DataUtil.toJson(rewards));
                DB.insertMail(mailData).then((data)=>
                {
                    if (data.code === ErrorConst.SUCCEED)
                    {
                        let player = PlayerMgr.shared.getPlayerByRoleId(role_id);
                        if (player)
                        {
                            player.mailEntity.checkNew();
                            // mailData.mailId = data.data.insertId;
                            // player.mailEntity.addNewMail([mailData]);
                        }
                    }
                    else
                    {
                        Logger.log("发送邮件失败: ", toRoleId, title, content);
                    }
                });
            }
            else
            {
                Logger.log("发送邮件失败: 用户ID不存在", toRoleId, title, content);
            }
        });
    }
}