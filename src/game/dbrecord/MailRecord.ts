import { EMailState } from "../consts/ERole";
import { StringUtil } from "../gear/StringUtil";

/**
 * 邮件数据
 */
export default class MailRecord 
{
    public static createNewMail(toRoleId:number, serverId:number, fromRoleId:number, fromRoleNick:string, title:string, content:string, rewards:string):MailRecord
    {
        let newMail = new MailRecord();
        // newMail.mailId = GameUtil.nextId();
        newMail.toRoleId = toRoleId;
        newMail.serverId = serverId;
        newMail.state = EMailState.NEW;
        newMail.fromRoleId = fromRoleId;

        newMail.fromRoleName = fromRoleNick;

        newMail.title = StringUtil.byteSlice(title, 32);
        newMail.content = StringUtil.byteSlice(content, 512);
        newMail.rewards = rewards;
        newMail.date = new Date();
        return newMail;
    }

    public static parseDB(row: any):MailRecord 
    {
        let mailData = new MailRecord();
        mailData.mailId = row.mailId;
        mailData.toRoleId = row.toRoleId;
        mailData.serverId = row.serverId;
        mailData.fromRoleId = row.fromRoleId;
        mailData.fromRoleName = row.fromRoleName;
        mailData.title = row.title;
        mailData.content = row.content;
        mailData.rewards = row.rewards;
        mailData.date = new Date(row.date);
        mailData.state = row.state;
        return mailData;
    }
    //---------------------------------------------------------------------------------------

    // // 邮件索引
    mailId: number = 0;
    /** 收件人ID */
    toRoleId:number;
    // 服务器索引 
    serverId: number = 0;
    // 发件人角色编码
    fromRoleId: number = 0;
    /** 发件人角色昵称 */
    fromRoleName:string;
    // 邮件标题
    title: string;
    // 邮件内容
    content: string;
    // 附件最多5个
    rewards: string;
    // // 邮件日期
    date: Date;
    // 邮件状态
    state: EMailState;

    public serializeDB()
    {
        return {
                    toRoleId:this.toRoleId, serverId:this.serverId, fromRoleId:this.fromRoleId, 
                    fromRoleName:this.fromRoleName, title:this.title, content:this.content, rewards:this.rewards,
                    date:this.date, state:this.state
                };
    }

    public serializeClient()
    {
        return {
                    mailId:this.mailId, toRoleId:this.toRoleId, serverId:this.serverId, fromRoleId:this.fromRoleId, 
                    fromRoleName:this.fromRoleName, title:this.title, content:this.content, rewards:this.rewards,
                    date:this.date.getTime() / 1000, state:this.state
                };
    }
}