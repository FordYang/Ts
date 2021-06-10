import MapCFG from "./cfg/MapCFG";

export default class MapConfig
{
    
    private static _instance: MapConfig;
    public static get instance(): MapConfig {
        if (!MapConfig._instance) {
            MapConfig._instance = new MapConfig();
        }
        return MapConfig._instance;
    }

    //--------------------------------------------------------------------------------------
    private _table: MapCFG[];
    private _tableMap: { [skillId: number]: MapCFG };

    private _mapBossMap:{[mapId:number]:number};
    public readonly bossIdList:number[] = [];

    constructor() 
    {
        
    }

    public get table(): MapCFG[] {
        return this._table;
    }

    public parseJson(jsonTable: MapCFG[]): void 
    {
        this._table = jsonTable;

        this._mapBossMap = {};
        this._tableMap = {};
        for (let mapCfg of this._table) 
        {
            if (mapCfg.quality)
            {
                mapCfg.mMonsterTotalRate = mapCfg.quality.reduce((v1, v2)=>{return v1 + v2;});
            }
            this._tableMap[mapCfg.id] = mapCfg;
            if (mapCfg.boss)
            {
                this._mapBossMap[mapCfg.id] = mapCfg.boss;
                this.bossIdList.push(mapCfg.boss);
            }
        }
    }

    public getMapCfgById(id:number):MapCFG | undefined
    {
        return this._tableMap[id];
    }
    
    public getMapBossId(mapId:number):number | undefined
    {
        return this._mapBossMap[mapId];
    }
    //--------------------------------------------------------------------------------------
    /** 随机一个怪 */
    public getRndMonsterId(mapId:number):number | undefined
    {
        let mapCfg = this._tableMap[mapId];

        if (mapCfg)
        {
            let rndIdx = Math.floor(Math.random() * mapCfg.monster.length);
            return mapCfg.monster[rndIdx];
        }
        return undefined;
    }

    /** 随机一个品质 */
    public getRndQuality(mapId:number):number
    {
        let mapCfg = this._tableMap[mapId];
        if (mapCfg && mapCfg.quality)
        {
            let rndRate = Math.random() * mapCfg.mMonsterTotalRate;

            let qualityRateList = mapCfg.quality;
            let len = qualityRateList.length;
            for (let i:number = 0; i < len; i++)
            {
                if (qualityRateList[i] > rndRate)
                {
                    return i + 1;
                }
                else
                {
                    rndRate -= qualityRateList[i];
                }
            }
        }
        return 1;
    }
}