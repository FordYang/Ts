export class ErrorConst {


    public static readonly SUCCEED: number = 0;
    public static readonly FAILED: number = 1000; // 失败

    /*#FAILED ---------------------------------------------------------------------------------------------------------#**/
    /**#强化失败！#*/
    public static readonly INTENSIY_FAILED: number = 30001;
    /**#传送失败,卷轴不足！#*/
    public static readonly TRANSFER_FAILED: number = 30002;
    /**#兑换失败,礼包码不对！#*/
    public static readonly EXCHANGE_FAILED: number = 30003;
    /**#购买失败！#*/
    public static readonly BUY_FAILED: number = 30004;
    /**#充值失败！#*/
    public static readonly INVEST_FAILED: number = 30005;
    /**#锻造失败！#*/
    public static readonly BUILD_FAILED: number = 30006;
    /**#刷新失败！#*/
    public static readonly REFLESH_FAILED: number = 30007;
    /**#技能升级失败！#*/
    public static readonly SKILL_UP_FAILED: number = 30008;
    /**#背包拓展失败！#*/
    public static readonly BAG_EXPEND_FAILED: number = 30009;
    /**#复活失败！#*/
    public static readonly RELIVE_FAILED: number = 30010;
    /**#创建角色失败！#*/
    public static readonly CREATE_ROLE_FAILED: number = 30011;
    /**#卸下失败，背包空格不足！#*/
    public static readonly UNEQUIP_FAILED: number = 30012;
    /**#穿戴失败，背包空格不足！#*/
    public static readonly EQUIP_FAILED: number = 30013;
    /**#未学习技/能！#*/
    public static readonly FIGHTING_SKILL_NOT_LEARN: number = 30014;
    /**#技能还未学习！#*/
    public static readonly SKILL_NOT_LEARN: number = 30015;
    /**#无奖励#*/
    public static readonly NO_REWARD: number = 30016;
    /**#不存在奖励#*/
    public static readonly REWARD_NOT_EXIST: number = 30017;
    /**#等级达到*级可使用！#*/
    public static readonly LV_ARIIVE: number = 30018;
    /**#还未领取#*/
    public static readonly NOT_GET: number = 30019;
    /**#技能攻击数太多#*/
    public static readonly SKILL_ATK_MORE: number = 30020;
    /**#攻速冷却中#*/
    public static readonly ATK_SPEED_CD: number = 30021;
    /**#升级怪物不存在#*/
    public static readonly NO_MONSTER_ID: number = 30022;
    /**#已满级#*/
    public static readonly MAX_LV: number = 30023;
    /**#主人已死，不能攻击#*/
    public static readonly ROLE_DIE: number = 30024;
    /**#物品不存在！#*/
    public static readonly ITEM_NOT_EXIST: number = 30025;
    /**#角色名已存在#*/
    public static readonly ROLE_NAME_EXIST: number = 30026;
    /**# 订单已过期!#*/
    public static readonly PAY_ORDER_PAST: number = 30027;
    /**# 订单号不存在! #*/
    public static readonly PAY_ORDER_NOT_EXIST: number = 30028;
    /**#签到失败！#*/
    public static readonly QIANDAO_FAILED: number = 30029;
    /**#扣除失败！#*/
    public static readonly DECUCT_FAILED: number = 30030;
    /**#保存失败！#*/
    public static readonly SAVE_FAILED: number = 30031;
    /**#领取失败！#*/
    public static readonly GET_REWARD_FAILED: number = 30032;
    /**#激活失败！#*/
    public static readonly ACTIVE_FAILED: number = 30033;
    /**#未激活！#*/
    public static readonly NOT_ACTIVE: number = 30034;
    /**#申请上位失败！#*/
    public static readonly RANK_MOBAI_SHENQING_FAILED: number = 30035;
    /**#膜拜失败！#*/
    public static readonly MOBAI_FAILED: number = 30036;
    /**#已膜拜！#*/
    public static readonly ALREADY_MOBAI: number = 30037;
    /**#熔炼失败 #*/
    public static readonly SMELT_FAILED: number = 30038;

    /*#SUCCESS ---------------------------------------------------------------------------------------------------------#**/
    /**#强化成功！#*/
    public static readonly INTENSIY_SUCCESS: number = 31001;
    /**#回收成功！#*/
    public static readonly RECLAIM_SUCCESS: number = 31002;
    /**#签到成功！#*/
    public static readonly QIANDAO_SUCCESS: number = 31003;
    /**#邮件删除成功！#*/
    public static readonly MAIL_DELETE_SUCCESS: number = 31004;
    /**#附件领取成功！#*/
    public static readonly MAIL_GET_SUCCESS: number = 31005;
    /**#兑换成功#*/
    public static readonly EXCHANGE_SUCCESS: number = 31006;
    /**#扣除成功！#*/
    public static readonly DECUCT_SUCCESS: number = 31007;
    /**#充值成功！#*/
    public static readonly INVEST_SUCCESS: number = 31008;
    /**#锻造成功！#*/
    public static readonly BUILD_SUCCESS: number = 31009;
    /**#刷新成功！#*/
    public static readonly REFLESH_SUCCESS: number = 31010;
    /**#技能升级成功！#*/
    public static readonly SKILL_UP_SUCCESS: number = 31011;
    /**#背包扩容成功！#*/
    public static readonly BAG_EXPEND_SUCCESS: number = 31012;
    /**#保存成功！#*/
    public static readonly SAVE_SUCCESS: number = 31013;
    /**#复活成功#*/
    public static readonly RELIVE_SUCCESS: number = 31014;
    /**#使用成功！#*/
    public static readonly USE_SUCCESS: number = 31015;
    /**#创建角色成功！#*/
    public static readonly CREATE_ROLE_SUCCESS: number = 31016;
    /**#更换成功！#*/
    public static readonly CHANGE_SUCCESS: number = 31017;
    /**#替换成功！#*/
    public static readonly REPLACE_SUCCESS: number = 31018;
    /**#卸下成功！#*/
    public static readonly UNEQUIP_SUCCESS: number = 31019;
    /**#穿戴成功！#*/
    public static readonly EQUIP_SUCCESS: number = 31020;
    /**#登录成功！#*/
    public static readonly LOGIN_SUCCESS: number = 31021;
    /**#熟练度增加！#*/
    public static readonly ADD_PROFICIENCY: number = 31022;
    /**#更新完成！#*/
    public static readonly UPDETE_COMPLETE: number = 31023;
    /**#洗练成功！#*/
    public static readonly REMAKE_SUCCESS: number = 31024;
    /**#领取成功！#*/
    public static readonly GET_REWARD_SUCCESS: number = 31025;
    /**#免广告领取成功！#*/
    public static readonly NO_AD_GET_REWARD_SUCCESS: number = 31026;
    /**#膜拜成功 #*/
    public static readonly MOBAI_SUCCESS: number = 31027;
    /**#熔炼成功 #*/
    public static readonly SMELT_SUCCESS: number = 31028;

    /*#NOT_ENOUGH -------------------------------------------------------------------------------------------------------#**/
    /**#蓝量不足！#*/
    public static readonly MP_NOT_ENOUGH: number = 32001;
    /**#杀怪数不足！#*/
    public static readonly MONSTER_KILL_NUM: number = 32002;
    /**#元宝不足！#*/
    public static readonly YUANBAO_NOT_ENOUGH: number = 32003;
    /**#材料不足！#*/
    public static readonly MATERIAL_NOT_ENOUGH: number = 32004;
    /**#金币不足！#*/
    public static readonly GOLD_NOT_ENOUGH: number = 32005;
    /**#等级不足！#*/
    public static readonly LV_NOT_ENOUGH: number = 32006;
    /**#战力不足！#*/
    public static readonly COMBAT_NOT_ENOUGH: number = 32007;
    /**#职业不符！#*/
    public static readonly NOT_PROFESSION: number = 32008;
    /**#背包空间不足！#*/
    public static readonly BAG_NOT_ENOUGH: number = 32009;
    /**#体力不足！# */
    public static readonly ENERGY_NOT_ENOUGH: number = 32010;
    /**#体力已满！# */
    public static readonly ENERGY_ALREADY_FULL: number = 32011;
    /**#无可洗练词缀！#*/
    public static readonly NO_AFFIX_REMAKE: number = 32012;


    /*#DONE ---------------------------------------------------------------------------------------------------------#**/
    /**#已经领取过！#*/
    public static readonly GOT_THING: number = 33001;
    /**#无可回收装备！#*/
    public static readonly NO_CAN_RECLAIM_EQUIP: number = 33002;
    /**#无可读邮件#*/
    public static readonly NO_MAIL: number = 33003;
    /**#奖励已领取！#*/
    public static readonly GOT_REWARD: number = 33004;
    /**#技能已学习！#*/
    public static readonly SKILL_LEARNED: number = 33005;
    /**#今日次数已用完！#*/
    public static readonly TIME_USE_UP: number = 33006;
    /**#您已在当前地图！#*/
    public static readonly IN_THIS_MAP: number = 33007;
    /**#附件已领取！#*/
    public static readonly MAIL_GOT: number = 33008;
    /**#已签到！#*/
    public static readonly ALREADY_QIANDAO: number = 33009;

    /*#LOADING ---------------------------------------------------------------------------------------------------------#**/
    /**#广告加载中......#*/
    public static readonly AD_LOADING: number = 34001;
    /**#正在传送中......#*/
    public static readonly JUMPING_MAP: number = 34002;
    /**#药水冷却中！#*/
    public static readonly DRUG_CD: number = 34003;
    /**#CD中#*/
    public static readonly IN_CD: number = 34004;

    /*#SERVER ---------------------------------------------------------------------------------------------------------#**/
    /**#更新中......#*/
    public static readonly UPDETING: number = 35001;
    /**#网络已断开！#*/
    public static readonly NET_DISCONNECT: number = 35002;
    /**#网络重连！#*/
    public static readonly NET_RECONNECT: number = 35003;
    /**#请手动重连！#*/
    public static readonly PLEASE_HAND_CONNECT: number = 35004;
    /**#暂未开放，敬请期待！#*/
    public static readonly NOT_OPEN: number = 35005;
    /**#服务器连接失败！#*/
    public static readonly SERVER_CONNECT_ERROR: number = 35006;
    /**#服务器列表拉取失败，请检查网络！#*/
    public static readonly SERVERLIST_CONNECT_ERROR: number = 35007;
    /**#登录失败！#*/
    public static readonly LOGIN_FAILED: number = 35008;
    /**#更新失败！#*/
    public static readonly UPDETE_FAILED: number = 35009;
    /**#服务器连接成功#*/
    public static readonly SERVER_CONNECT_SUCCESS: number = 35010;
    /**#服务器列表拉取成功#*/
    public static readonly SERVERLIST_CONNECT_SUCCESS: number = 35011;
    /**#订单提交成功#*/
    public static readonly ORDER_SUBMIT_SUCCESS: number = 35012;
    /**#订单提交失败！#*/
    public static readonly ORDER_SUBMIT_FAILED: number = 35013;
    /**#IP禁用#*/
    public static readonly IP_FORBIDDEN: number = 35014;
    /**#在黑名单中#*/
    public static readonly IN_BLACK_LIST: number = 35015;
    /**#操作失败#*/
    public static readonly OPERROR: number = 35016;
    /**#MAC禁用#*/
    public static readonly MAC_FORBIDDEN: number = 35017;
    /**#登录版本号过低#*/
    public static readonly VERSION_LOWER: number = 35018;
    /**#登录没有Token#*/
    public static readonly NO_TOKEN: number = 35019;
    /**#登录找不到服务器#*/
    public static readonly _404_NOT_FOUND: number = 35020;
    /**#帐号或密码错误#*/
    public static readonly ACOUNT_ERROR: number = 35021;
    /**#网络错误#*/
    public static readonly NET_ERROR: number = 35022;
    /**#充值关闭！#*/
    public static readonly PAY_DISABLED: number = 35023;
    /** 数据库错误 */
    public static readonly DB_ERROR: number = 35024;
    /** 游戏关服维护中,请稍候登录! */
    public static readonly SERVER_MAINTENANCE: number = 35025;
    /** 策划埋头苦编中......*/
    public static readonly WRITING: number = 35026;

    /*#BUFF ---------------------------------------------------------------------------------------------------------#**/
    /**#经验加成#*/
    public static readonly EXP_UP: number = 36001;
    /**#金币加成#*/
    public static readonly GOLD_UP: number = 36002;
    /**#生命增幅#*/
    public static readonly HP_UP: number = 36003;
    /**#法力增幅#*/
    public static readonly MP_UP: number = 36004;
    /**#伤害提升#*/
    public static readonly DAMAGE_ADD_UP: number = 36005;
    /**#减伤提升#*/
    public static readonly DAMAGE_DEL_UP: number = 36006;
    /**#韧性增幅#*/
    public static readonly TENACITY_UP: number = 36007;
    /**#暴击率增幅#*/
    public static readonly CRITICAL_UP: number = 36008;
    /**#爆伤提升#*/
    public static readonly CRIT_DAMAGE_UP: number = 36009;
    /**#幸运增幅#*/
    public static readonly LUCKY_UP: number = 36010;
    /**#防御增幅#*/
    public static readonly DEF_UP: number = 36011;
    /**#护盾增加#*/
    public static readonly SHIELD_UP: number = 36012;
    /**#主属性提升#*/
    public static readonly MAIN_ATTR_UP: number = 36013;
    /**#掉落率提升#*/
    public static readonly DROP_UP: number = 36016;
    /**#极品率提升#*/
    public static readonly QUALITY_UP: number = 36017;
    /**#攻速提升#*/
    public static readonly ATK_SPEED_UP: number = 36007;

    /*#DEBUFF ---------------------------------------------------------------------------------------------------------#**/
    /**#已死亡#*/
    public static readonly DEAD: number = 37001;
    /**#定身中#*/
    public static readonly IMMOBILIZING: number = 37002;
    /**#眩晕中#*/
    public static readonly CIRCUMGYRATION: number = 37003;
    /**#流血#*/
    public static readonly SHED_BLOOD: number = 37004;
    /**#中毒#*/
    public static readonly POISIONING: number = 37005;
    /**#灼烧#*/
    public static readonly FIRING: number = 37006;

    /*#GAME ---------------------------------------------------------------------------------------------------------#**/
    /**#点击太快！#*/
    public static readonly CLICK_FAST = 38001;
    /**#保护中！#*/
    public static readonly PROTECTING = 38002;

    /*#message ---------------------------------------------------------------------------------------------------------#**/
    /**矿洞规则 */
    public static readonly MINE_RULE = 1003;
    /**托管说明 */
    public static readonly TG_RULE = 1004;
    /**洗练说明 */
    public static readonly REMAKE_RULE = 1005;

    /*#GUIDE ---------------------------------------------------------------------------------------------------------#**/
    /**新手篇 */
    public static readonly guide_1 = 39001;
    /**入门篇 */
    public static readonly guide_2 = 39002;
    /**属性篇 */
    public static readonly guide_3 = 39003;
    /**战士技能篇 */
    public static readonly guide_4 = 39004;
    /**法师技能篇 */
    public static readonly guide_5 = 39005;
    /**道士技能篇 */
    public static readonly guide_6 = 39006;
    /**资源篇 */
    public static readonly guide_7 = 39007;
    /**装备篇 */
    public static readonly guide_8 = 39008;
    /**进阶篇 */
    public static readonly guide_9 = 39009;
    /**图鉴篇 */
    public static readonly guide_10 = 39010;
    /**神兵篇 */
    public static readonly guide_11 = 39011;
    /**经脉篇 */
    public static readonly guide_12 = 39012;
}