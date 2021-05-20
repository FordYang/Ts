import DropConfig from "../../config/DropConfig";
import GameEvent from "../../consts/GameEvent";
import CyObject from "../../core/CyObject";
import EventTool from "../../core/EventTool";
import DataUtil from "../../gear/DataUtil";
import DateUtil from "../../gear/DateUtil";
import DB from "../../utils/DB";
import Player from "../playerObj/Player";

export default class RoleDropMaxEntity extends CyObject
{
    private player:Player;

    private day:number;
    private dropMap:{[itemId:number]:{m:number, v:number}};

    constructor(player:Player)
    {
        super();

        this.player = player;

        this.dropMap = Object.create(null);

        // EventTool.on(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);
    }

    private saveCount:number = 0;
    public update_min():void
    {
        if (this.saveCount++ >= 5)
        {
            this.saveCount = 0;

            this.saveDB();
        }
    }

    private saveDirty:boolean = false;
    public addDrop(itemId:number, count:number):void
    {
        if (this.dropMap[itemId])
        {
            this.saveDirty = true;

            this.dropMap[itemId].v = (this.dropMap[itemId].v ?? 0) + Math.floor(count);
        }
    }

    public checkDrop(itemId:number):boolean
    {
        let dropobj = this.dropMap[itemId];
        if (dropobj)
        {
            let ratio = dropobj.v / dropobj.m;
            if (ratio < 0.25)
            {
                return true;
            }
            else if (ratio < 0.5)
            {
                return Math.random() < 0.75;
            }
            else if (ratio < 0.75)
            {
                return Math.random() < 0.5;
            }
            else if (ratio < 1)
            {
                return Math.random() < 0.25;
            }
            return false;
        }

        return true;
    }

    public resetDay():void
    {
        this.day = DateUtil.nowDay;
        this.generateMaxDrop();
        
        this.saveDB();
    }

    private generateMaxDrop():void
    {
        let lvIdx = Math.floor(this.player.level / 10);

        this.dropMap = Object.create(null);
        let dropMaxTable = DropConfig.instance.dropMaxTable;
        for (let dropmaxcfg of dropMaxTable)
        {
            let ratio:number = (dropmaxcfg.lel[lvIdx] || 2);
            let maxnum = dropmaxcfg.maxnum * ratio;//+ (dropmaxcfg.maxnum * dropmaxcfg.suiji * 0.01)) * ratio;
            let suijiRatio:number = dropmaxcfg.suiji * 0.01;
            maxnum = maxnum * (1 + suijiRatio * Math.random() * 2 - suijiRatio);
            this.dropMap[dropmaxcfg.id] = {v:0, m:Math.floor(maxnum)};
        }
    }

    private updateMaxDrop():void
    {
        let lvIdx = Math.floor(this.player.level / 10);

        // this.dropMap = Object.create(null);
        let dropMaxTable = DropConfig.instance.dropMaxTable;
        for (let dropmaxcfg of dropMaxTable)
        {
            let ratio:number = (dropmaxcfg.lel[lvIdx] || 2);
            let maxnum = dropmaxcfg.maxnum * ratio;//+ (dropmaxcfg.maxnum * dropmaxcfg.suiji * 0.01)) * ratio;
            let suijiRatio:number = dropmaxcfg.suiji * 0.01;
            maxnum = maxnum * (1 + suijiRatio * Math.random() * 2 - suijiRatio);

            if (!this.dropMap[dropmaxcfg.id])
            {
                this.dropMap[dropmaxcfg.id] = {v:0, m:Math.floor(maxnum)};
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------

    public deserialize(objstr:string):void
    {
        let dbObj = DataUtil.jsonBy(objstr);

        if (dbObj && dbObj.date === DateUtil.nowDay)
        {
            this.day = dbObj.date;
            this.dropMap = dbObj.map;

            this.updateMaxDrop();
        }
        else
        {
            this.day = DateUtil.nowDay;
            this.generateMaxDrop();
        
            this.saveDB();
        }
    }

    private serializeDB():string
    {
        let jsonstr = DataUtil.toJson({date:this.day, map:this.dropMap});
        return jsonstr;
    }

    private saveDB():void
    {
        if (this.isDispose === false && this.saveDirty)
        {
            this.saveDirty = false;

            DB.updateRoleAttr(this.player.roleid, ["dropmax"], [this.serializeDB()]);
        }
    }
    //----------------------------------------------------------------------------------------------------------------

    protected onDestroy():void
    {
        this.saveDB();
        // EventTool.off(GameEvent.EVERY_DAY_RESET, this.onEveryDayReset);

        super.onDestroy();
    }
}