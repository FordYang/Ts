import { ILevelupCFG } from "../../config/cfg/LevelupCFG";
import { LevelUpConfig } from "../../config/LevelUpConfig";
import PlayerEvent from "../../consts/PlayerEvent";
import LivingThing from "./LivingThing";
/**战斗数据 */
export default class BattleObj extends LivingThing {
	/**最大等级 */
	static readonly MAX_LEVEL: number = 69;
	/**角色 */
	ownid: number;
	/**经验变化 */
	protected exp: number;
	/**等级变化 */
	protected _level: number;

	public get level() {
		return this._level;
	}

	public get levelExp():number
	{
		return this.exp;
	}
	
	/**等级配置 */
	levelCfg: ILevelupCFG;

	constructor() 
	{
		super();
		// 经验
		this.exp = 0;
		this._level = 0;

		// 从属关系
		this.ownid = 0;

		console.log('dafasdfasf');
	}

	/**直接升级 */
	levelup(issend: any) {
		let nextlevel = this.level + 1;

		this.setLevel(nextlevel);
	}

	setLevel(level: any) 
	{
		this._level = level;
		this.levelCfg = LevelUpConfig.instance.getlevelupCfgById(this.level);

		this.emit(PlayerEvent.HERO_FIGHT_ATTR_CHANGE);
	}
}