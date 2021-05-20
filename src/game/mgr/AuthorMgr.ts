import Md5Sign from "../gate/Sign";
import DB from "../utils/DB";
import Http from "../utils/Http";

export default class AuthorMgr {
    public static readonly instance = new AuthorMgr();
    //--------------------------------------------------------------------------------------------
    private authorList: number[] = [];
    private authorIdList: number[] = []
    constructor() {
        this.authorList = [];
        this.authorIdList = [];
    }

    public launch() {
        this.authorList = [];
        this.authorIdList = [];
        DB.getAuthorList().then((data) => {
            if (data && data.rows) {
                let rows = data.rows;
                for (let i of rows) {
                    this.authorList.push(i.account);
                }
            }
        });
    }

    /**是否在列表内 */
    public checkList(account: number) {
        return this.authorList.indexOf(account) == -1 ? true : false;
    }

    /**检查账号 */
    public checkPlayer(account: number, callFunc: any) {
        if (!this.tempAuthorId(account)) {
            if (callFunc)
                return callFunc(false);
            return;
        }
        let sql = `select create_date from cy_account where account = ${account};`
        DB.query(sql, (error, rows) => {
            if (error) {
                console.log("查询数据库错误！");
            }
            if (rows && rows.length > 0) {
                let isauthor = rows[0].iaauthor;
                let play_time = Date.now() - new Date(rows[0].create_date).getTime();
                if (!isauthor && play_time >= 3600000) {//3600000
                    if (callFunc) return callFunc(true);
                }
                if (callFunc) return callFunc(false);
            }
            console.log("查询数据库不到用户！");
        });
    }

    /**传输认证 */
    public playerAuthor(parmas: any, account: number) {
        /**加入缓存 */
        this.addAuthorID(account);

        Md5Sign.onSignMd5(parmas);

        let sql = `update cy_account SET realname = '${parmas['name']}', realid = '${parmas['id_number']}' where account = ${account};`;
        DB.query(sql);

        // console.log("playerAuthor onSignMd5", JSON.stringify(parmas));
        Http.sendPost("sdk.jingyougz.com", '/api/v2/fcm/open_commit', parmas, (data: any) => {
            // console.log("playerAuthor data", JSON.stringify(data));
            if (data.code != 0) {
                // PlayerMgr.shared.authorPlayerFailed(account);
            }
        });
    }

    /**缓存tempID */
    private tempAuthorId(account: number) {
        return this.authorIdList.indexOf(account) == -1 ? true : false;
    }

    /**账号 */
    public addAuthorID(account: number) {
        this.authorIdList.push(account);
    }

    /**移除缓存 */
    public delAuthorID(account: number) {
        let index = this.authorIdList.indexOf(account);
        if (index != -1) this.authorIdList.splice(index, 1);
    }

    /**增加已经实名的人 */
    public addAuthor(account: number) {
        let index = this.authorList.indexOf(account);
        if (index == -1)
            this.authorList.push(account);
    }

    /**火球角色加密 */
    public getUserAge(id: string) {
        var yearBirth: number = Number(id.substring(6, 10));
        var monthBirth: number = Number(id.substring(10, 12));
        var dayBirth: number = Number(id.substring(12, 14));
        //获取当前年月日并计算年龄
        var myDate = new Date();
        var monthNow: number = myDate.getMonth() + 1;
        var dayNow = myDate.getDay();
        var age = myDate.getFullYear() - yearBirth;
        if (monthNow < monthBirth || (monthNow == monthBirth && dayNow < dayBirth)) {
            age--;
        }
        //返回性别和年龄
        // console.log("当前年龄为：", age);
        return age;
    }
}