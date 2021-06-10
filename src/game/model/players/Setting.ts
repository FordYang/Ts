import { EItemKey } from "../../consts/EItem";
import DataUtil from "../../gear/DataUtil";
import Player from "../playerObj/Player";

export default class Setting {
    owner: Player;
    /**非本职业装备 */
    noProfession: boolean;
    /**极品装备 */
    nonsuch: boolean;
    /**普通装备 */
    eWhite: boolean;
    /**优秀装备 */
    eGreen: boolean;
    /**精良装备 */
    eBule: boolean;
    /**稀有装备 */
    ePurple: boolean;
    /**生命回复 */
    lifeId: number;
    lifeRevert: boolean;
    lifePercent: number;
    /**魔法回复 */
    magicId: number;
    magicRevert: boolean;
    magicPercent: number;
    /**特殊药品 */
    specialId: number;
    specialRevert: boolean;
    specialPercent: number;
    /**回收 等级 */
    recliamState: boolean;
    recliamLevel: number;
    /**特殊词缀 */
    specialAffix: boolean;
    constructor(owner: Player) {
        this.owner = owner;
        /**非本职业 */
        this.noProfession = false;
        /**极品装备 */
        this.nonsuch = false;
        /**普通装备 */
        this.eWhite = false;
        /**优秀装备 */
        this.eGreen = false;
        /**精良装备 */
        this.eBule = false;
        /**稀有装备 */
        this.ePurple = false;
        /**生命回复 */
        this.lifeId = EItemKey.itemid_100010;
        this.lifeRevert = true;
        this.lifePercent = 70;
        /**魔法回复 */
        this.magicId = EItemKey.itemid_100020;
        this.magicRevert = true;
        this.magicPercent = 50;
        /**特殊药品 */
        this.specialId = EItemKey.itemid_100030;
        this.specialRevert = false;
        this.specialPercent = 65;
        /**回收 等级 */
        this.recliamState = false;
        this.recliamLevel = 0;
        /**特殊词缀 */
        this.specialAffix = false;
    }

    /**初始化设置 */
    setDB(data: string) {
        if (!data) return;
        let __data = DataUtil.jsonBy(data);
        this.noProfession = __data.noProfession;
        this.nonsuch = __data.nonsuch;
        this.eWhite = __data.eWhite;
        this.eGreen = __data.eGreen;
        this.eBule = __data.eBule;
        this.ePurple = __data.ePurple;
        this.lifeId = __data.lifeId;
        this.lifeRevert = __data.lifeRevert;
        this.lifePercent = __data.lifePercent;
        this.magicId = __data.magicId;
        this.magicRevert = __data.magicRevert;
        this.magicPercent = __data.magicPercent;
        this.specialId = __data.specialId;
        this.specialRevert = __data.specialRevert;
        this.specialPercent = __data.specialPercent;
        if (__data.recliamState != null)
            this.recliamState = __data.recliamState;
        if (__data.recliamLevel != null)
            this.recliamLevel = __data.recliamLevel;
        if (__data.specialAffix != null)
            this.specialAffix = __data.specialAffix;
    }

    /**数据库存 */
    toDB() {
        return DataUtil.toJson(this.toObj(), "{}");
    }

    /**返回结构体 */
    toObj() {
        let result = {
            noProfession: this.noProfession,
            nonsuch: this.nonsuch,
            eWhite: this.eWhite,
            eGreen: this.eGreen,
            eBule: this.eBule,
            ePurple: this.ePurple,
            lifeId: this.lifeId,
            lifeRevert: this.lifeRevert,
            lifePercent: this.lifePercent,
            magicId: this.magicId,
            magicRevert: this.magicRevert,
            magicPercent: this.magicPercent,
            specialId: this.specialId,
            specialRevert: this.specialRevert,
            specialPercent: this.specialPercent,
            recliamState: this.recliamState,
            recliamLevel: this.recliamLevel,
            specialAffix: this.specialAffix
        }
        return result;
    }
}