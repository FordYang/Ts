import GameConf from "../../conf/GameConf";
import GameEvent from "../consts/GameEvent";
import EventTool from "../core/EventTool";
import GameUtil from "../core/GameUtil";
import DataUtil from "../gear/DataUtil";
import DateUtil from "../gear/DateUtil";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import CmdID from "../network/CmdID";
import GlobalEnvMgr from "./GlobalEvnMgr";

/**　每日更新 */
export default class EveryDayMgr 
{
    public static start(day:number): void 
    {
        let tmpDay = day;
        EventTool.on(GameEvent.ENTER_FRAME_SEC, () => 
        {
            if (tmpDay !== DateUtil.nowDay) 
            {
                GameConf.everyDay = tmpDay = DateUtil.nowDay;
                GlobalEnvMgr.saveEveryDayDB();

                EventTool.emit(GameEvent.EVERY_DAY_RESET);

                PlayerMgr.shared.resetDay();
            }
        });
    }

    //--------------------------------------------------------------------------------------
}