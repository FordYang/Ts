
import protobuf from "protobufjs";
import CmdID from "./CmdID";
import SocketLog from "./SocketLog";
import path from "path";

let root = protobuf.loadSync(__dirname + "../../../conf/proto/c2s.proto");

/**
 * 协议包
 */
export default class Packet 
{
    constructor() 
    {
        
    }

    private setTemplate(cmdstr:string):protobuf.Type 
    {
        return root.lookup(`commander.c2s.${cmdstr}`, [protobuf.Type]) as protobuf.Type;
    }

    public decodeBuffer(cmdstr:string, buffer:Buffer)
    {
        let msg = this.setTemplate(cmdstr);
        
        if (msg)
        {
            return msg.decode(buffer);
        }
        return null;
    }

    encodePack(cmdstr:string, obj:any):Buffer
    {
        let bodyBytes:Uint8Array;
        let bytesLen = 2;
        if (obj)
        {
            let msg = this.setTemplate(cmdstr);
            if (!msg)
            {
                SocketLog.log(`错误：c2s.proto中未找到${cmdstr}结构`);

                return null;
            }
            
            let pack = msg.create(obj);
            bodyBytes = msg.encode(pack).finish();

            bytesLen += bodyBytes.byteLength;
        }

        let cmdId = CmdID.getCmdId(cmdstr);
        let bytes = Buffer.alloc(bytesLen);
        bytes.writeUInt16LE(cmdId);

        bodyBytes && bytes.set(bodyBytes, 2);

        return bytes;
    }
}