import { TE } from "./TE";

export class TEE extends TE
{
    private static b = {b:2000};

    public b:number = 2000;

    public getB()
    {
        TEE.b.b ++;
        this.b ++;

        return `B: ${TEE.b.b} ${this.b} ${2000}`;
    }
}