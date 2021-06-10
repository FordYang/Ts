export default class TokenData {
    public static FAILURE_TIME: number = 5 * 60 * 1000;

    public accountid: string;

    public token: string;

    private st: number;

    constructor(accountid: string, token: string) 
    {
        this.accountid = accountid;
        this.token = token;

        this.st = Date.now();
    }

    public get ct(): number 
    {
        return Date.now() - this.st;
    }

    public reActive(): void 
    {
        this.st = Date.now();
    }

    public verifyFailure(): boolean 
    {
        return Date.now() - this.st > TokenData.FAILURE_TIME;
    }
}