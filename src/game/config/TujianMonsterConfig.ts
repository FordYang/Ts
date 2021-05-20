import { TujianMonsterCFG } from "./cfg/TujianMonsterCFG";

export class TujianMonsterConfig {
    private static _instance: TujianMonsterConfig;
    public static get instance(): TujianMonsterConfig {
        if (!TujianMonsterConfig._instance) {
            TujianMonsterConfig._instance = new TujianMonsterConfig();
        }
        return TujianMonsterConfig._instance;
    }

    public static readonly MAX_LV: number = 4;

    private _monsterCfg: TujianMonsterCFG[];

    private _monsterSoMaps: TujianMonsterCFG[];
    private _monsterSOs: TujianMonsterCFG[];

    private _monsterSoMapIdMap: { [mapId: number]: TujianMonsterCFG[] };
    private _monsterMapLvMap: { [mapId_lv: string]: TujianMonsterCFG };
    private _monsterLvMap: { [lvId: string]: TujianMonsterCFG };

    constructor() 
    {

    }

    public parseJson(jsonTable: TujianMonsterCFG[]): void 
    {
        this._monsterCfg = jsonTable;

        this._monsterSoMaps = [];
        this._monsterSOs = [];
        this._monsterSoMapIdMap = {};
        this._monsterMapLvMap = {};
        this._monsterLvMap = {};

        this._monsterCfg.sort((a: TujianMonsterCFG, b: TujianMonsterCFG) => {
            if (a.mapid === b.mapid) {
                return a.id - b.id;
            }
            return a.mapid - b.mapid;
        });

        let mapId: number = 0;
        let len: number = this._monsterCfg.length;
        let monster: TujianMonsterCFG;
        let monsters: TujianMonsterCFG[];
        let monsterId: number;
        for (let i: number = 0; i < len; i++) {
            monster = this._monsterCfg[i];
            this._monsterMapLvMap[`${monster.mapid}_${monster.monster}_${monster.lvl}`] = monster;
            this._monsterLvMap[`${monster.monster}_${monster.lvl}`] = monster;

            if (mapId != monster.mapid) {
                mapId = monster.mapid;
                monsters = [];
                this._monsterSoMapIdMap[mapId] = monsters;
                this._monsterSoMaps.push(monster);
            }

            if (monsterId != monster.monster) {
                monsters.push(monster);
                this._monsterSOs.push(monster);
            }

            monsterId = monster.monster;
        }
    }

    public get monsterMaps(): TujianMonsterCFG[] {
        return this._monsterSoMaps;
    }

    public get monsterSOs(): TujianMonsterCFG[] {
        return this._monsterSOs;
    }

    /** 根据地图ID获取怪物列表 */
    public getMonsterInfosByMapId(mapId: number): TujianMonsterCFG[] {
        return this._monsterSoMapIdMap[mapId];
    }

    /** 根据等级获取怪物 */
    public getMonsterInfoByMapLv(mapId: number, monsterId: number, lv: number): TujianMonsterCFG {
        return this._monsterMapLvMap[`${mapId}_${monsterId}_${lv}`];
    }

    /** 根据等级获取怪物 */
    public getMonsterInfoByLv(monsterId: number, lv: number): TujianMonsterCFG {
        return this._monsterLvMap[`${monsterId}_${lv}`];
    }

    /** 验证是否满级 */
    public checkMaxLv(monsterId:number, lv: number): boolean 
    {
        return lv >= TujianMonsterConfig.MAX_LV || !this.getMonsterInfoByLv(monsterId, lv + 1);
    }
}