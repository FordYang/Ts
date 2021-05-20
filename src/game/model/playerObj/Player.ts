import { IProfessionCFG } from "../../config/cfg/ProfessionCFG";
import { ItemConfig } from "../../config/ItemConfig";
import { LevelUpConfig } from "../../config/LevelUpConfig";
import MapConfig from "../../config/MapConfig";
import { ProfessionConfig } from "../../config/ProfessionConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import { ELiveingType, ERichesType, EMapType, EQuality, eGuideStage } from "../../consts/EGame";
import { EItemKey, EItemType } from "../../consts/EItem";
import { COINAWARDS, EEQuipPart, ePrerogativeTime, ePrerogativeType, EProfessionType } from "../../consts/ERole";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import TimeUtil from "../../gear/TimeUtil";
import Agent from "../../network/Agent";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import RoleAttr from "../attachAttr/RoleAttr";
import Bag from "../players/Bag";
import RoleJingmaiEntity from "../players/RoleJingmaiEntity";
import RoleMailEntity from "../players/RoleMailEntity";
import RolePart from "../players/RolePart";
import RoleKillMonsterEntity from "../players/RoleKillMonsterEntity";
import RoleTujianEntity from "../players/RoleTujianEntity";
import Skill from "../players/Skill";
import SkillMgr from "../players/SkillMgr";
import BattleObj from "./BattleObj";
import PlayerMgr from "./PlayerMgr";
import RoleShopEntity from "../players/RoleShopEntity";
import DayMap, { EDayMapType } from "../players/DayMap";
import RoleBossEntity from "../players/RoleBossEntity";
import Setting from "../players/Setting";
import Item from "../players/Item";
import RoleQianEntity from "../players/RoleQianEntity";
import RoleYyShop from "../players/RoleYyShop";
import BlackSmith from "../players/BlackSmith";
import RolePayEntity from "../players/RolePayEntity";
import Prerogative from "../players/Prerogative";
import PlayerEvent from "../../consts/PlayerEvent";
import RoleDropMaxEntity from "../players/RoleDropMaxEntity";
import CompositeRoleAttr from "../attachAttr/CompositeRoleAttr";
import Exchange from "../players/Exchange";
import Lilian from "../players/LiLian";
import JiJin from "../players/JiJin";
import FightingRoom from "../../fighting/FightingRoom";
import RoleOffTrustEntity from "../players/RoleOffTrustEntity";
import SocketLog from "../../network/SocketLog";
import { ShopConfig } from "../../config/ShopConfig";
import RankMgr from "../../mgr/RankMgr";
import { TotalRoleAttr } from "../attachAttr/TotalRoleAttr";
import DBUtil from "../../gear/DBUtil";
import mysql from "mysql";
import DBForm from "../../utils/DBForm";
import { RoleShenQiEntity } from "../players/RoleShenQiEntity";
import { EHeroAttrType } from "../../consts/EHeroAttrType";
import MineBase from "../../activity/mining/MineBase";
import AuthorMgr from "../../mgr/AuthorMgr";
import GameUtil from "../../core/GameUtil";
import GTimer from "../../common/GTimer";
import GameConf from "../../../conf/GameConf";
import { RoleTaskEntity } from "../players/RoleTaskEntity";
import PayRecord from "../../dbrecord/PayRecord";

/**
 * 玩家类
 */
export default class Player extends BattleObj {
	// 帐号索引
	account: number = 0;
	// 登录的账号
	accountid: string = "";
	// 角色编码
	roleid: number = 0;
	/** 队伍ID */
	public teamId: number;
	// 所在服务器
	serverid: number = 0;
	// 连接器
	agent: Agent;
	// 状态
	state: number;
	/**金币 */
	private _coin: number;
	/**元宝 */
	yuanbao: number;
	/**体力 day,value,cooling*/
	playerEnergy: any;
	/**战力 */
	combat: number;
	// 职业
	profession: number;
	/**创建时间 */
	create_date: number;
	/**离线时间 */
	offlineTimer: NodeJS.Timeout;
	/**离线时间戳 */
	lastonline_time: number;
	// 是否读档完毕
	loaded: boolean;
	/**背包 */
	bag: Bag;
	// 每日限制
	dayMap: DayMap;
	// 登录次数
	logintimes: number;
	/**技能管理 */
	public skillMgr: SkillMgr;
	/**商城 */
	private shopEntity: RoleShopEntity;
	/**装备槽位 */
	public rolePart: RolePart;
	/**云游商城 */
	public roleyyshop: RoleYyShop;
	/**图鉴 */
	public tujianEntity: RoleTujianEntity;
	/** 任务数据  */
	public killMonsterEntity: RoleKillMonsterEntity;
	/** 经脉 */
	public jingmaiEntity: RoleJingmaiEntity;
	/** 邮件 */
	public mailEntity: RoleMailEntity;
	/** Boss */
	public bossEntity: RoleBossEntity;
	/** 签到 */
	public qiandaoEntity: RoleQianEntity;
	/** 掉落计数 */
	public dropmaxEntity: RoleDropMaxEntity;
	/**玩家设置 */
	public setting: Setting;
	/** 基础属性 */
	protected _baseAttr: RoleAttr;
	/**铁匠铺 */
	protected blackSmith: BlackSmith;
	/**强化 */
	public professionCfg: IProfessionCFG;
	/** 支付 */
	public payEntity: RolePayEntity;
	/**解锁地图块 */
	protected mapUnlock: number[];
	/**引导阶段 */
	protected guideStage: number;
	/**珍宝 */
	public zhenbaoId: string[];
	/**领取列表 */
	public taskReceived: number[];
	/**特权 */
	public prerogative: Prerogative;
	/**历练 */
	public lilian: Lilian;
	/**洗练次数 */
	public xilian: number;
	/**兑换码 */
	public exchange: Exchange;
	/**基金 */
	public jijin: JiJin;
	/** */
	public dbDirty: boolean = true;
	/** 战斗实体 */
	public fightingRoom: FightingRoom;

	/**　离线托管 */
	public offTrustEntity: RoleOffTrustEntity;
	/** 任务系统  */
	public taskEntity: RoleTaskEntity;


	/** 神器 */
	public shenqiEntity: RoleShenQiEntity;

	/** 合成总属性 */
	public totalAttr: TotalRoleAttr;

	/**在线时长 */
	private loginTime: number = 0;

	/** 神器纯度 */
	private shenqiMoney: number = 0;

	/**当天累计时间 */
	private online_date: number = 0;

	constructor() {
		super();

		this.teamId = 1;

		this.agent = null;
		this.state = 1;
		this.living_type = ELiveingType.PLAYER;
		this.profession = EProfessionType.UNKNOW;
		this._coin = 0;
		this.yuanbao = 0;
		this.offlineTimer = null;
		this.loginTime = Date.now();
		this.xilian = 0;
		this.online_date = 0;

		this.mapUnlock = [];
		this.zhenbaoId = [];
		this.taskReceived = [];
		this.guideStage = eGuideStage.introduce;
		/**是否加载完毕，玩家进入了场景 */
		this.loaded = false;
		this.create_date = 0;

		this.playerEnergy = { day: new Date().getDate(), value: 480, cooling: false };

		this.on(PlayerEvent.HERO_FIGHT_ATTR_CHANGE, () => {
			RankMgr.instance.updatePower(this);

			this.emit(PlayerEvent.HERO_POWER_CHANGE, this.totalAttr.getFighting());
		});
	}

	public get money(): number {
		return this._coin;
	}

	private setCoin(val: number) {
		if (this._coin !== val) {
			this._coin = val;

			this.emit(PlayerEvent.HERO_COIN_CHANGE, val);
		}
	}

	public get online(): boolean {
		return !!this.agent;
	}

	public get fighting(): number {
		return this.totalAttr.getFighting();
	}

	public get learnSkillIdList(): number[] {
		return this.skillMgr.learnSkillIdList;
	}

	public get passBuffIdList(): number[] {
		return this.shenqiEntity.passBuffIdList;
	}

	/**离线时长 */
	private get offlineTime(): number {
		return Date.now() - this.lastonline_time;
	}

	public addShenQiMoney(value: number): void {
		if (value) {
			this.shenqiMoney += value;

			let sql = DBUtil.createUpdate('cy_role', { shenqiMoney: this.shenqiMoney }, { role_id: this.roleid });
			DBForm.instance.query(sql);

			this.send(CmdID.s2c_sync_hero_attr, { list: [{ attrId: EHeroAttrType.SHEN_QI_MONEY, value: this.shenqiMoney }] });
		}
	}

	public getShenQiMoney(): number {
		return this.shenqiMoney;
	}

	private initEntity(): void {
		/**背包 */
		this.bag = new Bag(this);
		/**装备 */
		this.rolePart = new RolePart(this);
		/**特权 */
		this.prerogative = new Prerogative(this);
		/**限购控制 */
		this.dayMap = new DayMap(this);
		/**历练 */
		this.lilian = new Lilian(this);

		this.fightingRoom = new FightingRoom(this);

		this.skillMgr = new SkillMgr(this);

		this.setting = new Setting(this);

		this.blackSmith = new BlackSmith(this);

		this.roleyyshop = new RoleYyShop(this);

		this.jijin = new JiJin(this);
		this.exchange = new Exchange(this);

		//图鉴
		this.tujianEntity = new RoleTujianEntity(this);
		this.killMonsterEntity = new RoleKillMonsterEntity(this);
		this.jingmaiEntity = new RoleJingmaiEntity(this);
		this.shenqiEntity = new RoleShenQiEntity(this);

		this.taskEntity = new RoleTaskEntity(this);

		this.bossEntity = new RoleBossEntity(this);
		this.mailEntity = new RoleMailEntity(this);
		this.qiandaoEntity = new RoleQianEntity(this);
		this.dropmaxEntity = new RoleDropMaxEntity(this);
		/** 支付 */
		this.payEntity = new RolePayEntity(this);
		this.shopEntity = new RoleShopEntity(this);

		// 离线托管
		this.offTrustEntity = new RoleOffTrustEntity(this);

		this._baseAttr = new RoleAttr();
		this.totalAttr = new TotalRoleAttr();
	}

	public setLevel(level: any) {
		let tempLv = this._level;

		this._baseAttr.setLv(level);

		super.setLevel(level);

		if (this.level !== tempLv) {
			RankMgr.instance.updateLevel(this);

			this.emit(PlayerEvent.HERO_LEVEL_CHANGE);
		}
	}

	// 从数据库中读档
	public setDB(data: any): Promise<void> {
		this.mapid = data.mapid;
		this.state = data.state;
		this.exp = data.role_exp;
		this.setCoin(data.money);
		this.name = data.role_name;
		this.yuanbao = data.yuanbao;
		this.account = data.account;
		this.roleid = data.role_id;
		this._level = data.role_level;
		this.serverid = data.server_id;
		this.accountid = data.account_id;
		this.profession = data.profession;
		this.logintimes = data.logintimes;
		this.online_date = data.online_date;
		this.create_date = new Date(data.create_date).getTime();
		this.lastonline_time = new Date(data.lastonline).getTime();
		/**洗练 */
		if (data.xilian) this.xilian = data.xilian;
		/**珍宝 */
		if (data.zhenbaoId) this.zhenbaoId = DataUtil.jsonBy(data.zhenbaoId);
		/**历练 */
		if (data.taskReceived) this.taskReceived = DataUtil.jsonBy(data.taskReceived);
		/**引导 */
		if (data.guideStage >= eGuideStage.introduce) this.guideStage = data.guideStage;
		/**地图块 */
		if (data.mapUnlock) this.mapUnlock = DataUtil.jsonBy(data.mapUnlock);
		/**体力 */
		if (data.energy) this.updateEnergy(data.energy);
		this.shenqiMoney = data.shenqiMoney;

		if (!this.loaded) { this.initEntity(); }

		this.levelCfg = LevelUpConfig.instance.getlevelupCfgById(this._level);
		this.professionCfg = ProfessionConfig.instance.getProfessionCfgById(this.profession);

		this.jijin.setDB(data.jijin);

		this.exchange.setDB(data.duihuanma);

		this.rolePart.setIntensityDB(data.intensify);

		this._baseAttr.setPlayerCfg(this.professionCfg, this.level);

		this.totalAttr.setProfession(this.profession);
		this.totalAttr.addChildAttr(this._baseAttr);

		/**技能 */
		let skilldata = data.skilldata;
		this.skillMgr.initSkill();
		this.skillMgr.setSkill(skilldata);

		this.tujianEntity.deserializeDB(data.tujian);
		this.killMonsterEntity.deserializeDB(data.kill_monster);
		this.jingmaiEntity.deserialize(JSON.parse(data.jingmai));
		this.bossEntity.deserialize(data.boss);
		this.shenqiEntity.deserializeDB(data.shenqi);

		this.qiandaoEntity.deserializeDB(data.qiandao);

		this.dropmaxEntity.deserialize(data.dropmax);

		this.totalAttr.addChildAttr(this.tujianEntity.attachAttr);
		this.totalAttr.addChildAttr(this.jingmaiEntity.attachAttr);
		this.totalAttr.addChildAttr(this.rolePart.totalAttr);
		this.totalAttr.addChildAttr(this.skillMgr.totalAttr);
		for (let type in this.shenqiEntity.attachAttrMap) {
			this.totalAttr.addChildAttr(this.shenqiEntity.attachAttrMap[type]);
		}
		this.payEntity.deserializeDB(data.pay, data.payshouchong, data.is_pay === 1);

		this.shopEntity.deserializeDB(data.shop);

		this.bag.setDB(data.bag);

		this.setting.setDB(data.setting);

		this.blackSmith.setDB(data.blackSmith);

		this.roleyyshop.setDB(data.yyshop);

		this.prerogative.setDB(data.prerogative);
		/**每日更新 */
		this.dayMap.setDB(data.dayMap);

		this.offTrustEntity.deserializeRoleDB(data.off_trust)

		this.loaded = true;

		this.onReportSecordDay(data.create_date, data.lastonline);

		/**检查防沉迷 */
		this.checkFangChenMi();

		let taskData = data.task;
		return new Promise((resolve) => {
			DB.searchPlayerItem(this.roleid, (code: number, data: any) => {
				// Logger.debug(`玩家[${this.roleid}]初始化背包成功`);
				if (code == ErrorConst.SUCCEED) {

					this.bag.setItemDB(data);

					//首次赠送
					if (this.logintimes == 0) {
						this.bag.initGift();
					}

					this.logintimes++;
					DB.updateLoginTimes(this.logintimes, this.roleid);
					// Logger.debug(`玩家[${this.roleid}]初始化进入游戏完成`);

					this.taskEntity.deserializeDB(taskData);

					resolve();
				}
			});
		});
	};

	/**加体力 */
	public addEnergy(value: number) {
		this.playerEnergy.value += value;
		if (this.playerEnergy.value > 1000) this.playerEnergy.value = 1000;
		MineBase.instance.update_energy(this.roleid, this.playerEnergy.value);
	}

	/**每日更新 */
	public everyDayReset() {

		/**是否更新体力 */
		this.updateEnergy(DataUtil.toJson(this.playerEnergy, ""));

		this.online_date = 0;
	}

	/**能量 */
	private updateEnergy(data: any) {
		let energyinfo = DataUtil.jsonBy(data);
		let localDay = new Date().getDate();
		if (energyinfo.day != localDay) {
			if (!energyinfo.value) energyinfo.value = 0;
			energyinfo.value += 480;
			energyinfo.day = localDay;
			if (energyinfo.value > 1000) energyinfo.value = 1000;
		}
		this.playerEnergy = energyinfo;
		this.playerEnergy.cooling = false;

		MineBase.instance.update_energy(this.roleid, this.playerEnergy.value);

		let sql = `UPDATE cy_role SET energy = '${DataUtil.toJson(this.playerEnergy)}' WHERE role_id = ${this.roleid};`;
		DB.updatePlayerEnergy(sql);
	}

	/**记录珍宝id */
	public recordZhenbaoId(idStr: string) {
		if (this.zhenbaoId.indexOf(idStr) == -1) this.zhenbaoId.push(idStr);
		let sql = `UPDATE cy_role SET zhenbaoId = '${DataUtil.toJson(this.zhenbaoId, "[]")}' WHERE role_id = ${this.roleid};`;
		this.saveItemSQL(sql);
		this.send(CmdID.s2c_zhenbao_change, {
			zhenbao: this.zhenbaoId
		});
	}

	public traceClient(msg: string): void {
		this.send(CmdID.s2c_trace, { msg: msg });
	}

	private offlineTimeId: NodeJS.Timeout;
	/**设置代理 */
	public setAgent(agent: Agent): void {
		clearTimeout(this.offlineTimeId);

		if (!this.isDispose) {
			if (this.agent && agent && this.agent != agent) {
				Logger.debug(`玩家[${this.roleid}:${this.name}]在其他设备登录!`);
				this.agent.otherLogin();
			}

			this.agent = agent;
			if (!this.agent) {
				// 离线
				this.fightingRoom.stop();
				this.lastonline_time = Date.now();

				let isTrust = this.offTrustEntity.checkOffTrust();
				if (isTrust) {
					Logger.debug(`玩家[${this.roleid}:${this.name}]离线托管`);
				}
				else {
					this.destroy();
				}
			}
			else {
				// Logger.debug(`玩家[${this.roleid}:${this.name}]登录成功`);
			}
		}
		else {
			Logger.error(`玩家[${this.roleid}:${this.name}]登录异常`);
		}
	}

	/**填充部位 */
	public setPartDB(): void {
		this.rolePart.setPartDB();
	}

	// 玩家登录
	public playerLogined(): void {
		this._mapId = 0;
		this.mailEntity.readDB();

		if (this.offlineTimer) {
			TimeUtil.cancelDelay(this.offlineTimer);
			this.offlineTimer = null;
		}

		this.send(CmdID.s2c_login,
			{
				code: ErrorConst.SUCCEED,
				info: this.toClient(),
			});

		// if (this.offTrustEntity.inTrust && this.fightingRoom.mapcfg)
		// {
		// 	this.mapid = this.fightingRoom.mapcfg.id;
		// }
		this.offTrustEntity.loginCheck();

		RankMgr.instance.updateLevel(this);
		RankMgr.instance.updatePower(this);

		RankMgr.instance.checkMobaiNotice(this);

		// console.log(this.totalAttr.toString(), "\n", this.skillMgr._combat);
	}

	// 计算在线时长
	public calcOnlineTime() {
		let time = Date.now() - this.loginTime;
		let days = Math.floor(time / (24 * 3600 * 1000)); //相差天数
		let leave1 = time % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
		let hours = Math.floor(leave1 / (3600 * 1000)); // 相差小时数
		let leave2 = leave1 % (3600 * 1000);  //计算小时数后剩余的毫秒数
		let minutes = Math.floor(leave2 / (60 * 1000)); // 相差分钟数
		let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
		let seconds = Math.round(leave3 / 1000); // 相差秒数
		Logger.info(`玩家[${this.roleid}:${this.name}]在线时长:${days}天${hours}小时${minutes}分钟${seconds}秒`);
	}

	/**获取战斗 */
	public getCombat() {
		let fight = this.fighting + this.skillMgr._combat;
		return fight;
	}

	private saveIdx: number = 0;
	private autoSave(): void {
		if (this.saveIdx++ > 17) {
			this.saveIdx = 0;

			this.saveAll();
		}
	}

	protected onDestroy(): void {
		PlayerMgr.shared.delPlayer(this.roleid);

		this.execSaveAll(true);

		clearTimeout(this.offlineTimeId);

		if (this.agent) {
			this.agent.destroy();
			this.agent = null;
		}

		this.calcOnlineTime();

		if (this.offlineTimer) {
			TimeUtil.cancelDelay(this.offlineTimer);
			this.offlineTimer = null;
		}
		this.roleyyshop.destroy();
		this.roleyyshop = null;
		this.payEntity.destroy();
		this.payEntity = null;
		this.killMonsterEntity.destroy();
		this.killMonsterEntity = null;
		this.taskEntity.destroy();
		this.taskEntity = null;
		this.tujianEntity.destroy();
		this.tujianEntity = null;
		this.mailEntity.destroy();
		this.mailEntity = null;
		this.bossEntity.destroy();
		this.bossEntity = null;
		this.qiandaoEntity.destroy();
		this.qiandaoEntity = null;
		this.dropmaxEntity.destroy();
		this.dropmaxEntity = null;
		this.fightingRoom.destroy();
		this.fightingRoom = null;

		this.jingmaiEntity.destroy();
		this.jingmaiEntity = null;

		this.shenqiEntity.destroy();
		this.shenqiEntity = null;

		this.offTrustEntity.destroy();
		this.offTrustEntity = null;

		this.shopEntity.destroy();
		this.shopEntity = null;

		this.prerogative.destroy();
		this.prerogative = null;
		this.dayMap.destroy()
		this.dayMap = null;

		super.onDestroy();
	}

	//------------------------------------------------------------------------------------------
	private inTheSaveDB: boolean = false;
	private saveAll(): Promise<ErrorConst> {
		return new Promise((resolve) => {
			if (this.loaded && this.isCloseSave === false && this.dbDirty && this.isDispose === false && this.inTheSaveDB === false) {
				this.inTheSaveDB = true;

				this.saveFightAttrDB();

				this.update_online();
				/**检查是否存档完成 玩家,邮件 */
				this.mapid = this.mapid;
				/**数据库 */
				let dbinfo = {
					account: this.account,
					role_name: this.name,
					mapid: this.mapid,
					combat: this.getCombat(),
					money: this.money,
					yuanbao: this.yuanbao,
					role_exp: this.exp,
					role_level: this.level,
					state: this.state,
					account_id: this.accountid,
					server_id: this.serverid,
					profession: this.profession,
					logintimes: this.logintimes,
					xilian: this.xilian,
					online_date: this.online_date,

					bag: this.bag.toDB(),
					jijin: this.jijin.toDB(),
					dayMap: this.dayMap.toDB(),
					setting: this.setting.toDB(),
					yyshop: this.roleyyshop.toDB(),
					duihuanma: this.exchange.toDB(),
					skilldata: this.skillMgr.toDB(),
					intensify: this.rolePart.toDB(),
					blackSmith: this.blackSmith.toDB(),
					prerogative: this.prerogative.toDB(),
					guideStage: this.guideStage,
					energy: DataUtil.toJson(this.playerEnergy, "{}"),
					zhenbaoId: DataUtil.toJson(this.zhenbaoId, "[]"),
					taskReceived: DataUtil.toJson(this.taskReceived),
					mapUnlock: DataUtil.toJson(this.mapUnlock, '[]')
				};

				let roleid = this.roleid;
				let rolename = this.name;
				DB.savePlayerInfo(this.roleid, dbinfo, (code: number, msg: string) => {
					this.inTheSaveDB = false;

					let info = `存档:[${roleid}:${rolename}]角色存档`;
					if (code == ErrorConst.SUCCEED) {
						info += `成功!`;
						// Logger.debug(info);
					}
					else {
						info += `失败:[${msg}]!`;

						Logger.warn(info);
					}
					resolve(code);
				});
			}
			else {
				// Logger.debug(`[${this.roleid}:${this.name}]没有修改可保存`);
				resolve(ErrorConst.SUCCEED);
			}
		});
	}

	public saveFightAttrDB() {
		let attr = this.totalAttr;
		let obj =
		{
			roleId: this.roleid,
			fighting: this.getCombat(),
			skillIdList: DataUtil.toJson(this.learnSkillIdList),
			hp: attr.hp,
			mp: attr.mp,
			minzs: attr.minzs,
			maxzs: attr.maxzs,
			minfs: attr.minfs,
			maxfs: attr.maxfs,
			minds: attr.minds,
			maxds: attr.maxds,
			minac: attr.minac,
			maxac: attr.maxac,
			atkSpeed: attr.atkSpeed,
			lucky: attr.lucky,
			fixeddamage: attr.fixeddamage,
			fixedac: attr.fixedac,
			hit: attr.hit,
			evade: attr.evade,
			critical: attr.critical,
			tenacity: attr.tenacity,
			adddamage: attr.adddamage,
			addac: attr.addac,
			crtdamage: attr.crtdamage,
			absorbhp: attr.absorbhp,
			absorbmp: attr.absorbmp,
			passBuffIdList: DataUtil.toJson(this.passBuffIdList),
		}

		let sql = DBUtil.createInsert('cy_role_attr', obj, 'ON DUPLICATE KEY UPDATE ' + mysql.escape(obj));
		return DBForm.instance.asyncQuery(sql);
	}

	private isCloseSave: boolean = false;
	// 全部存档
	public execSaveAll(isLast: boolean): Promise<ErrorConst> {
		if (this.isCloseSave === false) {
			this.offTrustEntity.saveDB();

			let p = this.saveAll();

			if (isLast) {
				this.isCloseSave = true;
			}

			return p;
		}
		return Promise.resolve(ErrorConst.SUCCEED);
	}

	/**缓存下上线离线经验 */
	cacheOfTime: number = 1;
	//------------------------------------------------------------------------------------------
	// 回客户端
	toClient(): any {
		let obj: any = super.toObj();
		obj.account = this.account;
		obj.accountid = this.accountid;
		obj.roleid = this.roleid;
		obj.serverid = this.serverid;
		obj.profession = this.profession;
		obj.rolelevel = this.level;
		obj.roleexp = this.exp;
		obj.mapid = this.mapid;
		obj.name = this.name;
		obj.money = this.money;
		obj.yuanbao = this.yuanbao;
		obj.uid = this.onlyid;
		obj.xilian = this.xilian;
		obj.guideStage = this.guideStage;
		obj.taskReceived = this.taskReceived;
		obj.zhenbaoId = this.zhenbaoId;
		obj.lastonline = this.offlineTime;
		obj.createdate = this.create_date;
		obj.isPay = this.payEntity.isPay;
		obj.tujian = this.tujianEntity.serializeClient();
		obj.killmonster = this.killMonsterEntity.serializeTujianClient();
		obj.killtotalmonster = this.killMonsterEntity.serializeTotalClient();
		obj.task = this.taskEntity.serializeClien();
		obj.jingmai = this.jingmaiEntity.serializeClient();
		obj.shenqi = this.shenqiEntity.serializeClient();
		obj.boss = this.bossEntity.serializeClient();
		obj.shop = this.shopEntity.serializeClient();
		obj.pay = this.payEntity.serializeClient();
		obj.payshouchong = this.payEntity.serializeShouChongClient();
		obj.qiandao = this.qiandaoEntity.serializeClient();
		obj.intensify = this.rolePart.toClient();
		obj.dayMap = this.dayMap.toDB();
		obj.setting = this.setting.toDB();
		obj.yyshop = this.roleyyshop.toDB();
		obj.prerogative = this.prerogative.toDB();
		obj.mapUnlock = DataUtil.toJson(this.mapUnlock, "[]");
		obj.jijinVip = this.jijin.toDB();
		obj.shenqiMoney = this.shenqiMoney;

		this.cacheOfTime = this.offlineTime;

		return obj;
	}

	/**获取道具数量 */
	getItemCount(itemId: number): number {
		let itemCfg = ItemConfig.instance.getItemCfgById(itemId);
		if (itemCfg == null) { // 无此道具
			Logger.warn(`玩家[${this.roleid}:${this.name}]获得物品[${itemId}]找不到!`);
			return 0;
		}

		if (itemId == EItemKey.itemid_103035) {
			// 金币
			return this.money;
		}
		else if (itemId == EItemKey.itemid_103037) {
			return this.yuanbao;
		}

		return this.bag.getCountByItemId(itemId);
	}

	/**回复设置
	 * 每次受到伤害时候触发
	 */
	verifySettings(hpPercent: number, mpPercent: number) {
		// SKLogger.debug("verifySettings: " + hpPercent + " mpPercent: " + mpPercent);
		hpPercent *= 100;
		mpPercent *= 100;
		/**回血 */
		if (this.setting.lifeRevert) {
			if (this.setting.lifePercent > hpPercent) {
				this.bag.useItem(this.setting.lifeId, 1);
			}
		}
		/**回蓝 */
		if (this.setting.magicRevert) {
			if (this.setting.magicPercent > mpPercent) {
				this.bag.useItem(this.setting.magicId, 1);
			}
		}
		/**特效药 */
		if (this.setting.specialRevert) {
			if (this.setting.specialPercent > hpPercent) {
				this.bag.useItem(this.setting.specialId, 1);
			}
		}
	}

	//----------------------------------------------------------------------------------------------------------------------------------------
	public bossDie(bossId: number): void {
		this.bossEntity.bossDie(bossId);

		process.nextTick(() => {
			this.emit(PlayerEvent.FIGHTING_BOSS_DIE, bossId);
		});
	}

	/**矿脉消息 */
	updateEnergyDecrease(decrease: number) {
		if (this.playerEnergy.value >= decrease) {
			this.playerEnergy.value -= decrease;
		}
	}

	/**战斗掉落 */
	fightingDrop(uEid: number, monsterId: number, monsterQuality: number, exp: number, extraExp: number, gold: number, extraGold: number,
		droplist: { itemId: number, value: number, count: number, quality: number, tequan: boolean }[]) {
		let setValue = this.setting;
		let reclaim_list = [];

		let dropEquips: Item[] = [];
		let dropItems: any = [];
		for (let drop of droplist) {
			let iConfigs = ItemConfig.instance.getItemCfgById(drop.itemId);
			if (iConfigs.type == EItemType.equip) {
				let items = this.bag.createItem(drop.itemId, drop.quality);
				items.tequan = drop.tequan;
				dropEquips.push(items);
			}
			else {
				dropItems.push(drop);
			}
		}

		for (let item of dropEquips) {/**检查自动回收 */
			if (item.iConfigs.type == EItemType.equip) {
				/**检查自动回收 */
				if (setValue.noProfession && item.iConfigs.profession != this.profession && item.iConfigs.profession != 0) {
					/**是不是非本职业 */
					reclaim_list.push(item);
				} else {
					let setReclaim = false;
					if (item.isSpecialAffix && setValue.specialAffix) {
						/**极品词缀不回收 */
						setReclaim = false;
					} else if (item.iConfigs.needlevel < setValue.recliamLevel && setValue.recliamState) {
						/**开启大于等级回收 */
						setReclaim = true;
					} else if (item.isnonsuch && !setValue.nonsuch) {
						/**极品，并且不回收 */
						setReclaim = false;
					} else {
						switch (item.quality) {
							case EQuality.white:
								setReclaim = setValue.eWhite;
								break;
							case EQuality.green:
								setReclaim = setValue.eGreen;
								break;
							case EQuality.bule:
								setReclaim = setValue.eBule;
								break;
							case EQuality.purple:
								setReclaim = setValue.ePurple;
								break;
						}
					}
					if (setReclaim)
						reclaim_list.push(item);
				}
			}
		}

		/**从插入背包列表中移除掉 */
		let reclaimlist = [];
		let droplists = [];
		for (let reclaim of reclaim_list) {
			let index = dropEquips.indexOf(reclaim);
			if (index != -1) dropEquips.splice(index, 1);
			let _data = { itemId: reclaim.itemId, value: reclaim.quality, count: reclaim.count, quality: reclaim.quality, tequan: reclaim.tequan };
			reclaimlist.push(_data);
		}

		for (let drop of dropEquips) {
			let _data = { itemId: drop.itemId, value: drop.quality, quality: drop.quality, tequan: drop.tequan };
			droplists.push(_data);
		}
		for (let dropItem of dropItems) {
			let _data = { itemId: dropItem.itemId, value: dropItem.value };
			droplists.push(_data);
		}
		/**计算自动回收收益 */
		let bet = this.prerogative.ishuishou ? 1 : 0.5;
		let reclaimMoney = Math.ceil(this.bag.calculateEquipMoney(reclaim_list) * bet);
		let baseExp = 0;
		if (this.prerogative.iszhanshen) baseExp = exp * 0.1;
		extraExp += Math.ceil(baseExp);

		if (this.fangchenmi) {
			let cBet = this.fangchengmiBet;
			exp *= cBet;
			extraExp *= cBet;
			gold *= cBet;
			extraGold *= cBet;
			reclaimMoney *= cBet;
			if (cBet == 0) {
				droplists = [];
				reclaimlist = [];
			}
			this.send(CmdID.s2c_killmonster_msg, {
				uEid: uEid,
				exp: exp,
				addExp: extraExp,
				gold: gold,
				addGold: extraGold,
				droplist: droplists,
				reclaimlist: reclaimlist,
				reclaimgold: reclaimMoney,
				fangcm: cBet * 10
			});
		} else {
			this.send(CmdID.s2c_killmonster_msg, {
				uEid: uEid,
				exp: exp,
				addExp: extraExp,
				gold: gold,
				addGold: extraGold,
				droplist: droplists,
				reclaimlist: reclaimlist,
				reclaimgold: reclaimMoney,
				fangcm: 10
			});
		}

		let droptuoguan = [];
		/**填充道背包 */
		for (let iequip of dropEquips) {
			let addOk = this.addItem(iequip.itemId, 1, "击杀怪物", false, iequip);
			if (addOk) {
				droptuoguan.push(Object.assign({}, iequip));
			}
		}
		for (let item of dropItems) {
			this.addItem(item.itemId, item.value, "击杀怪物");
			droptuoguan.push(Object.assign({}, item));
		}
		this.offTrustEntity.killDrop(monsterId, monsterQuality, exp + extraExp, gold + extraGold + reclaimMoney, droptuoguan, reclaimlist);

		/**实际增加 */
		this.addExp(exp + extraExp);
		this.addMoney(ERichesType.Money, gold + extraGold + reclaimMoney, "击杀怪物", false);
	}

	//-----------------------------------------------------------------------------------------------------------------
	public addItemList(itemList: { itemId: number, count: number, quality: number }[], isNotice: boolean, source: string): boolean {
		let needGrid: number = 0;
		for (let itemObj of itemList) {
			if (itemObj.itemId !== EItemKey.itemid_103035 && itemObj.itemId !== EItemKey.itemid_103037 && itemObj.itemId !== EItemKey.itemid_103046) {
				needGrid++;
			}
		}

		if (this.bag.freeCount >= needGrid) {
			for (let itemObj of itemList) {
				this.addItem1(itemObj.itemId, itemObj.count, itemObj.quality || 1, source, isNotice);
			}
			return true;
		}
		return false;
	}

	/** 有好名字记得你们改下 */
	private addItem1(itemId: number, count: number, quality: number, source: string, isNotice = false) {
		let itemobj: Item;
		let itemCfg = ItemConfig.instance.getItemCfgById(itemId);
		if (!itemCfg) return;
		if (itemCfg.type == EItemType.equip) {
			itemobj = this.bag.createItem(itemId, count);
			itemobj.quality = quality;
		}
		this.addItem(itemId, count, source, isNotice, itemobj);
	}

	//-----------------------------------------------------------------------------------------------------------------
	/** 添加道具 
	 * item 当为装备的时候,要先把装备的所有属性创建出来
	 */
	addItem(itemId: number, count: number, source: string, isNotice = false, item?: Item, isImportance: boolean = false): boolean {
		count = DataUtil.numberBy(count);
		if (isNaN(count)) {
			Logger.warn(`玩家[${this.roleid}:${this.name}]:获得物品[${itemId}]数量无效!`);
			return false;
		}

		let itemCfg = ItemConfig.instance.getItemCfgById(itemId);
		if (itemCfg == null) { // 无此道具
			Logger.warn(`玩家[${this.roleid}:${this.name}]获得物品[${itemId}]找不到!`);
			return false;
		}

		/**添加物品 暂时所有缓存到背包*/
		return this.addBagItem(itemId, count, source, isNotice, item, isImportance);
	}

	/**
	 * item 当为装备的时候,要先把装备的所有属性创建出来
	 */
	private addBagItem(itemId: any, count: any, source: string, bNotice: any, item?: Item, isImportance: boolean = false) {
		if (itemId == EItemKey.itemid_103035) {
			this.addMoney(ERichesType.Money, count, source);
		} else if (itemId == EItemKey.itemid_103037) {
			this.addMoney(ERichesType.Yuanbao, count, source);
		}
		else if (itemId === EItemKey.itemid_103046) {
			this.addExp(count);
		}
		else {
			if (count > 0) {
				let iConfigs = ItemConfig.instance.getItemCfgById(itemId);
				if (iConfigs.type == EItemType.equip)
					return this.bag.addBagEquip(item);
				else
					return this.bag.addBagItem(itemId, count, isImportance);
			} else {
				this.bag.deleteBagItem(itemId, Math.abs(count));
			}
		}
		return true;
	}

	/**增加经验 */
	addExp(exp: number) {
		this.exp += exp;
		this.send(CmdID.s2c_you_exp, { exp: this.exp });
		this.checkUpgrade();

		if (exp) {
			RankMgr.instance.updateLevel(this);
		}
	}

	/**校验升级 */
	checkUpgrade() {
		if (this.level < BattleObj.MAX_LEVEL) {
			if (this.exp >= this.levelCfg.exp) {
				this.exp -= this.levelCfg.exp;
				this.setLevel(this.level + 1);

				/**连续升级---- */
				this.checkUpgrade();
				this.send(CmdID.s2c_you_exp, { exp: this.exp });
				this.send(CmdID.s2c_you_upgrade, { level: this.level });
			}
		}
	}

	// 加金币或者元宝
	addMoney(kind: ERichesType, count: number, msg: string, record: boolean = true) {
		count = Math.ceil(count);
		if (kind == ERichesType.Money) {
			this.setCoin(this.money + count);
			if (count != 0) {
				if (record)
					DB.setRecordMoney({ roleid: this.roleid, serverid: this.serverid, totalValue: this.money, changeValue: Math.abs(count), record: msg, state: count > 0 ? 1 : 0 });
				this.send(CmdID.s2c_you_money, {
					nKind: kind,
					nNum: this.money,
					nChange: count
				});
			}
			return;
		}
		if (kind == ERichesType.Yuanbao) {
			this.yuanbao += count;
			if (count != 0) {
				DB.setRecordYuanbao({ roleid: this.roleid, serverid: this.serverid, totalValue: this.yuanbao, changeValue: Math.abs(count), record: msg, state: count > 0 ? 1 : 0 });
				this.send(CmdID.s2c_you_money, {
					nKind: kind,
					nNum: this.yuanbao,
					nChange: count
				});
				// Logger.info(`玩家[${this.roleid}:${this.name}]元宝改变[${count}]，当前[${this.yuanbao}],消息:${msg}`);
			}
			return;
		}
	}

	/**地图 */
	changeMap(data: any) {
		let mapCfg = MapConfig.instance.getMapCfgById(data.mapid);
		if (!mapCfg) return;
		let type = data.type;
		if (type != 5) {
			if (this.getCombat() < mapCfg.limitpower)
				return this.send(CmdID.s2c_notice, { code: ErrorConst.COMBAT_NOT_ENOUGH, value: mapCfg.limitpower });
		}
		switch (type) {
			case 1:/**普通传送 */
				if (mapCfg) {
					this.sendChangeMap(mapCfg.id);
				}
				break;
			case 2:/**传送 可以使用特权的 */
				if (this.prerogative.sendMap) {
					this.sendChangeMap(mapCfg.id);
				} else {
					let ticket = this.bag.getCountByItemId(EItemKey.itemid_103036);
					if (ticket >= 1) {
						this.bag.deleteBagItem(EItemKey.itemid_103036, 1);

						this.sendChangeMap(mapCfg.id);
					} else {
						this.send(CmdID.s2c_notice, { code: ErrorConst.TRANSFER_FAILED });
					}
				}
				break;
			case 3:/**快捷回城 */
				let ticket = this.bag.getCountByItemId(EItemKey.itemid_103036);
				if (ticket >= 1) {
					this.bag.deleteBagItem(EItemKey.itemid_103036, 1);

					this.sendChangeMap(mapCfg.id);
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.TRANSFER_FAILED });
				}
				break;
			case 4:/**PK拉取角色进入地图 */
				this.sendChangeMap(mapCfg.id);
				break;
			case 5:/**死亡回城 */
				if (mapCfg) {
					this.sendChangeMap(mapCfg.id);
				}
				break;
			default:
				if (mapCfg) {
					this.sendChangeMap(mapCfg.id);
				}
				break;
		}
	}

	private sendChangeMap(mapid: number): void {
		this.mapid = mapid;
		if (this.mapid !== mapid) {
			this.startFight(false, this.mapid);
			this.emit(PlayerEvent.HERO_MAP_CHANGE, mapid);
		}
		this.send(CmdID.s2c_change_map, { mapid });
	}

	/**校验战斗 防止回了两次*/
	private _mapId: number = 0;
	checkFighting() {
		let mapCfg = MapConfig.instance.getMapCfgById(this.mapid);
		switch (mapCfg.type) {
			case EMapType.neutrally:
				this._mapId = this.mapid;
				this.startFight(false, this.mapid);
				break;
			// case EMapType.PK:
			case EMapType.battle:
			case EMapType.bossMap:
				// Logger.debug("切换战斗地图 校验战斗" + this._mapId + "理论上存在地图" + this.mapid);
				if (this._mapId == this.mapid) return;
				this._mapId = this.mapid;
				// Logger.debug("开启战斗地图");
				this.startFight(true, this.mapid);
				break;
		}
		this.emit(PlayerEvent.HERO_MAP_CHANGE, mapCfg.id);
	}

	/**开始战斗 */
	startFight(type: boolean, mapid: number, roleId?: number) {
		this.fightingRoom.stop();
		if (type) {
			this.fightingRoom.start(mapid, roleId);
			this.send(CmdID.s2c_skill_start_fighting);
			this.bossEntity.resetHp();
		}
	}

	/**数量 */
	onBagExpend(type: number) {
		this.bag.expendBag(type);
	}

	/**使用Item */
	onUseItem(data: any) {
		this.bag.useItem(data.itemId, data.count, data.skillId);
	}

	/**分解Item */
	onDecompoundItem(data: any) {
		this.bag.decompoundItem(data.itemId, data.count);
	}

	/**穿装备 */
	onWearEquip(data: any) {
		let item = this.bag.getItemByUUId(data.uuid);
		if (item) this.rolePart.wearEquip(item);
	}

	/**穿装备 */
	onTakeOffEquip(data: any) {
		let item = this.bag.getItemByUUId(data.uuid);
		if (item)
			this.rolePart.takeoffEquip(item);
	}

	/**替换装备 */
	replaceEquip(uuid: number, part: EEQuipPart) {
		let item = this.bag.getItemByUUId(uuid);
		if (item) this.rolePart.replaceEquip(item, part);
	}

	/**刷新设置 */
	onUpdateSetting(data: any) {
		this.setting.setDB(data.setting);
		let dbSetting = this.setting.toDB();
		let sql = `UPDATE cy_role SET setting = '${dbSetting}' WHERE role_id = ${this.roleid};`;
		this.saveItemSQL(sql);
	}

	/**强化 */
	onIntensify(data: any) {
		let isOk = this.rolePart.intensify(data.part);
		this.emit(PlayerEvent.HERO_INTENSIFY_CHANGE);
	}

	/**回收 */
	onReclaimEquip(data: any) {
		this.bag.onReclaimEquips(data.equipUids, data.type);
	}

	/**获取列表 */
	getBlackSmith() {
		this.send(CmdID.s2c_blacksmith, {
			itemlist: this.blackSmith.itemlist,
			buildlist: this.blackSmith.buildlist
		});
	}

	/**锻造 */
	buildByBlackSmith(data: any) {
		this.blackSmith.onBuilding(data);
	}

	/**刷新 */
	refreshBlackSmith(data: any) {
		switch (data.type) {
			case 1:
				if (this.yuanbao >= 25) {/**元宝 */
					this.addMoney(ERichesType.Yuanbao, -25, "铁匠铺刷新");
					this.blackSmith.refreshBuildlist();
					this.getBlackSmith();
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
				}
				break;
			case 2:
				if (this.dayMap.videoBuild < this.dayMap.videoBuildMax) {/**视频 */
					this.dayMap.updateDayMap(EDayMapType.videobuild);
					this.blackSmith.refreshBuildlist();
					this.getBlackSmith();
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.TIME_USE_UP });
				}
				break;
			default:
				break;
		}
	}

	/**同步地图 */
	onSyncMapInfo(data: any) {
		this.mapUnlock = DataUtil.jsonBy(data.mapunlock);
	}

	/**同步引导 */
	onSyncGuideInfo(data: any) {
		this.guideStage = DataUtil.jsonBy(data.guideStage);
	}

	/**云游商城 */
	onGetYYShop() {
		this.roleyyshop.sendYYshop();
	}

	/**刷新倍率 */
	onRefreshYYShop() {
		this.roleyyshop.onRefreshBet();
	}

	/**延长时间 */
	onDealyYYShop() {
		if (this.dayMap.roleyyshop < this.dayMap.roleyyshopMax) {
			this.roleyyshop.onDelayBet();
			this.dayMap.updateDayMap(EDayMapType.roleyyshop);
		} else {
			this.send(CmdID.s2c_notice, { code: ErrorConst.TIME_USE_UP });
		}
	}

	/**技能自动释放 */
	onSkillAuto(data: any) {
		this.skillMgr.onAuto(data.baseId, data.isauto);
	}

	/**充值变更 */
	changeDayRechargeMap(data: any): void {
		this.dayMap.setRechargeChange(data);
	}

	/**特权充值 充值卡*/
	onRechargePrerogative(type: ePrerogativeType, time: ePrerogativeTime) {
		this.prerogative.onRecharge(type, time);
	}

	/**特权金钱充值 */
	onRechargePrerogativeByMoney(configs: any) {
		this.prerogative.onRechargeByMoney(configs);
	}

	/**特权变更 */
	sendPrerogativeChanged() {
		this.send(CmdID.s2c_prerogative_change, {
			prerogative: this.prerogative.toDB()
		});
	}

	/**免广告 */
	sendMGGRechargeSuccess() {
		this.send(CmdID.s2c_prerogative_mgg, {});
	}

	//---------------------------------------------
	// 托管自动买药
	public trust_autoBuy(): void {
		if (this.bag.freeCount > 1) {
			let buyHpId = this.setting.lifeId;
			if (this.bag.getCountByItemId(buyHpId) < 2) {
				let hpshopcfg = ShopConfig.instance.getCfgByItemId(buyHpId);
				if (hpshopcfg) {
					let canBuyNum = Math.min(999, Math.floor(this.money / hpshopcfg.price) * hpshopcfg.oncenum);
					this.shopEntity.buy(hpshopcfg.id, hpshopcfg.items, Math.floor(canBuyNum / hpshopcfg.oncenum));
				}
			}

			let buyMpId = this.setting.magicId;
			if (this.bag.getCountByItemId(buyMpId) < 2) {
				let mpshopcfg = ShopConfig.instance.getCfgByItemId(buyMpId);
				if (mpshopcfg) {
					let canBuyNum = Math.min(999, Math.floor(this.money / mpshopcfg.price) * mpshopcfg.oncenum);
					this.shopEntity.buy(mpshopcfg.id, mpshopcfg.items, Math.floor(canBuyNum / mpshopcfg.oncenum));
				}
			}
		}
	}
	/**---------------------------------------------------------------------------------------------- */
	// 发送消息
	public send(cmdstr: string, obj?: any): void {
		if (this.agent) {
			this.agent.send(cmdstr, obj);
		}
		else {
			SocketLog.send(0, cmdstr, obj);
			// 机器人不发送消息
			// if (this.isRobot()) 
			// {
			// 	return;
			// }
			// Logger.debug(`玩家[${this.roleid}:${this.name}]已离线,消息[${event}:${obj}]不发送`);
		}
	}

	/**发消息 */
	sendBagInfo() {
		this.send(CmdID.s2c_bag_info, {
			code: ErrorConst.SUCCEED,
			baginfo: this.bag.toObj()
		});
	}

	/**技能数值 */
	sendSkillInfo() {
		this.send(CmdID.s2c_skills_info, {
			skills: this.skillMgr.toObj()
		});
	}

	//----------------------------------------------------------------------------------------
	// 图鉴 
	c2s_tujian_upgrade(data: { monsterId: number }): void {
		this.tujianEntity.c2sUpgrade(data);
	}

	c2s_jingmai_upgrade(data: { code: number, lv: number, xueweiId: number }): void {
		this.jingmaiEntity.c2sUpgrade(data);
	}

	/**--首充----------------------------------------------------------------------------------- */
	/**兑换money */
	c2s_exchange_money(type: number) {
		let curMoney = null;
		for (let coin of COINAWARDS) {
			if (this.level <= coin.lv) {
				curMoney = coin;
				break;
			}
		}
		switch (type) {
			case 1:
				if (this.dayMap.videoCoin < this.dayMap.videoCoinMax) {
					this.addMoney(ERichesType.Money, curMoney.coin, "每日看视频获取金币");
					this.dayMap.updateDayMap(EDayMapType.videoCoin);
					this.send(CmdID.s2c_notice, {
						code: ErrorConst.GET_REWARD_SUCCESS
					});
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.TIME_USE_UP });
				}
				break;
			case 2:
				if (this.yuanbao >= curMoney.cost) {
					this.addMoney(ERichesType.Money, curMoney.coin, "元宝兑换金币");
					this.addMoney(ERichesType.Yuanbao, -1 * curMoney.cost, "元宝兑换金币");
					this.send(CmdID.s2c_notice, {
						code: ErrorConst.EXCHANGE_SUCCESS
					});
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
				}
				break;
			case 3:
				if (this.yuanbao >= curMoney.cost * 10) {
					this.addMoney(ERichesType.Money, curMoney.coin * 10, "元宝兑换金币");
					this.addMoney(ERichesType.Yuanbao, -1 * curMoney.cost * 10, "元宝兑换金币");
					this.send(CmdID.s2c_notice, {
						code: ErrorConst.EXCHANGE_SUCCESS
					});
				} else {
					this.send(CmdID.s2c_notice, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
				}
				break;
		}
	}

	/**离线 */
	c2s_offline_awards(type: number) {
		let configs = LevelUpConfig.instance.getlevelupCfgById(this.level);
		if (!this.cacheOfTime) this.cacheOfTime = 0;
		let _minute = Math.ceil(this.cacheOfTime / 1000 / 60);
		let limitHuor = this.prerogative.ishuishou ? 12 : 6;
		let _maxlimit = 60 * limitHuor;
		if (_minute > _maxlimit) {
			_minute = _maxlimit;
		}
		let _exp = Math.ceil(configs.addexp / _maxlimit * _minute);
		let _gold = Math.ceil(configs.addgold / _maxlimit * _minute);
		let costYuanbao = Math.ceil(configs.costyuanbao / _maxlimit * _minute);
		this.update_online();
		switch (type) {
			case 1:/**免费 */
				this.cacheOfTime = 0;
				this.addExp(_exp);
				this.addMoney(ERichesType.Money, _gold, "离线免费金币奖励");
				this.send(CmdID.s2c_offline_awards, {
					code: ErrorConst.SUCCEED
				});
				break;
			case 2:/**视频双倍 */
				this.cacheOfTime = 0;
				this.addExp(_exp * 2);
				this.addMoney(ERichesType.Money, _gold * 2, "离线视频金币奖励");
				this.send(CmdID.s2c_offline_awards, {
					code: ErrorConst.SUCCEED
				});
				break;
			case 3:/**元宝五倍 */
				if (this.yuanbao >= costYuanbao) {
					this.cacheOfTime = 0;
					this.addExp(_exp * 5);
					this.addMoney(ERichesType.Money, _gold * 5, "元宝离线领取");
					this.addMoney(ERichesType.Yuanbao, -1 * costYuanbao, "元宝离线领取");
					this.send(CmdID.s2c_offline_awards, {
						code: ErrorConst.SUCCEED
					});
				} else {
					this.send(CmdID.s2c_notice, {
						code: ErrorConst.YUANBAO_NOT_ENOUGH
					});
				}
				break;
		}
	}

	/**领取特权 */
	c2s_prerogative_receive(type: number) {
		this.prerogative.onReceive(type);
	}

	/**锁装备 */
	c2s_lock_equip(uuid: number, type: number) {
		this.bag.updateItemLocker(uuid, type);
	}

	/**合成 */
	c2s_item_fuse(itemId: number, count: number) {
		this.bag.fuseItem(itemId, count);
	}

	/**历练 */
	c2s_lilian_received(lilianId: number, taskId: number) {
		this.lilian.onReceiveLiLian(lilianId, taskId);
	}

	/**通过职业区分首充奖励 */
	getSCEquip() {
		switch (this.profession) {
			case EProfessionType.ZHANSHI:
				return 205003;
			case EProfessionType.FASHI:
				return 205004;
			case EProfessionType.DAOSHI:
				return 205005;
		}
		return 0;
	}

	/**类型 */
	onReceivedShouChong() {
		if (this.payEntity.shouchong == 1) {
			if (this.bag.freeCount > 1) {
				this.payEntity.setShouChongState(2);
				let itemId = this.getSCEquip();
				let item: Item = this.bag.createCustomItem(itemId);
				this.bag.addBagEquip(item);
				this.addMoney(ERichesType.Money, 100000, "首充金币");
				this.addMoney(ERichesType.Yuanbao, 300, "首充元宝");
				this.send(CmdID.s2c_shouchong_receive, {
					code: ErrorConst.SUCCEED
				});
			} else {
				this.send(CmdID.s2c_notice, {
					code: ErrorConst.BAG_NOT_ENOUGH
				});
			}
		} else if (this.payEntity.shouchong > 1) {
			this.send(CmdID.s2c_notice, {
				code: ErrorConst.GOT_THING
			});
		} else {
			this.send(CmdID.s2c_notice, {
				code: ErrorConst.REWARD_NOT_EXIST
			});
		}
	}

	/**基金 */
	onReceiveJijin(lv: number, type: number) {
		this.jijin.onReceive(lv, type);
	}

	/**购买基金 */
	onBuyJijin() {
		this.jijin.onBuyVip();
	}
	//----------------------------------------------------------------------------------------
	// 支付
	public payOk(record: PayRecord): void {
		// 在线发
		this.payEntity.payOk(record);
	}

	//----------------------------------------------------------------------------------------
	onUpgrade(id: number) {
		/**技能升级 */
		this.skillMgr.onUpgrade(id);
	}

	/**洗练 */
	onRemakeEquip(uid: number, locks: number[]) {
		this.bag.remakeEquipByUid(uid, locks);
	}

	onSaveRemakeEquip(uid: number) {
		this.bag.saveRemakeEquip(uid);
	}

	/**献祭 */
	onEquipXianJi(data: any) {
		this.bag.xianji(data.uid1, data.uid2, data.type);
	}
	onEquipXianJiSave(data: any) {
		this.bag.saveXianji(data.uid);
	}

	/**技能变化 */
	sendSkillChange(skillinfo: Skill) {
		this.send(CmdID.s2c_skill_change, {
			skill: skillinfo.toObj()
		});
	}
	//----------------------------------------------------------------------------------------
	saveItemSQL(saveSql: string) {
		DB.saveItemsInfo(saveSql, (code: number, msg: string) => {
			if (code == ErrorConst.SUCCEED) {
				// SKLogger.debug(`玩家[${this.roleid}:${this.name}]执行成功`);
			} else {
				Logger.warn(`玩家[${this.roleid}:${this.name}]${saveSql} 执行失败`);
			}
		})
	}

	onAuthor(data: any) {
		let query = data;
		if (!query.pid) {
			this.send(CmdID.s2c_notice, {
				code: ErrorConst.FAILED
				// 无效的渠道标识 请联系管理员
			});
			return;
		}
		if (!query.name) {
			this.send(CmdID.s2c_notice, {
				code: ErrorConst.FAILED
				// 姓名不合法，请重新输入
			});
			return;
		}
		if (!query.idcard) {
			this.send(CmdID.s2c_notice, {
				code: ErrorConst.FAILED
				// 身份证不合法，请重新输入
			});
			return;
		}

		if (!query.notify_url) {
			if (GameConf.isLocal)
				query.notify_url = 'https://bzyx.cn/author_player_result';
			else
				query.notify_url = 'https://mjh5.cn/author_player_result';
		}

		let parma: any = {
			pid: query.pid,
			name: query.name,
			id_number: query.idcard,
			uid: this.account,
			notify_url: query.notify_url,
		}
		/**玩家实名 */
		AuthorMgr.instance.playerAuthor(parma, this.account);
	}

	/**第二天上报 */
	onReportSecordDay(create: any, lastonline: any) {
		let day1 = GTimer.getYearDay(create);
		let day2 = GTimer.getYearDay(lastonline);
		let last = new Date(lastonline);
		if (day2 - day1 == 1 && last.getDate() != GTimer.getCurDate().getDate()) {
			/**第二天打点 */
			this.send(CmdID.s2c_reprot_day);
		}
	}

	private update_online() {
		this.lastonline_time = Date.now();
		let sql = `UPDATE cy_role SET lastonline = NOW() WHERE role_id = ${this.roleid};`;
		this.saveItemSQL(sql);

		this.online_date++;
	}

	/**校验防成谜 */
	private idcard: string = "";
	public checkFangChenMi() {
		let isauthor = AuthorMgr.instance.checkList(this.account);
		if (isauthor) {
			if (!this.idcard) {
				let sql = `select realid from cy_account where account = ${this.account};`;
				DB.query(sql, (error, rows) => {
					if (rows && rows.length) {
						let realid = rows[0].realid;
						this.idcard = realid;
						if (!this.idcard) this.idcard = "";
						let age = AuthorMgr.instance.getUserAge(this.idcard);
						if (age < 18) {
							this.doFangChenMi(true);
						}
					}
				});
			} else {
				let age = AuthorMgr.instance.getUserAge(this.idcard);
				if (age < 18) {
					this.doFangChenMi(true);
				}
			}
		}
	}

	/**防沉迷 */
	private fangchenmi: boolean = false;
	private doFangChenMi(type: boolean) {
		this.fangchenmi = type;
	}

	/**防成谜倍数 */
	private get fangchengmiBet() {
		let minute = this.online_date;
		let reducetime = 60 * 3;
		let reducetimemax = 60 * 5;
		if (minute > reducetime && minute < reducetimemax) {
			return 0.5;
		} else if (minute > reducetimemax) {
			return 0;
		} else {
			return 1;
		}
	}

	/**
	 * 
	 * @param dt 秒
	 */
	public update(dt: number): void {
		this.fightingRoom.update(dt);
	}

	public update_sec():void
	{
		this.bossEntity.update_sec();
	}

	public update_min(): void {
		this.autoSave();

		this.update_online();

		this.dropmaxEntity.update_min();

		this.killMonsterEntity.update_min();
	}

	public resetDay(): void {
		this.dropmaxEntity.resetDay();
		this.shopEntity.resetDay();
		this.qiandaoEntity.resetDay();

		this.send(CmdID.s2c_every_day_0_0);
	}
}
