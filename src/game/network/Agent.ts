import AgentBase from "./AgentBase";
import AgentMgr from "./AgentMgr";
import Logger from "../gear/Logger";
import DB from "../utils/DB";
import { ErrorConst } from "../consts/ErrorConst";
import Player from "../model/playerObj/Player";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import CmdID from "./CmdID";
import ws from "ws";
import GameTokenMgr from "../mgr/GameTokenMgr";
import GameConf from "../../conf/GameConf";
import Http from "../utils/Http";
import RankMgr from "../mgr/RankMgr";
import GameUtil from "../core/GameUtil";
import { SettingConfig } from "../config/SettingConfig";
import { ESettingConst } from "../consts/ESettingConst";
import { c2s } from "../common/proto_c";
import MineBase from "../activity/mining/MineBase";
import HttpGame from "./http/HttpGame";
import { EUI } from "../consts/EUI";
import PlayerEvent from "../consts/PlayerEvent";

/**
 * agent 类，客户端网络连接代理，用于接收发送与客户端相关的协议包。
 */
export default class Agent extends AgentBase {
    // PING等待时间 5分钟
    static TIME_WAIT_PING: number = 5 * 60 * 1000;

    //----------------------------------------------------

    private player: Player;

    constructor(socket: ws) {
        super(socket);
    }

    public update_min(): void {
        this.checkHeart();
    }

    //----------------------------------------------------

    private setPlayer(player: Player): void {
        this.player = player;
        this.player.setAgent(this);
        this.player.playerLogined();

        this.initHeart();
    }

    protected onOpen(evt: ws.OpenEvent): void {
        super.onOpen(evt);
    }

    private heartTime: number = 0;
    private initHeart(): void {
        this.heartTime = Date.now();
        this.checkHeart();

        this.player.removeAllListeners(CmdID.c2s_heartbeat_ack);
        this.player.on(CmdID.c2s_heartbeat_ack, () => {
            this.heartTime = Date.now();
        });
    }

    private checkHeart(): void {
        if (this.heartTime) {
            this.send(CmdID.s2c_heartbeat, { serverTime: Date.now() });

            if (Date.now() - this.heartTime > Agent.TIME_WAIT_PING) {
                this.send(CmdID.s2c_trace, { msg: "服务器超时关闭" });
                this.destroy();
            }
        }
    }

    //---------------------------------------------------------------------------------------------------------------

    protected execLogin(cmdstr: string, bodyData: any): void {
        try {
            if (cmdstr === CmdID.c2s_login || cmdstr === CmdID.c2s_relogin) {
                c2s[cmdstr]?.(this, bodyData);
            }
            else {
                this.destroy();
            }
        }
        catch (error) {
            Logger.warn(`解析错误:${error}\n${error.stack}!`);
        }
    }

    protected execLogic(cmdstr: string, bodyData: any): void {
        c2s[cmdstr]?.(this, bodyData);
        this.player?.emit(cmdstr, bodyData);
    }

    //--------------------------------------------------------------------------------------------------------------------------

    // 读表
    public readDB(roleid: number): void {
        DB.loginByRoleid(roleid, (code: any, data: any) => {
            if (code == ErrorConst.SUCCEED) {
                this.doLogin(data);
            }
            else {
                this.destroy();
            }
        });
    }

    // 请求登录
    c2s_login(data: any) {
        let token = data.token;
        let roleId = data.roleid;
        let accountid = data.accountid;

        if (GameUtil.isClose) {
            this.send(CmdID.s2c_sys_error, { code: ErrorConst.SERVER_MAINTENANCE });
            return;
        }

        Http.sendget(GameConf.gate_ip, GameConf.gate_port, "/verify_account", { accountid: accountid, token: token }, (success, data) => {
            if (success && data && data.code == ErrorConst.SUCCEED) {
                this.execFun = this.execLogic;
                GameTokenMgr.instance.addToken(accountid, token);

                let player = PlayerMgr.shared.getPlayerByRoleId(roleId);
                if (player) {
                    this.setPlayer(player);
                    return;
                }

                // Logger.info(`玩家[accountid=${accountid},角色:${roleId}]读表中...`);
                this.readDB(roleId);
            }
            else {
                this.destroy();
            }
        });
    }

    /**加载成功才算 */
    private doLogin(data: any) {
        let player = new Player();
        player.setDB(data).then(() => {
            let success = PlayerMgr.shared.addPlayer(player);
            if (success) {
                this.setPlayer(player);
            }
            else {
                // 重复创建
                this.destroy();
            }
        });
    };

    /**其他设备登录 */
    public otherLogin() {
        if (this.player) {
            this.player.removeAllListeners(CmdID.c2s_heartbeat_ack);
            this.player.send(CmdID.s2c_otherlogin);
            this.player = null;
        }

        this.destroy();
    }

    //---------------------------------------------------------------------------------------------
    //  背包拉取
    c2s_bag_info() {
        if (this.player) {
            this.player.sendBagInfo();
        } else {
            Logger.debug(`玩家背包查询错误`);
            return;
        }
    }

    // 技能拉取
    c2s_skills_info() {
        if (this.player) {
            this.player.sendSkillInfo();
        } else {
            Logger.debug(`玩家技能错误`);
            return;
        }
    }

    // 切换地图
    c2s_change_map(data: any) {
        if (this.player) this.player.changeMap(data);
    }

    /** 打开面板 */
    c2s_open_ui(data: { uiId: EUI }) {
        if (data && data.uiId) {
            this.player.emit(PlayerEvent.OPEN_UI, data.uiId);
        }
    }

    c2s_loadingmap_success() {
        if (this.player) this.player.checkFighting();
    }

    /**背包拓展 */
    c2s_bag_expend(data: any) {
        if (this.player) this.player.onBagExpend(data.type);
    }

    // 使用数据
    c2s_use_bagitem(data: any) {
        if (this.player) this.player.onUseItem(data);
    }

    // 分解
    c2s_item_decompound(data: any) {
        if (this.player) this.player.onDecompoundItem(data);
    }

    /**穿装备 */
    c2s_wear_equip(data: any) {
        if (this.player) this.player.onWearEquip(data);
    }

    /**脱装备 */
    c2s_takeoff_equip(data: any) {
        if (this.player) {
            this.player.onTakeOffEquip(data);
        }
    }

    /**游戏设置 */
    c2s_update_setting(data: any) {
        if (this.player) this.player.onUpdateSetting(data);
    }

    /**强化 */
    c2s_part_intensify(data: any) {
        if (this.player) this.player.onIntensify(data);
    }

    /**回收 */
    c2s_equips_reclaim(data: any) {
        if (this.player) this.player.onReclaimEquip(data);
    }

    /**锻造列表 */
    c2s_blacksmith() {
        if (this.player) this.player.getBlackSmith();
    }

    /**锻造请求 */
    c2s_blacksmith_req(data: any) {
        if (this.player) this.player.buildByBlackSmith(data);
    }

    /**锻造刷新 */
    c2s_refresh_blacksmith(data: any) {
        if (this.player) this.player.refreshBlackSmith(data);
    }

    /**同步未解锁地图信息 */
    c2s_sync_mapunlock(data: any) {
        if (this.player) this.player.onSyncMapInfo(data);
    }

    c2s_sync_guidestage(data: any) {
        if (this.player) this.player.onSyncGuideInfo(data);
    }

    /**拉取云游 */
    c2s_yyshop() {
        if (this.player) this.player.onGetYYShop();
    }
    /**刷新云游商城 */
    c2s_refresh_yyshop() {
        if (this.player) this.player.onRefreshYYShop();
    }
    /**延长时间 */
    c2s_delay_yyshop() {
        if (this.player) this.player.onDealyYYShop();
    }

    /**技能 */
    c2s_skill_auto(data: any) {
        if (this.player) this.player.onSkillAuto(data);
    }
    c2s_skill_upgrade(data: any) {
        if (this.player) this.player.onUpgrade(data.skillid);
    }

    /**替换装备 */
    c2s_equip_replace(data: any) {
        if (this.player) this.player.replaceEquip(data.uuid, data.part);
    }

    /**锻造 */
    c2s_equip_remake(data: any) {
        if (this.player) this.player.onRemakeEquip(data.uid, data.locks);
    }

    c2s_equip_remake_save(data: any) {
        if (this.player) this.player.onSaveRemakeEquip(data.uid);
    }

    /**献祭 */
    c2s_equip_xianji(data: any) {
        if (this.player) this.player.onEquipXianJi(data);
    }

    /**保存献祭 */
    c2s_equip_xianji_save(data: any) {
        if (this.player) this.player.onEquipXianJiSave(data);
    }

    /**锁定状态 */
    c2s_lock_equip(data: any) {
        if (this.player) this.player.c2s_lock_equip(data.uuid, data.type);
    }

    /**合成 */
    c2s_item_fuse(data: any) {
        if (this.player) this.player.c2s_item_fuse(data.itemId, data.count);
    }

    /**历练 */
    c2s_lilian_received(data: any) {
        if (this.player) this.player.c2s_lilian_received(data.lilianId, data.taskId);
    }

    /**兑换码 */
    c2s_exchange_code(data: any) {
        if (this.player) this.player.exchange.onExchange(data.exCode);
    }

    /**基金领取 */
    c2s_receive_jijin(data: any) {
        if (this.player) this.player.onReceiveJijin(data.lvl, data.type);
    }

    /**基金领取 */
    c2s_buy_jijinvip() {
        if (this.player) this.player.onBuyJijin();
    }

    c2s_tujian_upgrade(data: { monsterId: number }): void {
        this.player.c2s_tujian_upgrade(data);
    }

    c2s_jingmai_upgrade(data: { code: number, lv: number, xueweiId: number }): void {
        this.player.c2s_jingmai_upgrade(data);
    }

    /**转换金币 */
    c2s_exchange_money(data: any) {
        if (this.player) this.player.c2s_exchange_money(data.type);
    }

    /**离线奖励 */
    c2s_offline_awards(data: any) {
        if (this.player) this.player.c2s_offline_awards(data.type);
    }

    /**免广告 */
    c2s_prerogative_receive(data: any) {
        if (this.player) this.player.c2s_prerogative_receive(data.type)
    }

    /**--充值-------------------------------------------------------------------------------------- */
    c2s_shouchong_receive(): void {
        if (this.player) {
            this.player.onReceivedShouChong();
        }
    }

    //-----------------------------------------------------------------------------------------
    // 排行榜
    public reqRank(): void {
        let settingcfg = SettingConfig.instance.getSettingCFGById(ESettingConst.RANK_LEVEL);

        if (!settingcfg || this.player.level >= settingcfg.intValue) {
            let bodyObj = { level: RankMgr.instance.toClientLevel, power: RankMgr.instance.toClientPower };
            this.player.send(CmdID.s2c_rank_req_ack, bodyObj);
        }
    }

    public reqLevelRank(): void {
        let settingcfg = SettingConfig.instance.getSettingCFGById(ESettingConst.RANK_LEVEL);

        if (!settingcfg || this.player.level >= settingcfg.intValue) {
            // let bodyObj = {level:RankMgr.instance.toClientLevel, power:RankMgr.instance.toClientPower};
            this.player.send(CmdID.s2c_rank_req_level_ack, { level: RankMgr.instance.toClientLevel });
        }
    }

    public reqPowerRank(): void {
        let settingcfg = SettingConfig.instance.getSettingCFGById(ESettingConst.RANK_LEVEL);

        if (!settingcfg || this.player.level >= settingcfg.intValue) {
            // let bodyObj = {level:RankMgr.instance.toClientLevel, power:RankMgr.instance.toClientPower};
            this.player.send(CmdID.s2c_rank_req_power_ack, { power: RankMgr.instance.toClientPower });
        }
    }

    public reqShenqingMobai(): void {
        let settingcfg = SettingConfig.instance.getSettingCFGById(ESettingConst.RANK_MOBAI);

        if (!settingcfg || this.player.level >= settingcfg.intValue) {
            RankMgr.instance.shenQinMobai(this.player);

            this.player.send(CmdID.s2c_rank_sync_mobai, RankMgr.instance.toClientMobai);
        }
    }

    public reqSyncMobai(): void {
        let settingcfg = SettingConfig.instance.getSettingCFGById(ESettingConst.RANK_MOBAI);

        if (!settingcfg || this.player.level >= settingcfg.intValue) {
            this.player.send(CmdID.s2c_rank_sync_mobai, RankMgr.instance.toClientMobai);
        }
    }

    /**矿洞信息 */
    public reqMineAreaInfo(): void {
        if (this.player) {
            let mineArea = MineBase.instance.toClientMineArea(this.player.roleid);
            this.player.send(CmdID.s2c_minearea_info, { mineinfo: mineArea, energy: this.player.playerEnergy.value, cd: MineBase.UPDATE_CD });
        }
    }
    /**矿洞信息 */
    public reqMinePitInfo(data: any): void {
        let mineInfo = MineBase.instance.toClientMine(data.quality);
        if (this.player && mineInfo != "") this.player.send(CmdID.s2c_minepit_info, { mineinfo: mineInfo });
    }
    /**矿洞占领 */
    public reqMineOccupy(data: any): void {
        if (this.player) MineBase.instance.onMineOccupy(data.index, this.player);
    }
    /**开启消息 */
    public reqMinePitMsg(data: any) {
        if (this.player) MineBase.instance.onMinePitMsg(data.type, this.player.roleid);
    }
    /**放弃矿洞 */
    public reqMinePitGiveUp(data: any) {
        if (this.player) MineBase.instance.onMinePitGiveup(data.id, this.player.roleid);
    }
    /**查询矿坑 */
    public reqMinePitPlayer(data: any) {
        if (this.player) MineBase.instance.onMinePitPlayer(data.id, this.player);
    }
    /**实名认证 */
    public reqAuthor(data: any) {
        if (this.player) this.player.onAuthor(data);
    }
    //-----------------------------------------------------------------------------------------
    protected onDestroy(): void {
        // Logger.debug(`玩家[${this.player?.roleid}:${this.player?.name}]SOCKET断开连接:AgentID[${this.id}]`);

        if (this.player) {
            this.player.removeAllListeners(CmdID.c2s_heartbeat_ack);
            this.player.setAgent(null);
            this.player = null;
        }

        AgentMgr.shared.delAgent(this.id);

        super.onDestroy();
    }
}
