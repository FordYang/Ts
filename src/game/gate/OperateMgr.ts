import GTimer from "../common/GTimer";
import { ErrorConst } from "../consts/ErrorConst";
import GateDB from "./GateDB";
import ServerMgr from "./ServerMgr";

/**运营管理 */
export default class OperateMgr {
    public static readonly instance = new OperateMgr();

    /**支付的数据 */
    private payRows: any[] = [];
    private payTotalRows: any[] = [];
    /**时间段 */
    private timePeriod: number = 24;
    /**获取今日汇总 */
    public getSummaryOnDay() {
        /**今日汇总 */
        GateDB.searchServerPay().then((data) => {
            let __data: any = {};
            if (data.code == ErrorConst.SUCCEED) {
                this.payRows = [];
                this.payTotalRows = [];
                if (data.rows && data.rows.length > 0) {
                    data.rows.forEach((payInfo: any) => {
                        if (payInfo && payInfo.create_date) {
                            if (this.checkPayOnDay(payInfo.create_date)) {
                                this.payRows.push(payInfo);
                            }
                            this.payTotalRows.push(payInfo);
                        }
                    });

                    for (let time = 0; time < this.timePeriod; time++) {
                        __data.code = ErrorConst.SUCCEED;
                        __data.totalRecharge = this.totalRecharge;
                        __data.totalRechangePlayerNum = this.totalRechangePlayerNum;
                        __data.newAccount = this.newAccount_onDay;
                        __data.totalAccount = this.totalAccount_onDay;
                        __data.onlinePlayerNum = this.onlinePlayerNum;
                    }
                }
            } else {
                __data.code = data.code;
            }
            return __data;
        });
    }

    /**校验充值日期 */
    private checkPayOnDay(date: Date) {
        let day1 = GTimer.getYearDay(new Date(date));
        let day2 = GTimer.getYearDay(new Date());
        return day1 == day2;
    }

    /**校验充值时间段 */
    private checkPayOnHours(date: Date,) {
        // let hour = new Date(date);
        let day1 = GTimer.getTimeHour(date);

        // let day2 = GTimer.getCurTime(new Date());
        // return day1 == day2;
        return day1;
    }

    /**充值金额 - 单日统计充值金额
     * @param period 时间段 24小时
     */
    private totalRecharge(period: number) {
        let money = 0;
        // if (this.payRows && this.payRows.length > 0) {
        //     this.payRows.forEach((payInfo: any) => {
        //         if (payInfo && payInfo.money) {
        //             if (period == this.checkPayOnHours(payInfo.create_date))
        //                 money += payInfo.money;
        //         }
        //     });
        // }
        return money;
    }

    /**充值人数 - 单日统计充值人数*/
    private get totalRechangePlayerNum() {
        let players: number[] = [];
        if (this.payRows && this.payRows.length > 0) {
            this.payRows.forEach((payInfo: any) => {
                if (payInfo && payInfo.role_id && players.indexOf(payInfo.role_id) == -1) {
                    players.push(payInfo.role_id);
                }
            });
        }
        return players.length;
    }

    /**新增充值人数 - 首次充值的计数*/
    private get newRechargePlayerNum() {
        let players: any[] = [];
        let tempRows = this.payTotalRows.slice(0, this.payTotalRows.length - 1);
        if (tempRows && tempRows.length > 0) {
            tempRows.forEach((payInfo: any) => {
                if (payInfo && !this.checkPayOnDay(payInfo.create_date)) {
                    players.push(payInfo);
                }
            });
        }
        return 0;
    }

    /**新增账号 */
    private get newAccount_onDay() {

        return 0;
    }

    /**老帐号 - 今日登录过的*/
    private get totalAccount_onDay() {

        return 0;
    }

    /**在线人数 - 当前服务器在线人数*/
    private get onlinePlayerNum() {
        return ServerMgr.instance.player_num;
    }
    /**----------------------------- */
    /**今日开服数量 */
    private get serverListNum() {

        return 0;
    }

    /**总开服数量 */
    private get totalServerListNum() {

        return 0;
    }

    /**活跃账号 */
    private get activeAccount() {

        return 0;
    }

    /**总账号个数 */
    private get totalAccount() {

        return 0;
    }

    /**付费角色 */
    private get playerPay() {

        return 0;
    }

    /**角色付费金额 */
    private get playerPaySum() {

        return 0;
    }

    /**付费率 */
    private get playerPayRatio() {

        return 0;
    }

    /**时间段内付费用户带来的收入 arppu=收益/付费用户*/
    private get totalARPPU() {

        return 0;
    }

    /**时间段内活跃用户带来的收入 arpu=收益/活跃用户*/
    private get totalARPU() {

        return 0;
    }

    /**新付费角色 ?*/
    private get newPayPlayerNum() {

        return 0;
    }

    /**新付费金额 ?*/
    private get newPaySumMoney() {

        return 0
    }

    /**新付费率 ?*/
    private get newPayRatio() {

        return 0;
    }

    /**新的 ARPPU */
    private get newARPPU() {

        return 0;
    }

    /**老付费角色 */
    private get oldPayPlayerNum() {

        return 0;
    }

    /**老付费金额 */
    private get oldPaySumMoney() {

        return 0;
    }

    /**老付费率 */
    private get oldPayRatio() {

        return 0;
    }

    /**老的 ARPPU */
    private get oldARPPU() {

        return 0;
    }

    /**首付角色 */
    private get newPayPlayer() {

        return 0;
    }

    /**首付金额 */
    private get newPayMoney() {

        return 0;
    }

    /**次留 */
    private get totalCL() {

        return 0;
    }

    /**7日留存 */
    private get totalSevenLC() {

        return 0;
    }

    /**生命周期总价值 LTV1 */
    private get totalLTV1() {

        return 0
    }

    /**生命周期总价值 LTV7 */
    private get totalLTV7() {

        return 0;
    }

    /**----------------------------- */
}