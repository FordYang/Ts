import { ErrorConst } from "../consts/ErrorConst";
import DB from "../utils/DB";

export default class FrozenIPMgr {
	public static readonly instance = new FrozenIPMgr();
	//--------------------------------------------------------------------------------------------
	private frozenMap: { [fip: string]: boolean };
	constructor() {
		this.frozenMap = Object.create(null);
	}

	public launch() {
		DB.getFrozenList((ret: any, rows: any) => {
			if (ret == ErrorConst.SUCCEED) {
				for (const row of rows) {
					let fip = row.frozen_ip;
					this.addFrozenIP(fip);
				}
			}
		});
	}

	/**封禁IP */
	public addFrozenIP(fip: string): void {
		this.frozenMap[fip] = true;
	}
	/**解封IP */
	public removeFrozenIP(fip: string): void {
		delete this.frozenMap[fip];
	}
	/**检查IP */
	public checkIP(fip: string): boolean {
		return this.frozenMap[fip];
	}
}