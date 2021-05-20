import GameConf from "../../conf/GameConf";
import { EGlobalEnv } from "../consts/EGlobalEnv";
import { ErrorConst } from "../consts/ErrorConst";
import GameUtil from "../core/GameUtil";
import DBUtil from "../gear/DBUtil";
import Logger from "../gear/Logger";
import DBForm from "../utils/DBForm";
import EveryDayMgr from "./EveryDayMgr";

export default class GlobalEnvMgr
{
    public static start():Promise<ErrorConst>
    {
        return new Promise((resolve)=>
        {
            let sql = `select gkey, int_value, string_value from cy_global where server_id=?`;
            DBForm.instance.asyncQuery(sql, [GameUtil.serverId]).then((data)=>
            {
                if (data.err)
                {
                    Logger.error("数据库错误：全局配置读取失败");

                    resolve(ErrorConst.FAILED);
                    return;
                }

                let rows:{gkey:number, int_value:number, string_value:string}[] = data.data;
                if (Array.isArray(rows))
                {
                    let keyMap:{[key:string]:{int_value:number, string_value:string}} = {};
                    for (let row of rows)
                    {
                        keyMap[row.gkey] = row;
                    }
    
                    GameConf.everyDay = keyMap[EGlobalEnv.EVERY_DAY]?.int_value ?? 0;
                }
    
                /**每日刷新模块 */
                EveryDayMgr.start(GameConf.everyDay);
                
                resolve(ErrorConst.SUCCEED);
            });
        });
    }

    public static saveDB():void
    {
        this.saveEveryDayDB();
    }

    /**  保存每日刷新时间 */
    public static saveEveryDayDB():void
    {
        let sql = DBUtil.createUpdate("cy_global", {int_value:GameConf.everyDay}, {server_id:GameUtil.serverId, gkey:EGlobalEnv.EVERY_DAY});
        DBForm.instance.asyncQuery(sql);
    }
}