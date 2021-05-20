import TokenData from "../data/TokenData";

export default class GameTokenMgr
{

    public static readonly instance:GameTokenMgr = new GameTokenMgr();

    //--------------------------------------------------------------------------------------------

    private tokenMap:{[accountid:string]:TokenData};

    constructor()
    {
        this.tokenMap = {};
    }

    public addToken(accountid:string, token:string):void
    {
        let tokenData = new TokenData(accountid, token);

        this.tokenMap[accountid] = tokenData;
    }

    public hasAccountId(accountid:string):boolean
    {
        return !!this.tokenMap[accountid];
    }

    public deleteAccountId(accountid:string):void
    {
        delete this.tokenMap[accountid];
    }

    public get accountDataList():TokenData[]
    {
        return Object.values(this.tokenMap);
    }

    /**　服务器登录的用户ID列表 */
    public get accountIdList():string[]
    {
        let result:string[] = [];
        Object.values(this.tokenMap).forEach((v)=>
        {
            result.push(v.accountid);
        });
        return result;
    }
}