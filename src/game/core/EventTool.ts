import EventEmitter from "events";

export default class EventTool
{
    private static _instance:EventEmitter = new EventEmitter();

    public static on(event: string | symbol, listener: (...args: any[]) => void):void
    {
        EventTool._instance.on(event, listener);

        // console.log("on-------------------------------------------------->", event, EventTool._instance.getMaxListeners(), EventTool._instance.listenerCount(event));
    }

    public static off(event: string | symbol, listener: (...args: any[]) => void):void
    {
        EventTool._instance.off(event, listener);

        // console.log("off-------------------------------------------------->", event, EventTool._instance.getMaxListeners(), EventTool._instance.listenerCount(event));
    }

    public static once(event: string | symbol, listener: (...args: any[]) => void):void
    {
        EventTool._instance.once(event, listener);
    }

    public static emit(event: string | symbol, ...args: any[]):void
    {
        EventTool._instance.emit(event, ...args);
    }
}