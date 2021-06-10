export class StringUtil 
{
    public static byteSlice(msg: string, len: number): string 
    {
        if (msg)
        {
            let buff = Buffer.from(msg);
            return buff.toString("utf-8", 0, len);
        }
        return msg;
    }

    public static format(msg:string, ...args:any[]):string
    {
        for (let i:number = 0; i < args.length; i++)
        {
            msg = msg.replace('{' + i + '}', args[i]);
        }
        return msg;
    }
}