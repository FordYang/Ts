import Agent from "../network/Agent";
import CmdID from "../network/CmdID";

export const c2s =
{
    /////////////////////////////////////////////////
    [CmdID.c2s_login]: (agent: Agent, data: any) => {
        agent.c2s_login && agent.c2s_login(data);
    },
    [CmdID.c2s_bag_info]: (agent: Agent, data: any) => {
        agent.c2s_bag_info && agent.c2s_bag_info();
    },
    [CmdID.c2s_skills_info]: (agent: Agent, data: any) => {
        agent.c2s_skills_info && agent.c2s_skills_info();
    },
    [CmdID.c2s_change_map]: (agent: Agent, data: any) => {
        agent.c2s_change_map && agent.c2s_change_map(data);
    },
    [CmdID.c2s_open_ui]: (agent: Agent, data: any) => 
    {
        agent.c2s_open_ui && agent.c2s_open_ui(data);
    },
    [CmdID.c2s_bag_expend]: (agent: Agent, data: any) => {
        agent.c2s_bag_expend && agent.c2s_bag_expend(data);
    },
    [CmdID.c2s_loadingmap_success]: (agent: Agent, data: any) => {
        agent.c2s_loadingmap_success && agent.c2s_loadingmap_success();
    },
    [CmdID.c2s_use_bagitem]: (agent: Agent, data: any) => {
        agent.c2s_use_bagitem && agent.c2s_use_bagitem(data);
    },
    [CmdID.c2s_item_decompound]: (agent: Agent, data: any) => {
        agent.c2s_item_decompound && agent.c2s_item_decompound(data);
    },
    [CmdID.c2s_skill_auto]: (agent: Agent, data: any) => {
        agent.c2s_skill_auto && agent.c2s_skill_auto(data);
    },
    [CmdID.c2s_wear_equip]: (agent: Agent, data: any) => {
        agent.c2s_wear_equip && agent.c2s_wear_equip(data);
    },
    [CmdID.c2s_takeoff_equip]: (agent: Agent, data: any) => {
        agent.c2s_takeoff_equip && agent.c2s_takeoff_equip(data);
    },
    [CmdID.c2s_update_setting]: (agent: Agent, data: any) => {
        agent.c2s_update_setting && agent.c2s_update_setting(data);
    },
    [CmdID.c2s_part_intensify]: (agent: Agent, data: any) => {
        agent.c2s_part_intensify && agent.c2s_part_intensify(data);
    },
    [CmdID.c2s_equips_reclaim]: (agent: Agent, data: any) => {
        agent.c2s_equips_reclaim && agent.c2s_equips_reclaim(data);
    },
    [CmdID.c2s_blacksmith]: (agent: Agent, data: any) => {
        agent.c2s_blacksmith && agent.c2s_blacksmith();
    },
    [CmdID.c2s_blacksmith_req]: (agent: Agent, data: any) => {
        agent.c2s_blacksmith_req && agent.c2s_blacksmith_req(data);
    },
    [CmdID.c2s_refresh_blacksmith]: (agent: Agent, data: any) => {
        agent.c2s_refresh_blacksmith && agent.c2s_refresh_blacksmith(data);
    },
    [CmdID.c2s_sync_mapunlock]: (agent: Agent, data: any) => {
        agent.c2s_sync_mapunlock && agent.c2s_sync_mapunlock(data);
    },
    [CmdID.c2s_sync_guidestage]: (agent: Agent, data: any) => {
        agent.c2s_sync_guidestage && agent.c2s_sync_guidestage(data);
    },
    [CmdID.c2s_skill_upgrade]: (agent: Agent, data: any) => {
        agent.c2s_skill_upgrade && agent.c2s_skill_upgrade(data);
    },
    [CmdID.c2s_yyshop]: (agent: Agent, data: any) => {
        agent.c2s_yyshop && agent.c2s_yyshop();
    },
    [CmdID.c2s_refresh_yyshop]: (agent: Agent, data: any) => {
        agent.c2s_refresh_yyshop && agent.c2s_refresh_yyshop();
    },
    [CmdID.c2s_delay_yyshop]: (agent: Agent, data: any) => {
        agent.c2s_delay_yyshop && agent.c2s_delay_yyshop();
    },
    [CmdID.c2s_equip_replace]: (agent: Agent, data: any) => {
        agent.c2s_equip_replace && agent.c2s_equip_replace(data);
    },
    [CmdID.c2s_equip_remake]: (agent: Agent, data: any) => {
        agent.c2s_equip_remake && agent.c2s_equip_remake(data);
    },
    [CmdID.c2s_equip_remake_save]: (agent: Agent, data: any) => {
        agent.c2s_equip_remake_save && agent.c2s_equip_remake_save(data);
    },
    /**献祭 */
    [CmdID.c2s_equip_xianji]: (agent: Agent, data: any) => {
        agent.c2s_equip_xianji && agent.c2s_equip_xianji(data);
    },
    [CmdID.c2s_equip_xianji_refresh]: (agent: Agent, data: any) => {
        // agent.c2s_equip_xianji_refresh && agent.c2s_equip_xianji_refresh(data);
    },
    [CmdID.c2s_equip_xianji_save]: (agent: Agent, data: any) => {
        agent.c2s_equip_xianji_save && agent.c2s_equip_xianji_save(data);
    },
    
    
    [CmdID.c2s_role_tujian_upgrade]: (agent: Agent, data: any) => {
        agent?.c2s_tujian_upgrade(data);
    },
    [CmdID.c2s_role_jingmai_upgrade]: (agent: Agent, data: any) => {
        agent?.c2s_jingmai_upgrade(data);
    },
    [CmdID.c2s_exchange_money]: (agent: Agent, data: any) => {
        agent?.c2s_exchange_money(data);
    },
    [CmdID.c2s_offline_awards]: (agent: Agent, data: any) => {
        agent?.c2s_offline_awards(data);
    },
    [CmdID.c2s_prerogative_receive]: (agent: Agent, data: any) => {
        agent?.c2s_prerogative_receive(data);
    },
    [CmdID.c2s_lock_equip]: (agent: Agent, data: any) => {
        agent?.c2s_lock_equip(data);
    },
    [CmdID.c2s_item_fuse]: (agent: Agent, data: any) => {
        agent?.c2s_item_fuse(data);
    },
    [CmdID.c2s_lilian_received]: (agent: Agent, data: any) => {
        agent?.c2s_lilian_received(data);
    },
    [CmdID.c2s_exchange_code]: (agent: Agent, data: any) => {
        agent?.c2s_exchange_code(data);
    },
    [CmdID.c2s_receive_jijin]: (agent: Agent, data: any) => {
        agent?.c2s_receive_jijin(data);
    },
    [CmdID.c2s_buy_jijinvip]: (agent: Agent, data: any) => {
        agent?.c2s_buy_jijinvip();
    },
    /**--充值内容--------------------------------------------------- */

    [CmdID.c2s_shouchong_receive]: (agent: Agent, data: any) => {
        agent?.c2s_shouchong_receive();
    },
    /**--排行榜--------------------------------------------------- */
    [CmdID.c2s_rank_req]: (agent: Agent, data: any) => {
        agent?.reqRank();
    },
    [CmdID.c2s_rank_req_level]: (agent: Agent, data: any) => {
        agent?.reqLevelRank();
    },
    [CmdID.c2s_rank_req_power]: (agent: Agent, data: any) => {
        agent?.reqPowerRank();
    },
    [CmdID.c2s_rank_shenqing_mobai]: (agent: Agent, data: any) => {
        agent?.reqShenqingMobai();
    },
    [CmdID.c2s_rank_sync_mobai]: (agent: Agent, data: any) => {
        agent?.reqSyncMobai();
    },
    /**--矿洞--------------------------------------------------- */
    [CmdID.c2s_minearea_info]: (agent: Agent, data: any) => {
        agent?.reqMineAreaInfo();
    },
    [CmdID.c2s_minepit_info]: (agent: Agent, data: any) => {
        agent?.reqMinePitInfo(data);
    },
    [CmdID.c2s_mine_occupy]: (agent: Agent, data: any) => {
        agent?.reqMineOccupy(data);
    },
    [CmdID.c2c_mintpit_msg]: (agent: Agent, data: any) => {
        agent?.reqMinePitMsg(data);
    },
    [CmdID.c2s_mine_giveup]: (agent: Agent, data: any) => {
        agent?.reqMinePitGiveUp(data);
    },
    [CmdID.c2s_minepit_player]: (agent: Agent, data: any) => {
        agent?.reqMinePitPlayer(data);
    },
    [CmdID.c2s_author_notice]: (agent: Agent, data: any) => {
        agent?.reqAuthor(data);
    },
}