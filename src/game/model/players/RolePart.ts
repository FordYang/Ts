import { IntensifyConfig } from "../../config/IntensifyConfig";
import { IntensifyPartConfig } from "../../config/IntensifyPartConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import { EItemType } from "../../consts/EItem";
import { EAttrType, EEQuipPart, EProfessionType } from "../../consts/ERole";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import BaseAttachAttr from "../attachAttr/BaseAttachAttr";
import BaseRoleAttr from "../attachAttr/BaseRoleAttr";
import CompositeRoleAttr from "../attachAttr/CompositeRoleAttr";
import Player from "../playerObj/Player";
import { EBagChangeType, IItem } from "./Bag";
import { ERichesType } from "../../consts/EGame";
import PlayerEvent from "../../consts/PlayerEvent";
import { ItemConfig } from "../../config/ItemConfig";
import Item from "./Item";

/**这是玩家装备在身上的所有装备 */
export default class RolePart extends BaseAttachAttr {
	//所属
	owner: Player;
	//装备
	partEquip: { [key: string]: Item };
	partIntensify: { [key: number]: EEQuipPart };
	//装备属性
	attachAttr: { [key: number]: EAttrType };
	/**装备属性 */
	public readonly totalAttr: CompositeRoleAttr;
	constructor(owner: Player) {
		super();

		this.owner = owner;
		this.attachAttr = {};
		for (let key in EAttrType) {
			let value = DataUtil.numberBy(key);
			if (isNaN(value)) {
				continue;
			}
			this.attachAttr[value] = 0;
		}
		/**装备 */
		this.partEquip = {};
		for (let partkey in EEQuipPart) {
			let value = DataUtil.numberBy(partkey);
			if (isNaN(value)) {
				continue;
			}
			this.partEquip[value] = null;;
		}

		/**强化 */
		this.partIntensify = {};
		for (let intensifykey in EEQuipPart) {
			let value = DataUtil.numberBy(intensifykey);
			if (isNaN(value)) {
				continue;
			}
			this.partIntensify[value] = 0;
		}

		this.totalAttr = new CompositeRoleAttr();
		this.totalAttr.attachName = "装备";
		this.totalAttr.setProfession(owner.profession);
	}

	public get equipCount() {
		let tempCount = 0;
		for (let partKey in this.partEquip) {
			if (this.partEquip[partKey]) {
				tempCount++;
			}
		}
		return tempCount;
	}

	/**强化数据 */
	public get intensifyData() 
	{
		return this.partIntensify;
	}

	public get maxIntensifyPart():number
	{
		let maxVal = 0;
		for (let partKey in this.partIntensify)
		{
			maxVal = Math.max(maxVal, this.partIntensify[partKey]);
		}
		return maxVal;
	}

	/**设置属性 */
	setAttr() {
		this.totalAttr.clearChildAttr();
		let table = this.requirePart(this.partEquip);
		for (let equip of table) {
			if (equip) this.totalAttr.addChildAttr(equip);
		}
		/**添加部位强化属性 */
		let _intensifyAttr = new BaseRoleAttr(this.owner.profession);
		for (let intensifykey in EEQuipPart) {
			let value = DataUtil.numberBy(intensifykey);
			let intensifyCnt = this.partIntensify[value];
			if (value > 0 && intensifyCnt > 0) {
				let configs = IntensifyPartConfig.instance.getIntensifyPartCfgById(value);
				if (configs.hp)
					_intensifyAttr.hp += intensifyCnt * configs.hp;
				if (configs.minac)
					_intensifyAttr.minac += intensifyCnt * configs.minac;
				if (configs.maxac)
					_intensifyAttr.maxac += intensifyCnt * configs.maxac;
				if (configs.minatk) {
					switch (this.owner.profession) {
						case EProfessionType.ZHANSHI:
							_intensifyAttr.minzs += intensifyCnt * configs.minatk;
							break;
						case EProfessionType.FASHI:
							_intensifyAttr.minfs += intensifyCnt * configs.minatk;
							break;
						case EProfessionType.DAOSHI:
							_intensifyAttr.minds += intensifyCnt * configs.minatk;
							break;
					}
				}
				if (configs.maxatk) {
					switch (this.owner.profession) {
						case EProfessionType.ZHANSHI:
							_intensifyAttr.maxzs += intensifyCnt * configs.maxatk;
							break;
						case EProfessionType.FASHI:
							_intensifyAttr.maxfs += intensifyCnt * configs.maxatk;
							break;
						case EProfessionType.DAOSHI:
							_intensifyAttr.maxds += intensifyCnt * configs.maxatk;
							break;
					}
				}
			}
		}
		this.totalAttr.addChildAttr(_intensifyAttr);
		this.owner.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
	}

	public requirePart(jsonObj: { [id: number]: any }): Item[] {
		let table: any[] = [];
		for (let id in jsonObj) {
			table.push(jsonObj[id]);
		}
		return table;
	}

	/**部位信息 */
	setPartDB() {
		let equips = this.owner.bag.equips;
		/**初始化装备 */
		for (let roleequip of equips) {
			this.partEquip[roleequip.part] = roleequip;
		}
		this.setAttr();
		/**检查全技能+1 */
		this.owner.skillMgr.checkSkillLv();
	}

	/**设置强化信息 */
	setIntensityDB(data: string) {
		if (!data) return;
		let __intensify = DataUtil.jsonBy(data);
		this.partIntensify = __intensify;
	}


	/**对比获取部位 */
	compareWeapon(type: string) {
		switch (type) {
			case "bracelet":
				let bracelet1 = this.partEquip[EEQuipPart.bracelet1];
				if (!bracelet1) return EEQuipPart.bracelet1;
				let bracelet2 = this.partEquip[EEQuipPart.bracelet2];
				if (!bracelet2) return EEQuipPart.bracelet2;

				let combat1 = bracelet1.getFighting();
				let combat2 = bracelet2.getFighting();
				return combat1 < combat2 ? EEQuipPart.bracelet1 : EEQuipPart.bracelet2;
			case "ring":
				let ring1 = this.partEquip[EEQuipPart.ring1];
				if (!ring1) return EEQuipPart.ring1;
				let ring2 = this.partEquip[EEQuipPart.ring2];
				if (!ring2) return EEQuipPart.ring2;

				let combat3 = ring1.getFighting();
				let combat4 = ring2.getFighting();
				return combat3 < combat4 ? EEQuipPart.ring1 : EEQuipPart.ring2;
		}
		return EEQuipPart.none;
	}

	/**穿戴等级 */
	onGetReduceCnt(equip: Item) {
		let reduceLv = 0;
		for (let affix of equip.affixInfo) {
			if (affix.code == EAttrType.ADD_LEVEL) {
				reduceLv += affix.minV;
			}
		}
		if (!reduceLv) reduceLv = 0;
		return equip.iConfigs.needlevel - reduceLv;
	}

	//穿装备
	wearEquip(equip: Item, part: number = EEQuipPart.none) {
		if (this.onGetReduceCnt(equip) > this.owner.level) return this.owner.send(CmdID.s2c_notice, { code: ErrorConst.LV_ARIIVE, value: equip.iConfigs.needlevel });
		if (this.owner.bag.freeCount < 1) return this.owner.send(CmdID.s2c_notice, { code: ErrorConst.BAG_NOT_ENOUGH });
		if (equip.iConfigs.type != EItemType.equip) return this.owner.send(CmdID.s2c_notice, { code: ErrorConst.OPERROR });
		if (equip.iConfigs.profession != 0)
			if (equip.iConfigs.profession != this.owner.profession) return this.owner.send(CmdID.s2c_notice, { code: ErrorConst.NOT_PROFESSION });

		let partkey = part;
		if (partkey == EEQuipPart.none) {/**不是替换 */
			if (equip.part == EEQuipPart.bracelet1 || equip.part == EEQuipPart.bracelet2) {
				partkey = this.compareWeapon("bracelet");
			} else if (equip.part == EEQuipPart.ring1 || equip.part == EEQuipPart.ring2) {
				partkey = this.compareWeapon("ring");
			} else {
				partkey = equip.part;
			}
		}
		/**穿装备 */
		equip.part = partkey;
		equip.state = 2;
		if (this.partEquip[partkey]) this.takeoffEquip(this.partEquip[partkey]);
		this.partEquip[partkey] = equip;
		/**刷新武器 */
		this.setAttr();
		/**检查全技能+1 */
		this.owner.skillMgr.checkSkillLv();
		this.owner.bag.updateItemStateSQL(equip);
		this.sendMsg(ErrorConst.SUCCEED, "穿戴成功", equip.toObj());
		this.owner.send(CmdID.s2c_notice, { code: ErrorConst.EQUIP_SUCCESS });

		this.owner.emit(PlayerEvent.HERO_EQUIP_PUT);
	}

	//脱装备
	takeoffEquip(equip: Item) {
		if (this.owner.bag.freeCount < 1) return this.sendMsg(ErrorConst.FAILED, "背包空间不足");
		this.partEquip[equip.part] = null;
		equip.state = 1;
		this.owner.bag.updateItemStateSQL(equip);
		/**刷新武器 */
		this.setAttr();
		/**检查全技能+1 */
		this.owner.skillMgr.checkSkillLv();
		this.sendMsg(ErrorConst.SUCCEED, "脱下成功", equip.toObj(), EBagChangeType.takeoff);
	}

	/**部位 */
	intensify(part: EEQuipPart): boolean {
		let intensifyInfo = this.partIntensify[part];
		let iConfigs = IntensifyConfig.instance.getIntensifyCfgById(intensifyInfo + 1);
		if (intensifyInfo > this.owner.level) {
			/**不可以超过等级 */
		} else if (iConfigs.cost > this.owner.money) {
			/**金币不足 */
		} else {
			this.owner.addMoney(ERichesType.Money, -1 * iConfigs.cost, "强化消耗");
			let success = Math.random() * 100;
			if (iConfigs.gailv >= success) {
				/**强化成功 */
				this.partIntensify[part]++;
				this.setAttr();
				this.sendIntensifyMsg(ErrorConst.SUCCEED, part);
				return true;
			} else {
				/**强化失败 */
				this.sendIntensifyMsg(ErrorConst.FAILED, part);
			}
		}

		return false;
	}

	/**替换装备 */
	replaceEquip(equip: Item, part: number) {
		Logger.log("替换装备！");
		if (!part || part == EEQuipPart.none)
			return Logger.warn("替换装备位置错误");
		this.wearEquip(equip, part);
	}

	/**强化信息 */
	sendIntensifyMsg(msgCode: number, part: number) {
		this.owner.send(CmdID.s2c_part_intensify,
			{
				code: msgCode,
				part: part,
				intensify: this.partIntensify[part]
			});
	}

	/**装备 */
	sendMsg(msgCode: number, msg: string, data: IItem = null, _type: EBagChangeType = EBagChangeType.wear) {
		switch (msgCode) {
			case ErrorConst.FAILED:
				this.owner.send(CmdID.s2c_equip_change, {
					code: ErrorConst.FAILED,
					msg: msg
				});
				break;
			case ErrorConst.SUCCEED:
				let _data = data;
				this.owner.send(CmdID.s2c_equip_change, {
					code: ErrorConst.SUCCEED,
					type: _type,
					msg: msg,
					equip: _data
				});
				break;
		}
	}

	/**强化信息 */
	toClient() {
		return DataUtil.toJson(this.partIntensify, "{}");
	}

	/**存数据库 */
	toDB() {
		return DataUtil.toJson(this.partIntensify, "{}");
	}
}