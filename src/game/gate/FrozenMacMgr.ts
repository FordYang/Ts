
import { ErrorConst } from "../consts/ErrorConst";
import DB from "../utils/DB";

export default class FrozenMACMgr {
	public static readonly instance = new FrozenMACMgr();
	//--------------------------------------------------------------------------------------------
	private frozenMap: { [mac: string]: boolean };
	constructor() {
		this.frozenMap = Object.create(null);
	}

	public launch() {
		DB.getFrozenMacList((ret: any, rows: any) => {
			if (ret == ErrorConst.SUCCEED) {
				for (const row of rows) {
					let mac = row.mac;
					this.addFrozenMAC(mac);
				}
			}
		});
	}

	/**封禁Mac设备 */
	public addFrozenMAC(mac: string): void {
		this.frozenMap[mac] = true;
	}

	/**解封Mac设备 */
	public removeFrozenMAC(mac: string): void {
		delete this.frozenMap[mac];
	}
	/**检查设备 */
	public checkMAC(mac: string): boolean {
		return this.frozenMap[mac];
	}
}