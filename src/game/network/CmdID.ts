export default class CmdID {
    public static readonly s2c_trace: string = "s2c_trace";
    public static readonly gm_command: string = "gm_command";
    /** 心跳包带服务器时间 */
    public static readonly s2c_heartbeat: string = "s2c_heartbeat";
    public static readonly c2s_heartbeat_ack: string = "c2s_heartbeat_ack";
    /** 系统错误 */
    public static readonly s2c_sys_error: string = "s2c_sys_error";
    /** 系统通知 */
    public static readonly s2c_sys_notice: string = "s2c_sys_notice";

    /** 00:00点更新 */
    public static readonly s2c_every_day_0_0: string = "s2c_every_day_0_0";

    public static readonly c2s_test: string = "c2s_test";
    public static readonly s2c_test_ack: string = "s2c_test_ack";

    //----------------------------------------------------------------------------------------------------------
    public static readonly c2s_login: string = "c2s_login";
    public static readonly c2s_bag_info: string = "c2s_bag_info";
    public static readonly c2s_equips_info: string = "c2s_equips_info";
    public static readonly c2s_skills_info: string = "c2s_skills_info";
    public static readonly c2s_change_map: string = "c2s_change_map";
    public static readonly c2s_loadingmap_success: string = "c2s_loadingmap_success";
    public static readonly c2s_open_ui: string = "c2s_open_ui";
    public static readonly c2s_qiandao_week: string = "c2s_qiandao_week";
    public static readonly c2s_qiandao_month: string = "c2s_qiandao_month";
    public static readonly c2s_use_bagitem: string = "c2s_use_bagitem";
    public static readonly c2s_item_decompound: string = "c2s_item_decompound";
    public static readonly c2s_skill_auto: string = "c2s_skill_auto";
    public static readonly c2s_wear_equip: string = "c2s_wear_equip";
    public static readonly c2s_takeoff_equip: string = "c2s_takeoff_equip";
    public static readonly c2s_equips_reclaim: string = "c2s_equips_reclaim";
    public static readonly c2s_relogin: string = "c2s_relogin";
    public static readonly c2s_enter_game: string = "c2s_enter_game";
    public static readonly c2s_update_setting: string = "c2s_update_setting";
    public static readonly c2s_skill_upgrade: string = "c2s_skill_upgrade";

    //---------------------------------------
    public static readonly s2c_login: string = "s2c_login";
    public static readonly s2c_equips_info: string = "s2c_equips_info";
    public static readonly s2c_bag_info: string = "s2c_bag_info";
    public static readonly s2c_skills_info: string = "s2c_skills_info";
    public static readonly s2c_equip_change: string = "s2c_equip_change";
    public static readonly s2c_notice: string = "s2c_notice";
    public static readonly s2c_change_map: string = "s2c_change_map";
    public static readonly s2c_qiandao_week: string = "s2c_qiandao_week";
    public static readonly s2c_qiandao_month: string = "s2c_qiandao_month";
    public static readonly s2c_qiandao_month_reset = 's2c_qiandao_month_reset';
    public static readonly s2c_skill_change: string = "s2c_skill_change";
    public static readonly s2c_use_libao: string = "s2c_use_libao";
    public static readonly s2c_bagitem_change: string = "s2c_bagitem_change";
    public static readonly s2c_otherlogin: string = "s2c_otherlogin";
    public static readonly s2c_you_money: string = "s2c_you_money";
    public static readonly s2c_you_exp: string = "s2c_you_exp";
    public static readonly s2c_you_upgrade: string = "s2c_you_upgrade";
    public static readonly s2c_aoi_pinfo: string = "s2c_aoi_pinfo";
    public static readonly s2c_player_data: string = "s2c_player_data";
    public static readonly s2c_day_reward: string = "s2c_day_reward";
    public static readonly s2c_charge: string = "s2c_charge";
    public static readonly s2c_clear_day: string = "s2c_clear_day";
    public static readonly s2c_killmonster_msg: string = "s2c_killmonster_msg";
    public static readonly s2c_equips_reclaim: string = "s2c_equips_reclaim";

    public static readonly s2c_sync_hero_attr: string = "s2c_sync_hero_attr";


    //----------------------------------------------------------------------------------------------------------
    /** 复活主角 */
    public static readonly c2s_hero_revive: string = "c2s_hero_revive";
    public static readonly c2s_fighting_sync_animal: string = "c2s_fighting_sync_animal";
    //---------------------------------------
    /**  */
    public static readonly s2c_fighting_sync_animal: string = "s2c_fighting_sync_animal";

    public static readonly s2c_fighting_add_hero: string = "s2c_fighting_add_hero";
    public static readonly s2c_fighting_add_player: string = "s2c_fighting_add_player";
    public static readonly s2c_fighting_add_monster: string = "s2c_fighting_add_monster";
    public static readonly s2c_fighting_remove_monster: string = "s2c_fighting_remove_monster";
    public static readonly s2c_fighting_add_buff: string = "s2c_fighting_add_buff";
    public static readonly s2c_fighting_remove_buff: string = "s2c_fighting_remove_buff";
    public static readonly s2c_fighting_change_attr: string = "s2c_fighting_change_attr";
    public static readonly s2c_fighting_change_hp: string = "s2c_fighting_change_hp";
    public static readonly s2c_fighting_sync_hero_hpmp: string = "s2c_fighting_sync_hero_hpmp";
    public static readonly s2c_fighting_trigger_pass: string = "s2c_fighting_trigger_pass";
    public static readonly s2c_fighting_effect: string = "s2c_fighting_effect";
    public static readonly s2c_fighting_drop: string = "s2c_fighting_drop";
    public static readonly s2c_sync_kill_monster_count: string = "s2c_sync_kill_monster_count";
    public static readonly s2c_fighting_hero_die: string = "s2c_fighting_hero_die";
    public static readonly s2c_fighting_fire_skill_ack: string = "s2c_fighting_fire_skill_ack";

    public static readonly s2c_fighting_result: string = "s2c_fighting_result";

    /** 复活主角 */
    public static readonly s2c_hero_revive: string = "s2c_hero_revive";
    /** Boss死亡 */
    public static readonly s2c_fighting_boss_die: string = "s2c_fighting_boss_die";
    /**　Ｂｏｓｓ复活 */
    public static readonly s2c_fighting_boss_revive: string = "s2c_fighting_boss_revive";
    /** 移动 */
    public static readonly s2c_fighting_animal_move: string = "s2c_fighting_animal_move";
    //----------------------------------------------------------------------------------------------------------
    // 图鉴
    public static readonly c2s_role_tujian_upgrade: string = "c2s_role_tujian_upgrade";

    //---------------------------------------
    public static readonly s2c_role_tujian_upgrade: string = "s2c_role_tujian_upgrade";

    //----------------------------------------------------------------------------------------------------------
    public static readonly c2s_role_jingmai_upgrade: string = "c2s_role_jingmai_upgrade";
    //---------------------------------------
    public static readonly s2c_role_jingmai_upgrade: string = "s2c_role_jingmai_upgrade";

    //----------------------------------------------------------------------------------------------------------
    // 邮件
    public static readonly c2s_mail_set_read: string = "c2s_mail_set_read";
    public static readonly c2s_mail_get_reward: string = "c2s_mail_get_reward";
    public static readonly c2s_mail_delete: string = "c2s_mail_delete";
    //---------------------------------------
    public static readonly s2c_mail_async_list: string = "s2c_mail_async_list";
    public static readonly s2c_mail_get_reward: string = "s2c_mail_get_reward";
    public static readonly s2c_mail_delete: string = "s2c_mail_delete";

    //---------------------------------------
    /**背包 */
    public static readonly c2s_bag_expend: string = "c2s_bag_expend";
    public static readonly s2c_bag_expend: string = "s2c_bag_expend";
    //---------------------------------------
    // 商店
    public static readonly c2s_shop_buy: string = "c2s_shop_buy";
    public static readonly s2c_shop_buy: string = "s2c_shop_buy";
    /**强化 */
    public static readonly c2s_part_intensify: string = "c2s_part_intensify";
    public static readonly s2c_part_intensify: string = "s2c_part_intensify";
    /**锻造 */
    public static readonly c2s_blacksmith: string = "c2s_blacksmith";
    public static readonly c2s_blacksmith_req: string = "c2s_blacksmith_req";
    public static readonly s2c_blacksmith: string = "s2c_blacksmith";
    public static readonly s2c_blacksmith_req: string = "s2c_blacksmith_req";
    public static readonly c2s_refresh_blacksmith: string = "c2s_refresh_blacksmith";
    /**云游商城 */
    public static readonly c2s_refresh_yyshop: string = "c2s_refresh_yyshop";
    public static readonly c2s_delay_yyshop: string = "c2s_delay_yyshop";
    public static readonly c2s_yyshop: string = "c2s_yyshop";
    public static readonly s2c_yyshop: string = "s2c_yyshop";
    //---------------------------------------
    /** 离线托管 */
    /** 设置托管 */
    public static readonly c2s_req_off_trust: string = "c2s_req_off_trust";
    public static readonly s2c_req_off_trust_ack: string = "s2c_req_off_trust_ack";
    public static readonly s2c_off_trust_init: string = "s2c_off_trust_init";

    //---------------------------------------
    // 支付
    public static readonly c2s_pay_req: string = "c2s_pay_req";
    public static readonly c2s_shouchong_receive: string = "c2s_shouchong_receive";

    public static readonly s2c_pay_req_ack: string = "s2c_pay_req_ack";
    public static readonly s2c_pay_succeed: string = "s2c_pay_succeed";
    public static readonly s2c_shouchong_receive: string = "s2c_shouchong_receive";
    public static readonly s2c_first_pay: string = "s2c_first_pay";

    //---------------------------------------
    // 神器
    public static readonly c2s_shenqi_upgrade = "c2s_shenqi_upgrade";
    public static readonly c2s_shenqi_skill_upgrade = "c2s_shenqi_skill_upgrade";
    public static readonly s2c_shenqi_upgrade = "s2c_shenqi_upgrade";
    public static readonly s2c_shenqi_skill_upgrade = "s2c_shenqi_skill_upgrade";

    //---------------------------------------
    /**特权 */
    public static readonly c2s_prerogative_receive: string = "c2s_prerogative_receive";
    public static readonly s2c_prerogative_change: string = "s2c_prerogative_change";

    /**地图 */
    public static readonly c2s_sync_mapunlock: string = "c2s_sync_mapunlock";
    /**引导状态 */
    public static readonly c2s_sync_guidestage: string = "c2s_sync_guidestage";
    /**洗练 */
    public static readonly c2s_equip_remake: string = "c2s_equip_remake";
    public static readonly s2c_equip_remake: string = "s2c_equip_remake";
    public static readonly c2s_equip_remake_save: string = "c2s_equip_remake_save";
    public static readonly s2c_equip_remake_save: string = "s2c_equip_remake_save";
    /**献祭 */
    public static readonly c2s_equip_xianji: string = "c2s_equip_xianji";
    public static readonly s2c_equip_xianji: string = "s2c_equip_xianji";
    public static readonly c2s_equip_xianji_refresh: string = "c2s_equip_xianji_refresh";
    public static readonly c2s_equip_xianji_save: string = "c2s_equip_xianji_save";
    public static readonly s2c_equip_xianji_save: string = "s2c_equip_xianji_save";

    /**上锁 */
    public static readonly c2s_lock_equip: string = "c2s_lock_equip";
    public static readonly s2c_lock_equip: string = "s2c_lock_equip";
    /**替换装备 */
    public static readonly c2s_equip_replace: string = "c2s_equip_replace";
    /**补充金币 */
    public static readonly c2s_exchange_money: string = "c2s_exchange_money";
    /**离线收益 */
    public static readonly c2s_offline_awards: string = "c2s_offline_awards";
    public static readonly s2c_offline_awards: string = "s2c_offline_awards";
    /**每日重置 */
    public static readonly s2c_daymap_change: string = "s2c_daymap_change";
    /**免广告 */
    public static readonly s2c_prerogative_mgg: string = "s2c_prerogative_mgg";
    /**合成 */
    public static readonly c2s_item_fuse: string = "c2s_item_fuse";
    public static readonly s2c_item_fuse: string = "s2c_item_fuse";
    /**历练 */
    public static readonly c2s_lilian_received: string = "c2s_lilian_received";
    public static readonly s2c_lilian_received: string = "s2c_lilian_received";
    public static readonly s2c_equipRecord_change: string = "s2c_equipRecord_change";
    /**兑换码 */
    public static readonly c2s_exchange_code: string = "c2s_exchange_code";
    /**基金 */
    public static readonly c2s_receive_jijin: string = "c2s_receive_jijin";
    public static readonly c2s_buy_jijinvip: string = "c2s_buy_jijinvip";
    public static readonly s2c_jijin_change: string = "s2c_jijin_change";
    /**珍宝 */
    public static readonly s2c_zhenbao_change: string = "s2c_zhenbao_change";
    /**技能启动 */
    public static readonly s2c_skill_start_fighting: string = "s2c_skill_start_fighting";
    //----------------------------------------------------------------------------------------------------------
    // 排行榜
    public static readonly c2s_rank_req: string = "c2s_rank_req";
    public static readonly c2s_rank_req_level: string = "c2s_rank_req_level";
    public static readonly c2s_rank_req_power: string = "c2s_rank_req_power";
    public static readonly c2s_rank_shenqing_mobai: string = "c2s_rank_shenqing_mobai";
    public static readonly c2s_rank_sync_mobai: string = "c2s_rank_sync_mobai";

    public static readonly s2c_rank_req_ack: string = "s2c_rank_req_ack";
    public static readonly s2c_rank_req_level_ack: string = "s2c_rank_req_level";
    public static readonly s2c_rank_req_power_ack: string = "s2c_rank_req_power";
    public static readonly s2c_rank_shenqing_mobai: string = "s2c_rank_shenqing_mobai";
    public static readonly s2c_rank_sync_mobai: string = "s2c_rank_sync_mobai";
    //--------------------------------------------------------------------------
    // 任务
    public static readonly c2s_task_done: string = 'c2s_task_done';

    public static readonly s2c_task_open: string = 's2c_task_open';
    public static readonly s2c_task_done: string = 's2c_task_done';
    public static readonly s2c_task_done_ack: string = 's2c_task_done_ack';
    public static readonly s2c_task_update_extra: string = 's2c_task_update_extra';

    //--------------------------------------------------------------------------

    /**矿洞 */
    public static readonly c2s_minearea_info: string = "c2s_minearea_info";
    public static readonly s2c_minearea_info: string = "s2c_minearea_info";
    public static readonly c2s_minepit_info: string = "c2s_minepit_info";
    public static readonly s2c_minepit_info: string = "s2c_minepit_info";
    public static readonly c2s_mine_occupy: string = "c2s_mine_occupy";
    public static readonly s2c_mine_occupy: string = "s2c_mine_occupy";
    public static readonly c2c_mintpit_msg: string = "c2c_mintpit_msg";
    public static readonly s2c_mintpit_msg: string = "s2c_mintpit_msg";
    public static readonly c2s_mine_giveup: string = "c2s_mine_giveup";
    public static readonly c2s_minepit_player: string = "c2s_minepit_player";
    public static readonly s2c_minepit_player: string = "s2c_minepit_player";
    public static readonly s2c_energy_change: string = "s2c_energy_change";

    /**擂台 */
    public static readonly s2c_arena: string = "s2c_arena";

    /**实名 */
    public static readonly c2s_author_notice: string = "c2s_author_notice";
    public static readonly s2c_author_notice: string = "s2c_author_notice";

    /**第二天打点 */
    public static readonly s2c_reprot_day: string = "s2c_reprot_day";
    //----------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------
    public static setup(): void {
        CmdID.regCmd(60101, CmdID.c2s_heartbeat_ack, "心跳包");
        CmdID.regCmd(60001, CmdID.gm_command, "GM");
        CmdID.regCmd(60002, CmdID.s2c_heartbeat, "心跳包");
        CmdID.regCmd(60003, CmdID.s2c_trace, "调试输出");
        CmdID.regCmd(60004, CmdID.s2c_every_day_0_0, "00:00点更新");
        CmdID.regCmd(60005, CmdID.s2c_sys_error, "系统错误");
        CmdID.regCmd(60006, CmdID.s2c_sys_notice, "系统通知");

        //-----------------------------------
        CmdID.regCmd(10100, CmdID.c2s_login, "登录");
        CmdID.regCmd(10101, CmdID.c2s_relogin, "重新登录");
        CmdID.regCmd(10102, CmdID.c2s_enter_game, "进入游戏");
        CmdID.regCmd(10103, CmdID.c2s_change_map, "请求切换地图");
        CmdID.regCmd(10104, CmdID.c2s_loadingmap_success, "切换地图成功");
        CmdID.regCmd(10105, CmdID.c2s_open_ui, "打开面板");

        //-----------------------------------
        CmdID.regCmd(10001, CmdID.s2c_login, "登录");
        CmdID.regCmd(10002, CmdID.s2c_change_map, "切换地图");
        CmdID.regCmd(10003, CmdID.s2c_otherlogin, "其他登录");
        CmdID.regCmd(10004, CmdID.s2c_notice, "通知");
        CmdID.regCmd(10005, CmdID.s2c_you_money, "同步金币");
        CmdID.regCmd(10006, CmdID.s2c_player_data, "");
        CmdID.regCmd(10007, CmdID.s2c_you_exp, "同步经验");
        CmdID.regCmd(10008, CmdID.s2c_you_upgrade, "升级通知");
        CmdID.regCmd(10009, CmdID.s2c_sync_hero_attr, "同步属性");

        //-----------------------------------
        CmdID.regCmd(12101, CmdID.c2s_role_jingmai_upgrade, "经脉升级");
        CmdID.regCmd(12001, CmdID.s2c_role_jingmai_upgrade, "经脉升级");
        //-----------------------------------
        CmdID.regCmd(12102, CmdID.c2s_role_tujian_upgrade, "图鉴升级");
        CmdID.regCmd(12002, CmdID.s2c_role_tujian_upgrade, "图鉴升级");
        //-----------------------------------
        CmdID.regCmd(13101, CmdID.c2s_qiandao_week, "周签到");
        CmdID.regCmd(13102, CmdID.c2s_qiandao_month, "月签到");
        CmdID.regCmd(13001, CmdID.s2c_qiandao_week, "周签到");
        CmdID.regCmd(13002, CmdID.s2c_qiandao_month, "月签到");
        CmdID.regCmd(13003, CmdID.s2c_qiandao_month_reset, "重置月签到");

        //-----------------------------------
        CmdID.regCmd(14101, CmdID.c2s_skill_auto, "自动技能");
        CmdID.regCmd(14001, CmdID.s2c_skill_change, "技能变化");
        //-----------------------------------
        CmdID.regCmd(15101, CmdID.c2s_bag_info, "获取背包");
        CmdID.regCmd(15102, CmdID.c2s_equips_info, "获取装备");
        CmdID.regCmd(15103, CmdID.c2s_skills_info, "获取技能");
        CmdID.regCmd(15104, CmdID.c2s_use_bagitem, "使用道具");
        CmdID.regCmd(15105, CmdID.c2s_item_decompound, "");

        //-----------------------------------
        CmdID.regCmd(15001, CmdID.s2c_use_libao, "使用道具礼包");
        CmdID.regCmd(15002, CmdID.s2c_bagitem_change, "");
        CmdID.regCmd(15003, CmdID.s2c_equips_info, "装备信息");
        CmdID.regCmd(15004, CmdID.s2c_bag_info, "背包信息");
        CmdID.regCmd(15005, CmdID.s2c_skills_info, "技能信息");

        // 装备
        CmdID.regCmd(15106, CmdID.c2s_wear_equip, "穿装备");
        CmdID.regCmd(15107, CmdID.c2s_takeoff_equip, "脱装备");
        CmdID.regCmd(15006, CmdID.s2c_equip_change, "装备结果");

        // 回收
        CmdID.regCmd(15108, CmdID.c2s_equips_reclaim, "回收装备");
        CmdID.regCmd(15008, CmdID.s2c_equips_reclaim, "回收结果");

        // 设置
        CmdID.regCmd(15109, CmdID.c2s_update_setting, "同步设置");

        //-----------------------------------
        // 邮件
        CmdID.regCmd(16101, CmdID.c2s_mail_set_read, "设置只读");
        CmdID.regCmd(16102, CmdID.c2s_mail_get_reward, "领取奖励");
        CmdID.regCmd(16103, CmdID.c2s_mail_delete, "删除邮件");
        //-----------------------------------
        CmdID.regCmd(16001, CmdID.s2c_mail_async_list, "同步邮件列表");
        CmdID.regCmd(16002, CmdID.s2c_mail_get_reward, "领取返回");
        CmdID.regCmd(16003, CmdID.s2c_mail_delete, "删除返回");

        // 背包
        CmdID.regCmd(17101, CmdID.c2s_bag_expend, "拓展背包");
        CmdID.regCmd(17001, CmdID.s2c_bag_expend, "拓展结果");
        // 商城
        CmdID.regCmd(18102, CmdID.c2s_shop_buy, "商城购买");
        CmdID.regCmd(18002, CmdID.s2c_shop_buy, "商城购买");
        // 强化
        CmdID.regCmd(19101, CmdID.c2s_part_intensify, "强化请求");
        CmdID.regCmd(19001, CmdID.s2c_part_intensify, "强化结果");
        // 锻造
        CmdID.regCmd(20101, CmdID.c2s_blacksmith, "锻造列表");
        CmdID.regCmd(20102, CmdID.c2s_blacksmith_req, "锻造请求");
        CmdID.regCmd(20103, CmdID.c2s_refresh_blacksmith, "锻造刷新");
        CmdID.regCmd(20001, CmdID.s2c_blacksmith, "列表详情");
        CmdID.regCmd(20002, CmdID.s2c_blacksmith_req, "锻造结果");
        // 商城
        CmdID.regCmd(21101, CmdID.c2s_refresh_yyshop, "刷新云游商城");
        CmdID.regCmd(21102, CmdID.c2s_yyshop, "云游请求");
        CmdID.regCmd(21103, CmdID.c2s_delay_yyshop, "云游延长");
        CmdID.regCmd(21001, CmdID.s2c_yyshop, "云游商城");

        //-----------------------------------
        /**支付 */
        CmdID.regCmd(22101, CmdID.c2s_pay_req, "请求充值");
        CmdID.regCmd(22102, CmdID.c2s_shouchong_receive, "首充领取");
        CmdID.regCmd(22001, CmdID.s2c_pay_req_ack, "响应充值");
        CmdID.regCmd(22002, CmdID.s2c_shouchong_receive, "首充奖励");
        CmdID.regCmd(22003, CmdID.s2c_pay_succeed, "充值成功");
        CmdID.regCmd(22004, CmdID.s2c_first_pay, "首次支付");
        /**地图 */
        CmdID.regCmd(23101, CmdID.c2s_sync_mapunlock, "同步地图");
        /**引导 */
        CmdID.regCmd(24101, CmdID.c2s_sync_guidestage, "同步引导");
        /**技能 */
        CmdID.regCmd(25101, CmdID.c2s_skill_upgrade, "技能升级");
        /**洗练 */
        CmdID.regCmd(26101, CmdID.c2s_equip_remake, "装备锻造");
        CmdID.regCmd(26102, CmdID.c2s_equip_remake_save, "锻造保存");
        CmdID.regCmd(26001, CmdID.s2c_equip_remake, "锻造结果");
        CmdID.regCmd(26002, CmdID.s2c_equip_remake_save, "装备锻造保存");
        /**献祭 */
        CmdID.regCmd(26201, CmdID.c2s_equip_xianji, "装备献祭");
        CmdID.regCmd(26202, CmdID.c2s_equip_xianji_refresh, "装备重新献祭");
        CmdID.regCmd(26203, CmdID.c2s_equip_xianji_save, "保存献祭");
        CmdID.regCmd(26010, CmdID.s2c_equip_xianji, "装备献祭结果");
        CmdID.regCmd(26011, CmdID.s2c_equip_xianji_save, "装备献祭保存");

        /**装备锁定 */
        CmdID.regCmd(27101, CmdID.c2s_lock_equip, "装备上锁");
        CmdID.regCmd(27102, CmdID.c2s_equip_replace, "装备替换");
        CmdID.regCmd(27001, CmdID.s2c_lock_equip, "上锁结果");
        /**免费金币 */
        CmdID.regCmd(28101, CmdID.c2s_exchange_money, "兑换金币");
        /**离线收益 */
        CmdID.regCmd(29101, CmdID.c2s_offline_awards, "领取离线");
        CmdID.regCmd(29001, CmdID.s2c_offline_awards, "离线结果");
        //-----------------------------------

        /**特权变更 */
        CmdID.regCmd(30101, CmdID.c2s_prerogative_receive, "特权奖励领取");
        CmdID.regCmd(30001, CmdID.s2c_prerogative_change, "特权变更");
        CmdID.regCmd(30002, CmdID.s2c_prerogative_mgg, "免广告充值");
        /**每日重置 */
        CmdID.regCmd(31001, CmdID.s2c_daymap_change, "每日重置");
        /**合成 */
        CmdID.regCmd(32101, CmdID.c2s_item_fuse, "合成物品");
        CmdID.regCmd(32001, CmdID.s2c_item_fuse, "合成物品成功");
        /**历练 */
        CmdID.regCmd(33101, CmdID.c2s_lilian_received, "领取历练奖励");
        CmdID.regCmd(33001, CmdID.s2c_lilian_received, "历练奖励成功");
        CmdID.regCmd(33002, CmdID.s2c_equipRecord_change, "历练装备记录");
        /**兑换码 */
        CmdID.regCmd(34101, CmdID.c2s_exchange_code, "兑换码");
        /**基金 */
        CmdID.regCmd(35101, CmdID.c2s_receive_jijin, "基金");
        CmdID.regCmd(35102, CmdID.c2s_buy_jijinvip, "购买基金vip");
        CmdID.regCmd(35001, CmdID.s2c_jijin_change, "基金变化");
        //-----------------------------------
        // 离线托管
        CmdID.regCmd(36101, CmdID.c2s_req_off_trust, "设置离线托管");
        CmdID.regCmd(36001, CmdID.s2c_req_off_trust_ack, "设置离线托管");
        CmdID.regCmd(36002, CmdID.s2c_off_trust_init, "初始化离线托管数据");

        /**珍宝 */
        CmdID.regCmd(37001, CmdID.s2c_zhenbao_change, "珍宝信息");
        /**技能启动 */
        CmdID.regCmd(38001, CmdID.s2c_skill_start_fighting, "技能开启");

        //-----------------------------------
        CmdID.regCmd(39101, CmdID.c2s_rank_req, "拉取排行榜");
        CmdID.regCmd(39102, CmdID.c2s_rank_req_level, "拉取等级排行榜");
        CmdID.regCmd(39103, CmdID.c2s_rank_req_power, "拉取战力排行榜");
        CmdID.regCmd(39104, CmdID.c2s_rank_shenqing_mobai, "申请膜拜排行榜");
        CmdID.regCmd(39105, CmdID.c2s_rank_sync_mobai, "同步膜拜排行榜");

        CmdID.regCmd(39001, CmdID.s2c_rank_req_ack, "拉取排行榜");
        CmdID.regCmd(39002, CmdID.s2c_rank_req_level_ack, "拉取等级排行榜");
        CmdID.regCmd(39003, CmdID.s2c_rank_req_power_ack, "拉取等级排行榜");
        CmdID.regCmd(39004, CmdID.s2c_rank_shenqing_mobai, "申请膜拜排行榜");
        CmdID.regCmd(39005, CmdID.s2c_rank_sync_mobai, "同步膜拜排行榜");

        /**矿洞 */
        CmdID.regCmd(40101, CmdID.c2s_minearea_info, "查看矿区详情");
        CmdID.regCmd(40001, CmdID.s2c_minearea_info, "请求矿洞占领");
        CmdID.regCmd(40102, CmdID.c2s_minepit_info, "查看矿洞详情");
        CmdID.regCmd(40002, CmdID.s2c_minepit_info, "矿洞详情");
        CmdID.regCmd(40103, CmdID.c2s_mine_occupy, "请求矿洞占领");
        CmdID.regCmd(40003, CmdID.s2c_mine_occupy, "矿洞占领详情");
        CmdID.regCmd(40104, CmdID.c2c_mintpit_msg, "控制矿洞消息");
        CmdID.regCmd(40004, CmdID.s2c_mintpit_msg, "矿洞产出详情");
        CmdID.regCmd(40105, CmdID.c2s_mine_giveup, "放弃占领");
        CmdID.regCmd(40106, CmdID.c2s_minepit_player, "请求占领矿坑的数据");
        CmdID.regCmd(40006, CmdID.s2c_minepit_player, "当前矿坑的具体信息");
        CmdID.regCmd(40007, CmdID.s2c_energy_change, "矿坑体力变化");

        //-----------------------------------
        /** 神器 */
        CmdID.regCmd(40131, CmdID.c2s_shenqi_upgrade, "升级神器");
        CmdID.regCmd(40132, CmdID.c2s_shenqi_skill_upgrade, "升级神器技能");
        CmdID.regCmd(40031, CmdID.s2c_shenqi_upgrade, "升级神器");
        CmdID.regCmd(40032, CmdID.s2c_shenqi_skill_upgrade, "升级神器技能");

        CmdID.regCmd(41101, CmdID.c2s_author_notice, "提交实名认证");
        CmdID.regCmd(41001, CmdID.s2c_author_notice, "实名认证通知");

        CmdID.regCmd(42001, CmdID.s2c_reprot_day, "第二天登录打点");

        //-----------------------------------
        // 任务
        CmdID.regCmd(43101, CmdID.c2s_task_done, '任务：提交');

        CmdID.regCmd(43001, CmdID.s2c_task_open, '任务：开启');
        CmdID.regCmd(43002, CmdID.s2c_task_done, '任务：完成');
        CmdID.regCmd(43003, CmdID.s2c_task_done_ack, '任务：完成确认，领取奖励');
        CmdID.regCmd(43004, CmdID.s2c_task_update_extra, '任务：附加数据更新');

        //-----------------------------------
        CmdID.regCmd(50103, CmdID.c2s_hero_revive, "请求主角复活");
        CmdID.regCmd(50104, CmdID.c2s_fighting_sync_animal, "同步生物");
        //-----------------------------------
        CmdID.regCmd(50001, CmdID.s2c_fighting_add_monster, "生成怪");
        CmdID.regCmd(50002, CmdID.s2c_fighting_remove_monster, "怪死亡");
        CmdID.regCmd(50003, CmdID.s2c_fighting_add_buff, "添加Buff");
        CmdID.regCmd(50004, CmdID.s2c_fighting_remove_buff, "移除Buff");
        CmdID.regCmd(50005, CmdID.s2c_fighting_change_hp, "血量变化");
        CmdID.regCmd(50006, CmdID.s2c_fighting_change_attr, "属性变化");
        CmdID.regCmd(50007, CmdID.s2c_fighting_effect, "战斗中特殊效果");
        CmdID.regCmd(50008, CmdID.s2c_sync_kill_monster_count, "同步杀怪数");
        CmdID.regCmd(50009, CmdID.s2c_fighting_hero_die, "主角死亡");
        CmdID.regCmd(50010, CmdID.s2c_hero_revive, "主角复活");
        CmdID.regCmd(50011, CmdID.s2c_fighting_drop, "掉落");
        CmdID.regCmd(50012, CmdID.s2c_killmonster_msg, "掉落详细信息");
        CmdID.regCmd(50013, CmdID.s2c_fighting_boss_die, "Boss死亡");
        CmdID.regCmd(50014, CmdID.s2c_fighting_boss_revive, "Boss复活");
        CmdID.regCmd(50015, CmdID.s2c_fighting_trigger_pass, "触发被动");
        CmdID.regCmd(50016, CmdID.s2c_fighting_fire_skill_ack, "释放技能");
        CmdID.regCmd(50017, CmdID.s2c_fighting_animal_move, "生物移动");
        CmdID.regCmd(50018, CmdID.s2c_fighting_add_hero, "创建主角");
        CmdID.regCmd(50019, CmdID.s2c_fighting_add_player, "创建其他玩家");
        CmdID.regCmd(50020, CmdID.s2c_fighting_sync_animal, "同步场景生物");
        CmdID.regCmd(50021, CmdID.s2c_fighting_result, "PK结果");
        CmdID.regCmd(50022, CmdID.s2c_fighting_sync_hero_hpmp, "同步主角HPMP");

        /**擂台 */
        CmdID.regCmd(60001, CmdID.s2c_arena, "玩家PK");
    }

    //----------------------------------------------------------------------------------------------------------

    private static readonly idMap: { [cmdId: number]: { cmdId: number, cmdstr: string, desc: string } } = {};
    private static readonly strMap: { [cmdstr: string]: { cmdId: number, cmdstr: string, desc: string } } = {};

    public static getDesc(cmdstr: string): string {
        return CmdID.strMap[cmdstr] ? CmdID.strMap[cmdstr].desc : "未定义";
    }

    public static getCmdId(cmdstr: string): number {
        if (CmdID.strMap[cmdstr]) {
            return CmdID.strMap[cmdstr].cmdId;
        }
        // Logger.error(`CmdID中未注册协议名：${cmdstr}`);
        return 0;
    }

    public static getCmdStr(cmdId: number): string {
        if (CmdID.idMap[cmdId]) {
            return CmdID.idMap[cmdId].cmdstr;
        }
        // Logger.error(`CmdID中未注册协议ID：${cmdId}`);
        return "";
    }

    private static regCmd(cmdId: number, cmdstr: string, desc: string): void {
        CmdID.idMap[cmdId] = { cmdId, cmdstr, desc };
        CmdID.strMap[cmdstr] = { cmdId, cmdstr, desc };
    }

}

CmdID.setup();