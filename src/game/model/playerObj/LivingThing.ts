import EventEmitter from "events";

import { ELiveingType } from "../../consts/EGame";
import GameUtil from "../../core/GameUtil";

/**角色数据 */
export default class LivingThing extends EventEmitter {
	/**唯一Id */
	onlyid: number;
	/**资源Id */
	resid: number;
	/**名字 */
	name: string;
	/**地图 */
	mapid: number;
	/**类型 */
	living_type: ELiveingType;

	constructor() {
		super();

		this.resid = 0;
		this.mapid = 0;
		this.name = '未知';
		this.onlyid = GameUtil.getAutoAddId(); //唯一id
		this.living_type = ELiveingType.UNKOWN;
	}

	toObj(): any {
		let result = {
			name: this.name,
			mapid: this.mapid,
			onlyid: this.onlyid,
			type: this.living_type
		}
		return result;
	}

	isNpc(): boolean {
		return this.living_type == ELiveingType.NPC;
	}

	isPlayer(): boolean {
		return this.living_type == ELiveingType.PLAYER;
	}

	isMonster(): boolean {
		return this.living_type == ELiveingType.MONSTER;
	}

	isPet(): boolean {
		return this.living_type == ELiveingType.PET;
	}


	//---------------------------------------------------------------------------------------------------------------

	protected isDispose: boolean = false;
    private isDispose1:boolean = false;
	public destroy(): void 
	{
		if (this.isDispose1 === false) 
		{
			this.isDispose1 = true;

			this.onDestroy();

            this.isDispose = true;
		}
	}

	protected onDestroy(): void 
	{
		this.removeAllListeners();
	}
}
