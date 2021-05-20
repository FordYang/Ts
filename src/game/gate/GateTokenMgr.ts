import * as crypto from "crypto";
import GameConf from "../../conf/GameConf";
import TokenData from "../data/TokenData";

export default class GateTokenMgr {
    static shared = new GateTokenMgr();

    //------------------------------------------------------------------------------------

    private tokenMap: { [accountid: string]: TokenData };
    private secret: string;

    constructor() {
        this.tokenMap = Object.create(null);

        this.secret = GameConf.channel;

        setInterval(() => {
            this.verifyDate();
        }, 60000);
    }

    private verifyDate(): void {
        let tokenList = Object.values(this.tokenMap);
        for (let tokenData of tokenList) {
            if (tokenData.verifyFailure()) {
                delete this.tokenMap[tokenData.accountid];
            }
        }
    }

    /** 校验账号是否登录 */
    public verifyAccount(accountid: string, token: string): boolean {
        let tokenData = this.tokenMap[accountid];
        if (tokenData) {
            return tokenData.token === token;
        }
        return false;
    }

    public makeSecret(accountid: any): string {
        let time = new Date();
        let t1 = accountid + '' + time.getTime() + Math.ceil(Math.random() * 999999);
        let t2 = Math.ceil(Math.random() * 999999) + this.secret;
        let a = crypto.createHash("md5").update(t1).digest("hex");
        let b = crypto.createHash("md5").update(t2).digest("hex");
        let ret = a + b.slice(0, 8);

        let tokenData = new TokenData(accountid, ret);
        this.tokenMap[accountid] = tokenData;

        return ret;
    }

    public reActive(accountIdList: string[]): void 
    {
        if (Array.isArray(accountIdList)) 
        {
            let tokenData: TokenData;
            for (let accountid of accountIdList) 
            {
                tokenData = this.tokenMap[accountid];
                tokenData && tokenData.reActive();
            }
        }
    }

    public getToken(accountid: string): TokenData {
        return this.tokenMap[accountid];
    }
}
