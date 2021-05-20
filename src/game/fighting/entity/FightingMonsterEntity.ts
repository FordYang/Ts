import MonsterCFG from "../../config/cfg/MonsterCFG";
import DropConfig from "../../config/DropConfig";
import LanguageConfig from "../../config/LanguageConfig";
import { ItemConfig } from "../../config/ItemConfig";
import MonsterConfig from "../../config/MonsterConfig";
import { EQuality } from "../../consts/EGame";
import { EItemKey, EItemType } from "../../consts/EItem";
import GameUtil from "../../core/GameUtil";
import { StringUtil } from "../../gear/StringUtil";
import PlayerMgr from "../../model/playerObj/PlayerMgr";
import CmdID from "../../network/CmdID";
import FightingMonsterAttr from "../vo/FightingMonsterAttr";
import FightingAnimalEntity from "./FightingAnimalEntity";
import { ESystemNoticeType } from "../../consts/ESystemNoticeType";

export default class FightingMonsterEntity extends FightingAnimalEntity
{
    protected _monsterAttr:FightingMonsterAttr;
    private monsterCfg:MonsterCFG;

    constructor()
    {
        super();

        this.eid = GameUtil.getAutoAddId();
    }
    
    public update(dt:number):void
    {
        super.update(dt);

        // if (Math.random() > 0.9)
        // {
        //     if (!this.ownerEntity)
        //     {
        //         let hitAnimal = this.fightingRoom.findHitTarget(this);
    
        //         if (hitAnimal)
        //         {
        //             let path = this.fightingRoom.findPath(this, hitAnimal);
        //         }
        //     }
        // }
    }
    
    //---------------------------------------------------------------------------------------------------
    
    public setAttr(monsterAttr:FightingMonsterAttr):void
    {
        super.setAttr(monsterAttr);

        this._monsterAttr = monsterAttr;
        this.monsterCfg = MonsterConfig.instance.getMonsterCfgById(monsterAttr.monsterId);
        
        this.walkDuration = this.monsterCfg.walkwait * 1000;
    }

    public get monsterAttr():FightingMonsterAttr
    {
        return this._monsterAttr;
    }

    public get monsterId():number
    {
        return this.monsterCfg.id;
    }
    public get quality():number
    {
        return this._monsterAttr.quality;
    }

    public get addExp():number
    {
        return this.monsterCfg.exp * (MonsterConfig.MONSTER_QUALITY_EXP[this.quality - 1] || 1);
    }
    
    protected onDie():void
    {
        if (!this.fightingRoom.isHeroPetEntity(this))
        {
            this.dropItem();
        }
        
        this.fightingRoom.dieMonster(this);

        super.onDie();
    }

    public get dropIdList():number[]
    {
        return MonsterConfig.instance.getDropIdList(this._monsterAttr.monsterId, this._monsterAttr.quality);
    }

    /** 计算掉落 */
    protected dropItem():void
    {
        if (this.dropIdList && this.dropIdList.length > 0)
        {
            let dorpIdList = this.dropIdList;

            let gold:number = 0;

            let dropItemList:{ itemId: number, tequan:boolean, value: number, count:number, quality:number }[] = [];
    
            let iszhanshen = this.fightingRoom.player.prerogative.iszhanshen;
            let isZhanshenDrop:boolean;
    
            for (let dropId of dorpIdList)
            {
                isZhanshenDrop = (dropId % 100) === 6;
                if (isZhanshenDrop)
                {
                    if (!iszhanshen)
                    {
                        continue;
                    }
                }
                let dropCfg = DropConfig.instance.getDropCfgById(dropId);
                let pick = dropCfg.picks || 1;
                for (let i:number = 0; i < pick; i++)
                {
                    let tmpDropObj = DropConfig.instance.getRndItemObj(dropId);
                    if(tmpDropObj)
                    {
                        if (this.fightingRoom.checkDrop(tmpDropObj.itemId))
                        {
                            let dropItem = Object.assign({tequan:isZhanshenDrop}, tmpDropObj);
                            this.fightingRoom.addDrop(dropItem.itemId, dropItem.count);
        
                            if (dropItem.itemId === EItemKey.itemid_103035)
                            {
                                gold += dropItem.value;
                            }
                            else
                            {
                                let itemcfg = ItemConfig.instance.getItemCfgById(dropItem.itemId);
                                if (tmpDropObj.quality >= itemcfg.isbroadcast || itemcfg.quality >= itemcfg.isbroadcast)
                                {
                                    let player = this.fightingRoom.player;
                                    let noticeMsg:string = LanguageConfig.instance.getFormatDesc(1002, player.name, this.fightingRoom.mapcfg.name, this.name, itemcfg.name);// StringUtil.format('玩家{0}在{1}击败了{2}，掉落了稀有物品{3}', player.name, this.fightingRoom.mapcfg.name, this.name, itemcfg.name);// ErrorCodeConfig.instance.getFormatDesc(37004);
                                    PlayerMgr.shared.broadcast(CmdID.s2c_sys_notice, {type:ESystemNoticeType.FIGHTING_DROP_INFO, msg:noticeMsg});
                                }

                                dropItemList.push(dropItem);
                            }
                        }
                    }
                }
            }
    
            // let monsterCfg = MonsterConfig.instance.getMonsterCfgById(this.monsterId);
            // 怪死亡，计算经验
            let exp = this.calcExp();//this.attr.exp;//(monsterCfg.exp || 0) * MonsterConfig.MONSTER_QUALITY_EXP[this.quality - 1];
    
            this.fightingRoom.sendDrop(this, exp, gold, dropItemList);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------

    private static readonly EXP_ATTENUATION_LIST:number[] = [1, 1, 1, 1, 1, 1, 0.88, 0.75, 0.63, 0.50, 0.38];
    private calcExp():number
    {
        let exp = this._animAttr.exp;

        let diffLv = this.fightingRoom?.player?.level - this.monsterCfg.lvl;
        if (diffLv > 0)
        {
            if (diffLv < FightingMonsterEntity.EXP_ATTENUATION_LIST.length)
            {
                return exp * FightingMonsterEntity.EXP_ATTENUATION_LIST[diffLv];
            }
            return exp * 0.38;
        }
        return Math.ceil(exp);
    }
}