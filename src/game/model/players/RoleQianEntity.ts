import QiandaoConfig from "../../config/QiandaoConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import CyObject from "../../core/CyObject";
import DataUtil from "../../gear/DataUtil";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

export default class RoleQianEntity extends CyObject
{
    private player: Player;

    //------------------------------------------------------

    /** 最近周签到日期 */
    public weekDate: string;
    /** 周签到次数 */
    public weekCount: number;
    /** 最近月签到日期 */
    public monthDate: string;
    /** 月签到次数 */
    public monthCount: number;

    //------------------------------------------------------
    constructor(owner: Player) 
    {
        super();
        
        this.player = owner;

        this.player.on(CmdID.c2s_qiandao_week, this.onQianWeek);
        this.player.on(CmdID.c2s_qiandao_month, this.onQianMonth);
    }

    public resetDay():void
    {
        let date = new Date();
        let tmpstr = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        if (this.monthDate !== tmpstr) 
        {
            let qianCfg = QiandaoConfig.instance.getWeekCfg(this.monthCount);
            if (!qianCfg)
            {
                this.monthCount = 0;
    
                this.player.send(CmdID.s2c_qiandao_month_reset);

                DB.updateRoleAttr(this.player.roleid, ["qiandao"], [this.serializeDB()]);
            }
        }
    }

    private onQianWeek = () => 
    {
        let date = new Date();
        let tmpstr = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        if (this.weekDate !== tmpstr) 
        {
            this.weekDate = tmpstr;
            this.weekCount++;

            let qianCfg = QiandaoConfig.instance.getWeekCfg(this.weekCount);
            if (qianCfg) {
                if (qianCfg.item1) {
                    this.player.addItem(qianCfg.item1[0], qianCfg.item1[1], "周签到", false, null, true);
                }
                if (qianCfg.item2) {
                    this.player.addItem(qianCfg.item2[0], qianCfg.item2[1], "周签到", false, null, true);
                }
                if (qianCfg.item3) {
                    this.player.addItem(qianCfg.item3[0], qianCfg.item3[1], "周签到", false, null, true);
                }

                this.player.send(CmdID.s2c_qiandao_week, { code: ErrorConst.SUCCEED, weekDate: tmpstr, weekCount: this.weekCount });
                DB.updateRoleAttr(this.player.roleid, ["qiandao"], [this.serializeDB()]);
            }
            else {
                this.player.send(CmdID.s2c_qiandao_week, { code: ErrorConst.QIANDAO_FAILED });
            }
        }
        else {
            this.player.send(CmdID.s2c_qiandao_week, { code: ErrorConst.QIANDAO_FAILED });
        }
    }

    private onQianMonth = (obj: { multiple: number }) => 
    {
        let date = new Date();
        let tmpstr = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        if (this.monthDate !== tmpstr) 
        {
            this.monthDate = tmpstr;
            this.monthCount++;

            let qianCfg = QiandaoConfig.instance.getMonthCfg(this.monthCount);
            if (qianCfg) 
            {
                if (qianCfg.item) 
                {
                    let multiple = Math.min(2, obj.multiple);
                    this.player.addItem(qianCfg.item[0], qianCfg.item[1] * multiple, "月签到", false, null, true);
                }

                this.player.send(CmdID.s2c_qiandao_month, { code: ErrorConst.SUCCEED, monthDate: tmpstr, monthCount: this.monthCount });
                DB.updateRoleAttr(this.player.roleid, ["qiandao"], [this.serializeDB()]);
            }
            else 
            {
                this.player.send(CmdID.s2c_qiandao_month, { code: ErrorConst.QIANDAO_FAILED });
            }
        }
        else {
            this.player.send(CmdID.s2c_qiandao_month, { code: ErrorConst.QIANDAO_FAILED });
        }
    }

    //----------------------------------------------------------------------------------------------------------------

    public deserializeDB(buystr: string): void 
    {
        let qianObj = DataUtil.jsonBy(buystr);

        this.weekDate = qianObj?.weekDate || "";
        this.weekCount = qianObj?.weekCount || 0;

        this.monthDate = qianObj?.monthDate || "";
        this.monthCount = qianObj?.monthCount || 0;
    }

    public serializeDB(): string 
    {
        let buyObj = { weekDate: this.weekDate, weekCount: this.weekCount, monthDate: this.monthDate, monthCount: this.monthCount };
        return JSON.stringify(buyObj);
    }

    public serializeClient(): string 
    {
        let buyObj = { weekDate: this.weekDate, weekCount: this.weekCount, monthDate: this.monthDate, monthCount: this.monthCount };
        return JSON.stringify(buyObj);
    }

    //----------------------------------------------------------------------------------------------------------------

    protected onDestroy()
    {
        this.player?.on(CmdID.c2s_qiandao_week, this.onQianWeek);
        this.player?.on(CmdID.c2s_qiandao_month, this.onQianMonth);

        super.onDestroy();
    }
}