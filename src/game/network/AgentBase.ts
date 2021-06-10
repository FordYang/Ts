import DataUtil from "../gear/DataUtil";
import Logger from "../gear/Logger";
import Packet from "./Packet";
import SocketLog from "./SocketLog";
import ws from "ws";
import CmdID from "./CmdID";
import CyObject from "../core/CyObject";

export default class AgentBase extends CyObject
{
    id: number;
    socket: ws;
    packet: Packet;

    protected execFun:(cmdstr:string, bodyData:any)=>void;

    private receiveSt:number = 0;
    private receiveCount:number = 0;

    constructor(socket: ws) 
    {
        super();

        this.id = -1;
        this.socket = socket;
        this.packet = new Packet();
    }

    init() 
    {
        this.execFun = this.execLogin;

        this.socket.onclose = (event: ws.CloseEvent) => 
        {
            // Logger.error('socket close');
            this.destroy();
        }

        this.socket.onopen = (event: ws.OpenEvent) => 
        {
            this.onOpen(event);
        }

        this.socket.onerror = (event: ws.ErrorEvent) => 
        {
            // Logger.error('socket error');
            this.destroy();
        }

        // 接受消息
        this.socket.onmessage = (event: ws.MessageEvent) => 
        {
            let bytes = event.data as Buffer;

            if (bytes.byteLength >= 2)
            {
                let cmdId = bytes.readUInt16LE();
                let cmdstr = CmdID.getCmdStr(cmdId);
                
                if (cmdstr)
                {
                    let bodyData:any;
                    try
                    {
                        bodyData = this.packet.decodeBuffer(cmdstr, bytes.subarray(2));
                    }
                    catch(err)
                    {
                        Logger.error(`协议解析错误:${err}`);
                        
                        this.destroy();
                        return;
                    }
        
                    DataUtil.longToNumber(bodyData);
                    SocketLog.receive(bytes.byteLength, cmdstr, bodyData);
                    this.execFun(cmdstr, bodyData);
                }

                this.receiveCount++;
                if (Date.now() - this.receiveSt > 10000)
                {
                    if (this.receiveCount > 100)
                    {
                        Logger.error(`Socket:10秒内发送过多:${this.receiveCount}`);
                        
                        this.destroy();
                    }
                    else
                    {
                        this.receiveSt = Date.now();
                        this.receiveCount = 0;
                    }
                }
            }
        }
    }

    protected execLogin(cmdstr:string, bodyData:any):void
    {

    }

    protected execLogic(cmdstr:string, bodyData:any):void
    {

    }

    protected onOpen(evt:ws.OpenEvent):void
    {

    }

    send(cmdId: string, obj?: any)
    {
        if (this.socket == null || this.socket.readyState != 1) 
        {
            return;
        }

        let bytes = this.packet.encodePack(cmdId, obj);

        if (bytes)
        {
            SocketLog.send(bytes.byteLength, cmdId, obj);
    
            this.socket.send(bytes, {binary:true});
        }
    }

    close() 
    {
        if (this.socket) 
        {
            this.socket.removeAllListeners();
            this.socket.close();
        }
        this.socket = null;

        // Logger.error("close socket");
    }

    //---------------------------------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        this.execFun = null;

        this.close();

        super.onDestroy();
    }
}