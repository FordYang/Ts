import GameEvent from "../consts/GameEvent";
import EventTool from "../core/EventTool";
import GameUtil from "../core/GameUtil";
import DBUtil from "../gear/DBUtil";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import DBForm from "../utils/DBForm";

export class OnlineStatMgr
{
    public static start(): void 
    {
        let serverId = GameUtil.serverId;

        let count:number = 0;
        EventTool.on(GameEvent.ENTER_FRAME_MIN, () => 
        {
            count++;
            if (count >= 5)
            {
                count = 0;

                let insertSql = DBUtil.createInsert("cy_online", {serverId, online:PlayerMgr.shared.getPlayerNum(), trust:PlayerMgr.shared.getTrustNum(), date:new Date()});
                DBForm.instance.query(insertSql);
            }
        });
    }
}