import CmdID from "./CmdID";

export default class SocketLog 
{
    public static readonly DEBUG: boolean = false;

    public static log(...data: any[]): void 
    {
        if (SocketLog.DEBUG) 
        {
            console.log(...data);
        }
    }

    public static send(len: number, cmd: string, obj?: any): void 
    {
        if (SocketLog.DEBUG) 
        {
            SocketLog.log(`%c>>>>>${new Date().toTimeString()} ${len.toString().padStart(3, "0")}[${cmd}][${CmdID.getDesc(cmd)}]${obj ? obj ? `：${JSON.stringify(obj)}` : "" : ""}`, 'color: green;');
        }
    }

    public static receive(len: number, cmd: string, obj?: any): void {
        if (SocketLog.DEBUG) {
            SocketLog.log(`%c<<<<<${new Date().toTimeString()} ${len.toString().padStart(3, "0")}[${cmd}][${CmdID.getDesc(cmd)}]${obj ? obj ? `：${JSON.stringify(obj)}` : "" : ""}`, 'color: red;');
        }
    }
}