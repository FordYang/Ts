import EventEmitter from "events";

export class TE extends EventEmitter
{
    private static a = 100;

    private a:number = 100;

    public getA():string
    {
        return `A ${TE.a} ${this.a} ${100}`;
    }
}