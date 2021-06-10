import FightingAnimalEntity from "./entity/FightingAnimalEntity";
import FightingMonsterEntity from "./entity/FightingMonsterEntity";
import FightingPlayerEntity from "./entity/FightingPlayerEntity";
import MapCFG from '../config/cfg/MapCFG';
import MapConfig from '../config/MapConfig';
import FightingMonsterAttr from './vo/FightingMonsterAttr';
import FightingHeroEntity from './entity/FightingHeroEntity';
import FightingPlayerAttr from './vo/FightingPlayerAttr';
import FightingBossEntity from './entity/FightingBossEntity';
import MonsterCFG from '../config/cfg/MonsterCFG';
import MonsterConfig from '../config/MonsterConfig';
import Agent from '../network/Agent';
import CmdID from '../network/CmdID';
import { SkillConfig } from '../config/SkillConfig';
import { ESkillTarget } from '../consts/ESkillTarget';
import { ESkillTriggerType } from '../consts/ESkillTriggerType';
import { ErrorConst } from '../consts/ErrorConst';
import { EFightingHurtType } from '../consts/EFightingHurtType';
import Player from '../model/playerObj/Player';
import { EProfessionType, ESkillId, ESkillType } from "../consts/ERole";
import FightingTaoistEntity from "./entity/FightingTaoistEntity";
import FightingRabbiEntity from "./entity/FightingRabbiEntity";
import FightingSoliderEntity from "./entity/FightingSoldierEntity";
import DataUtil from "../gear/DataUtil";
import SkillMgr from "../model/players/SkillMgr";
import { EMapType, ERichesType } from "../consts/EGame";
import Long from "long";
import PlayerEvent from "../consts/PlayerEvent";
import SkillCFG from "../config/cfg/SkillCFG";
import { EDayMapType } from "../model/players/DayMap";
import SkillBuffConfig from "../config/SkillBuffConfig";
import ArrayUtil from "../gear/ArrayUtil";
import EFightingPassType from "../consts/EFightingPassType";
import Logger from "../gear/Logger";
import CyObject from "../core/CyObject";
import { AStar } from "./astar/AStar";
import { AStarMap } from "./astar/AStarMap";
import FightingEvent from "./FightingEvent";
import { ESkillRange } from "../consts/ESkillRange";
import GameUtil from "../core/GameUtil";
import { FightingOtherPlayerEntity } from "./entity/FightingOtherPlayerEntity";
import DBForm from "../utils/DBForm";
import RoleAttr from "../model/attachAttr/RoleAttr";
import BaseRoleAttr from "../model/attachAttr/BaseRoleAttr";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import RoleFightAttr from "../model/attachAttr/RoleFightAttr";

// interface FightingBossInfo
// {
//     cfg:MonsterCFG;
//     isLive:boolean;
//     entityAttr:FightingMonsterAttr;
//     entity:FightingBossEntity;
//     dieTime:number;
// }

export default class FightingRoom extends CyObject 
{
    public readonly player: Player;

    // private enemyList: FightingMonsterEntity[];
    // private teamList: FightingAnimalEntity[];

    private animalList: FightingAnimalEntity[];
    private animalMap: { [eid: number]: FightingAnimalEntity };//Map<number, FightingAnimalEntity>;

    private heroEntity: FightingHeroEntity;

    /** 副本地图ID */
    private _mapCfg: MapCFG | undefined;

    // private monsterPool:Pool<FightingMonsterEntity>;

    private astar:AStar;
    private astarMap:AStarMap;

    constructor(player: Player) 
    {
        super();

        this.player = player;
        this.player.on(CmdID.c2s_hero_revive, this.onReqRevive);

        // this.enemyList = [];
        // this.teamList = [];

        this.animalMap = {};
        this.animalList = [];

        this.astar = new AStar();
        this.astarMap = new AStarMap();
        this.astar.setAStarMap(this.astarMap);

        // this.monsterPool = new Pool(FightingMonsterEntity, 10);
    }

    //--------------------------------------------------------------------------------------
    // 寻路相关
    public findPath(startEntity:FightingAnimalEntity, endEntity:FightingAnimalEntity, outPath:number[]):void
    {
        outPath.length = 0;

        let signX:number = Math.sign(endEntity.sx - startEntity.sx);
        let signY:number = Math.sign(endEntity.sy - startEntity.sy);
        if (signX)
        {
            if (signY === 0 || Math.random() > 0.5)
            {
                let tmpNode = this.astarMap.getNodeByGrid(startEntity.sx + signX, startEntity.sy);
                if (tmpNode && tmpNode.walkable)
                {
                    outPath.push(tmpNode.nx, tmpNode.ny);
                    return;
                }
            }
        }
        if (signY)
        {
            let tmpNode = this.astarMap.getNodeByGrid(startEntity.sx, startEntity.sy + signY);
            if (tmpNode && tmpNode.walkable)
            {
                outPath.push(tmpNode.nx, tmpNode.ny);
                return;
            }
        }
            
        let srcNode = this.astarMap.getNodeByGrid(startEntity.sx, startEntity.sy);
        let endNode = this.astarMap.getNodeByGrid(endEntity.sx, endEntity.sy);
        this.astar.findPath(srcNode, endNode, outPath);

        if (outPath.length === 0)
        {
            let tempXY = Math.random() > 0.5 ? -1 : 1;
            if (Math.random() > 0.5)
            {
                let tmpNode = this.astarMap.getNodeByGrid(startEntity.sx, startEntity.sy + tempXY);
                if (tmpNode && tmpNode.walkable)
                {
                    outPath.push(tmpNode.nx, tmpNode.ny);
                    return;
                }
            }
            else
            {
                let tmpNode = this.astarMap.getNodeByGrid(startEntity.sx + tempXY, startEntity.sy);
                if (tmpNode && tmpNode.walkable)
                {
                    outPath.push(tmpNode.nx, tmpNode.ny);
                    return;
                }
            }
        }
    }

    /**
     * 获取一个攻击目标
     * @param atkEntity 攻击者
     * @returns 
     */
    public findHitTarget(atkEntity:FightingAnimalEntity):FightingAnimalEntity
    {
        let minDiff:number = 10000;
        let tmpDiff:number = 0;
        let hitEntity:FightingAnimalEntity;

        let tmpAnimalList:FightingAnimalEntity[] = this.animalList;

        for (let animalEntity of tmpAnimalList)
        {
            if (animalEntity.teamId !== atkEntity.teamId)
            {
                if (atkEntity instanceof FightingPlayerEntity)
                {
                    if (this.isPK)
                    {
                        if (animalEntity instanceof FightingPlayerEntity)
                        {
                            return animalEntity;
                        }
                    }
                    else
                    {
                        if (animalEntity instanceof FightingBossEntity)
                        {
                            let tempStartNode = this.astarMap.getNodeByGrid(atkEntity.sx, atkEntity.sy);
                            let tempEndNode = this.astarMap.getNodeByGrid(animalEntity.sx, animalEntity.sy);
                            let tempWale = this.astar.findPath(tempStartNode, tempEndNode);
                            if (tempWale)
                            {
                                return animalEntity;
                            }
                        }
                    }
                }
                
                tmpDiff = Math.max(Math.abs(animalEntity.sx - atkEntity.sx), Math.abs(animalEntity.sy - atkEntity.sy));
                if (minDiff > tmpDiff)
                {
                    minDiff = tmpDiff;
                    hitEntity = animalEntity;
                }
                else if (minDiff === tmpDiff && (hitEntity.hp > animalEntity.hp || Math.random() > 0.5))
                {
                    hitEntity = animalEntity;
                }
            }
        }
        return hitEntity;
    }
    
    /** 获取技能受击列表 */
    public getSkillHitList(attackEntity:FightingAnimalEntity, skillcfg:SkillCFG, lockEntity:FightingAnimalEntity, outEidlist:number[]):number[]
    {
        let targetEntity:FightingAnimalEntity;
        if (skillcfg.areacenter === 0)
        {
            targetEntity = attackEntity;
        }
        else if (skillcfg.areacenter === 1)
        {
            targetEntity = lockEntity;
        }
        else
        {
            outEidlist.push(lockEntity.eid);
            return outEidlist;
        }

        let animalList:FightingAnimalEntity[] = [];
        if (skillcfg.targetside === ESkillTarget.ENEMY)
        {
            outEidlist.push(lockEntity.eid);
            for (let animal of this.animalList)
            {
                if (lockEntity !== animal && animal.teamId !== attackEntity.teamId)
                {
                    animalList.push(animal);
                }
            }
        }
        else
        {
            for (let animal of this.animalList)
            {
                if (animal.teamId === attackEntity.teamId)
                {
                    animalList.push(animal);
                }
            }
        }


        if (skillcfg.areashape === ESkillRange.LINE)
        {
            // 线性攻击

        }
        else if (skillcfg.areashape === ESkillRange.RECTANGE)
        {
            // 长方形
            for (let animalEntity of animalList)
            {
                if (outEidlist.length >= skillcfg.maxnum)
                {
                    break;
                }
                
                let distx = Math.abs(targetEntity.sx - animalEntity.sx);
                let disty = Math.abs(targetEntity.sy - animalEntity.sy);
                if (distx <= skillcfg.areaarg1 && disty <= skillcfg.areaarg2)
                {
                    outEidlist.push(animalEntity.eid);
                }
            }
        }
        else if (skillcfg.areashape === ESkillRange.SQUARE)
        {
            // 正方形
            for (let animalEntity of animalList)
            {
                if (outEidlist.length >= skillcfg.maxnum)
                {
                    break;
                }

                let dist = Math.max(Math.abs(targetEntity.sx - animalEntity.sx), Math.abs(targetEntity.sy - animalEntity.sy));
                if (dist <= skillcfg.areaarg1)
                {
                    outEidlist.push(animalEntity.eid);
                }
            }
        }

        // console.log('attr id list:', attackEntity.name, ':', skillcfg.name, '=>', lockEntity.name, ':', lockEntity.eid, '  ', outEidlist);
        return outEidlist;
    }

    public animalMove(animalEntity:FightingAnimalEntity, x:number, y:number):boolean
    {
        let node = this.astarMap.getNodeByGrid(x, y);
        if (node && node.walkable)
        {
            // console.log((new Date()).toTimeString(), animalEntity.eid, animalEntity.name, `(${animalEntity.sx}, ${animalEntity.sy})=>(${x}, ${y})`);

            this.astarMap.setWalkable(animalEntity.sx, animalEntity.sy, true);
            animalEntity.setXY(x, y);
            this.astarMap.setWalkable(x, y, false);

            for (let tempAnimalEntity of this.animalList)
            {
                tempAnimalEntity.checkLockEntityMove(animalEntity);
            }
            
            // 同步前端
            this.player.send(CmdID.s2c_fighting_animal_move, {uEid:animalEntity.eid, x, y});
            return true;
        }
        return false;
    }

    //--------------------------------------------------------------------------------------
    public get mapcfg(): MapCFG 
    {
        return this._mapCfg;
    }
    //--------------------------------------------------------------------------------------

    public isHeroPetEntity(petEntity: FightingMonsterEntity): boolean 
    {
        return petEntity.ownerEntity == this.heroEntity;
    }

    private reset(): void 
    {
        let animalList = this.animalList;
        for (let animalEntity of animalList) 
        {
            animalEntity.destroy();
        }
        this.animalList.length = 0;

        // this.enemyList.length = 0;

        // this.teamList.length = 0;

        this.animalMap = {};
    }

    public checkHeroHPMP(hpPercent: number, mpPercent: number): void 
    {
        if(!this.isPK)
        {
            this.player.verifySettings(hpPercent, mpPercent);
        }
    }

    public checkDrop(itemid: number): boolean 
    {
        return this.player?.dropmaxEntity.checkDrop(itemid);
    }

    public addDrop(itemid: number, count: number): void 
    {
        this.player?.dropmaxEntity?.addDrop(itemid, count);
    }

    //--------------------------------------------------------------------------------------
    private createRndPlayer(x:number, y:number):void
    {
        if (this.animalList.length < 4)
        {
            let sql = `select roleId from cy_role_attr`;
            DBForm.instance.query(sql, (err, data)=>
            {
                if (err)
                {
                    return;
                }
    
                let rows:{roleId:number}[] = data;
                if (rows && rows.length > 0)
                {
                    let roleId = rows[Math.floor(Math.random() * rows.length)].roleId;
                    this.addPlayer(roleId, x, y);
                }
            });
        }
    }

    public addPlayer(roleId:number, x?:number, y?:number): void 
    {
        let player = PlayerMgr.shared.getPlayerByRoleId(roleId);
        if (player)
        {
            this.createPlayer(player.name, player.profession, player.level, player.totalAttr, player.learnSkillIdList, player.passBuffIdList, player, x, y);
        }
        else
        {
            let sql = `select cy_role.role_name, cy_role.role_level, cy_role.profession, cy_role_attr.* from cy_role_attr, cy_role where cy_role_attr.roleId = cy_role.role_id AND cy_role.role_id = ${roleId};`;
            DBForm.instance.query(sql, (err, data)=>
            {
                if (err)
                {
                    return;
                }
    
                let playerObj = data?.[0];
                if (playerObj)
                {
                    let attr = new RoleFightAttr(playerObj.profession);
                    attr.deserializeDB(playerObj);
                    let skillIdList:number[] = DataUtil.jsonBy(playerObj.skillIdList);
                    let passBuffIdList:number[] = Array.isArray(playerObj.passBuffIdList) ? playerObj.passBuffIdList : [];
                    this.createPlayer(playerObj.role_name, playerObj.profession, playerObj.role_level, attr, skillIdList, passBuffIdList, null, x, y);
                }
            });
        }
    }
    private createPlayer(name:string, profession:number, level:number, attr:BaseRoleAttr, skillIdList:number[], passBuffIdList:number[], player?:Player, x?:number, y?:number):void
    {
        let playerAttr = new FightingPlayerAttr();
        playerAttr.initValue(0, name, level, profession, 3, attr, skillIdList, player ? player.passBuffIdList : passBuffIdList);
        let playerEntity: FightingOtherPlayerEntity = new FightingOtherPlayerEntity();
        playerEntity.setPlayer(player, playerAttr);
        playerEntity.init(this);
       
        let isAddOk = this.setAnimalXY(playerEntity, x, y);
        if (isAddOk)
        {
            // this.teamList.push(heroEntity);
            this.addAnimalEntity(playerEntity);
            this.sendCreatePlayer(playerEntity.eid, playerAttr.profession, playerAttr.name, playerAttr.level, playerAttr.hp, playerAttr.mp, playerEntity.sx, playerEntity.sy);
        }
        else
        {
            playerEntity.destroy();
        }
    }

    private addHero(player:Player, x?:number, y?:number): void 
    {
        let heroAttr = new FightingPlayerAttr();
        heroAttr.initValue(player.onlyid, player.name, player.level, player.profession, player.teamId, player.totalAttr, player.learnSkillIdList, player.passBuffIdList);
        // heroAttr.hp = heroAttr.maxhp = 99999999;
        // heroAttr.mp = heroAttr.maxmp = 99999999;
        // heroAttr.hp *= 99999;
        // heroAttr.maxhp = heroAttr.hp;
        let heroEntity: FightingHeroEntity;
        if (player.profession == EProfessionType.DAOSHI) 
        {
            heroEntity = new FightingTaoistEntity();
        }
        else if (player.profession == EProfessionType.FASHI) 
        {
            heroEntity = new FightingRabbiEntity();
        }
        else 
        {
            heroEntity = new FightingSoliderEntity();
        }
        heroEntity.setPlayer(player, heroAttr);
        heroEntity.init(this);
        this.setAnimalXY(heroEntity, x, y);

        this.heroEntity = heroEntity;

        // this.teamList.push(heroEntity);
        this.addAnimalEntity(heroEntity);
        
        this.sendCreateHero(heroEntity.hp, heroEntity.mp, heroEntity.sx, heroEntity.sy);
    }

    private addAnimalEntity(animalEntity: FightingAnimalEntity): void 
    {
        for (let animal of this.animalList)
        {
            animal.checkLockEntityCreate(animalEntity);
        }

        this.animalMap[animalEntity.eid] = animalEntity;
        this.animalList.push(animalEntity);
    }

    //--------------------------------------------------------------------------------------
    private setRndPoint(animalEntity:FightingAnimalEntity):boolean
    {
        let spoint = this.astarMap.getRndPoint();
        if (spoint)
        {
            return this.setAnimalXY(animalEntity, spoint.x, spoint.y);
        }
        return false;
    }

    private setAnimalXY(animalEntity:FightingAnimalEntity, x:number, y:number):boolean
    {
        if (x !== undefined && y !== undefined)
        {
            let tmpnode = this.astarMap.getNodeByGrid(x, y);
            if (tmpnode.walkable)
            {
                animalEntity.setXY(x, y);
                this.astarMap.setWalkable(animalEntity.sx, animalEntity.sy, false);
                return true;
            }
        }
        return this.setRndPoint(animalEntity);
    }

    private createRndMonster(): void 
    {
        let mapId = this._mapCfg.id;
        let monsterId: number = MapConfig.instance.getRndMonsterId(mapId);
        let monsterCfg = MonsterConfig.instance.getMonsterCfgById(monsterId);
        if (monsterCfg) {
            let monsterQuality: number = MapConfig.instance.getRndQuality(mapId);
            // monsterQuality = 2;
            this.createMonster(monsterId, monsterQuality);
        }
        else {
            Logger.log(`地图中未配置怪 MonsterID:${monsterId}`);
        }
    }

    private createMonster(monsterId: number, quality: number, ownerEntity?: FightingAnimalEntity, skillcfg?: SkillCFG): FightingMonsterEntity 
    {
        let monsterAttr = new FightingMonsterAttr();
        monsterAttr.setMonsterID(monsterId, quality);

        if (skillcfg) {
            let petAttr = monsterAttr;
            let petAddition: number[] = skillcfg.petaddition;
            if (petAddition) {
                let ownerAttr = ownerEntity.animalAttr;
                let tmpAtk = Math.floor((ownerAttr.minact + ownerAttr.maxact) / 2);
                petAttr.maxhp = petAttr.hp += (tmpAtk * (petAddition[0] || 0) * 0.01);
                petAttr.minac += (tmpAtk * (petAddition[1] || 0) * 0.01);
                petAttr.maxac += (tmpAtk * (petAddition[1] || 0) * 0.01);
                petAttr.minzs = petAttr.minact += (tmpAtk * (petAddition[2] || 0) * 0.01);;
                petAttr.maxzs = petAttr.maxact += (tmpAtk * (petAddition[3] || 0) * 0.01);
                petAttr.fixeddamage += (ownerAttr.fixeddamage * (petAddition[4] || 0) * 0.01);
                petAttr.fixedac += (ownerAttr.fixedac * (petAddition[5] || 0) * 0.01);
                petAttr.hit += (ownerAttr.hit * (petAddition[6] || 0) * 0.01);
                petAttr.evade += (ownerAttr.evade * (petAddition[7] || 0) * 0.01);
                petAttr.critical += (ownerAttr.critical * (petAddition[8] || 0) * 0.01);
                petAttr.tenacity += (ownerAttr.tenacity * (petAddition[9] || 0) * 0.01);
            }
        }

        let monsterEntity: FightingMonsterEntity = new FightingMonsterEntity();//this.monsterPool.alloc();// 
        monsterEntity.setAttr(monsterAttr);
        monsterEntity.init(this);
        monsterEntity.setOwner(ownerEntity);
        this.setRndPoint(monsterEntity);

        if (ownerEntity) 
        {
            // console.log('召唤：', ownerEntity.name, '=>', skillcfg?.name, ' PET:', monsterEntity.eid, skillcfg.petid);

            ownerEntity.addChildEntity(monsterEntity);
        }
        this.addAnimalEntity(monsterEntity);

        this.sendCreateAnimal(monsterEntity.eid, monsterId, ownerEntity?.eid || 0, quality, monsterEntity.hp, monsterEntity.maxHp, monsterEntity.sx, monsterEntity.sy);

        return monsterEntity;
    }

    private createBoss(bossId: number): void 
    {
        let bossCfg = MonsterConfig.instance.getMonsterCfgById(bossId);

        if (bossCfg) 
        {
            for (let monsterEntiry of this.animalList) 
            {
                if ((monsterEntiry instanceof FightingMonsterEntity) && (monsterEntiry.monsterId === bossId)) 
                {
                    return;
                }
            }

            let bossAttr = new FightingMonsterAttr();
            bossAttr.setMonsterID(bossId, 5);
            bossAttr.hp = this.player?.bossEntity?.getBossHp(bossId);

            // Logger.log("Boss复活", bossId, bossAttr.hp);

            let bossEntity: FightingBossEntity = new FightingBossEntity();
            bossEntity.setAttr(bossAttr);
            bossEntity.init(this);
            this.setRndPoint(bossEntity);

            this.addAnimalEntity(bossEntity);

            this.sendCreateAnimal(bossEntity.eid, bossId, 0, bossAttr.quality, bossEntity.hp, bossEntity.maxHp, bossEntity.sx, bossEntity.sy);
        }
        else 
        {
            this.traceError(`BossID不存在 bossId:${bossId}`);
        }
    }

    public removeAnimal(animalEntity: FightingAnimalEntity): void 
    {
        // Logger.log(`生物死亡 Eid:${animalEntity.eid} ${animalEntity.name} PET:[${animalEntity.petlist.map((pet)=>{return pet.name})}]`);

        let tx = animalEntity.sx;
        let ty = animalEntity.sy;
        setTimeout(() => 
        {
            if (!this.isDispose)
            {
                for (let animal of this.animalList)
                {
                    animal.checkLockEntityDie();
                }
                
                this.astarMap.setWalkable(tx, ty, true);
            }
        }, 1000);

        // ArrayUtil.fastRemove(this.enemyList, monsterEntity);
        // ArrayUtil.fastRemove(this.teamList, monsterEntity);
        ArrayUtil.fastRemove(this.animalList, animalEntity);
        delete this.animalMap[animalEntity.eid];

        animalEntity.destroy();
    }

    /** 怪死亡 */
    public dieMonster(monsterEntity: FightingMonsterEntity): void 
    {
        if (monsterEntity.ownerEntity) 
        {
            // console.log("宠物死亡：", monsterEntity.eid, monsterEntity.name);
        }
        else
        {
            this.statKillMonster(monsterEntity.monsterId);
        }

        this.sendRemoveMonster(monsterEntity.eid);
        this.removeAnimal(monsterEntity);
    }

    /** Boss死亡 */
    public dieBoss(bossEntity: FightingBossEntity): void 
    {
        this.player.bossDie(bossEntity.monsterId);

        // let bossInfo = this.getBossInfo(bossEntity);
        // bossInfo.isLive = false;
        // bossInfo.dieTime = Date.now();
    }

    /** 角色死亡 */
    public diePlayer(playerEntity: FightingPlayerEntity): void 
    {
        this.sendRemoveMonster(playerEntity.eid);

        this.removeAnimal(playerEntity);

        if (this.isPK)
        {
            this.player.emit(PlayerEvent.FIGHTING_PK_OVER, true);
            this.player.send(CmdID.s2c_fighting_result, {isWin:true});

            this.stop();
        }
    }

    public dieHero(uEid: number): void 
    {
        // let animalEntity = this.animalMap[uEid];
        // this.astarMap.setWalkable(animalEntity.sx, animalEntity.sy, true);

        this.player.send(CmdID.s2c_fighting_hero_die, { uEid: uEid });
        this.player.emit(PlayerEvent.FIGHTING_HERO_DIE);
        if (this.isPK)
        {
            this.player.emit(PlayerEvent.FIGHTING_PK_OVER, false);
            this.player.send(CmdID.s2c_fighting_result, {isWin:false});

            this.stop();
        }
    }

    private statKillMonster(monsterId: number): void 
    {
        this.player.emit(PlayerEvent.FIGHTING_KILL_MONSTER, monsterId);
        
        this.player.killMonsterEntity.addKillMonster(monsterId, 1);
    }

    //--------------------------------------------------------------------------------------
    /**  */
    public attack(attackUid: number, skillId: number, pos: number[], hitUids: number[]): void 
    {
        this.player.send(CmdID.s2c_fighting_fire_skill_ack, { uEid: attackUid, skillId: skillId, hitEidList:hitUids });//, pos:pos, hitUids:hitUids

        let skillCfg = SkillConfig.instance.getSkillCfgById(skillId);
        if (!skillCfg) 
        {
            this.traceError(`释放技能不存在 SkillID:${skillId}`);
            return;
        }

        let attackAnimal = this.animalMap[attackUid];
        if (attackAnimal) 
        {
            if (!attackAnimal.isLive) 
            {
                this.traceError(`攻击者已死亡 ${attackAnimal.eid}:${attackAnimal.name}`);
                return;
            }

            if (skillCfg.triggertype === ESkillTriggerType.PASSIVE) 
            {
                if (attackAnimal.triggerPassSkillCFG?.id !== skillId) 
                {
                    // 被动技能前端不能触发
                    // this.traceError(`被动技能前端不能触发 AtkID:${attackUid},${attackAnimal.name}=>HitId${hitUids} SkillID:${skillId}-${skillCfg.name}`);
                    return;
                }
                else 
                {
                    attackAnimal.resetTriggerPassSkillId();
                }
            }

            let errorCode = attackAnimal.useSkill(skillCfg, hitUids.length);
            // skillCfg = SkillConfig.instance.getSkillCfgById(skillId);
            if (errorCode == ErrorConst.SUCCEED) 
            {
                // 检测是否触发被动技能：比如攻杀
                attackAnimal.checkTriggerPassSkill();

                if (attackAnimal.triggerPassSkillCFG) 
                {
                    let baseSkillId = attackAnimal.triggerPassSkillCFG.baseId;
                    if (baseSkillId === ESkillId.skill_1002) 
                    {
                        // this.triggerPassSkillId = attackAnimal.getLearnSkillId(tmpBaseSkillId);
                        // 触发攻杀通知前端
                        this.player.send(CmdID.s2c_fighting_trigger_pass, { uEid: attackAnimal.eid, type: EFightingPassType.GONG_SHA, skillId: skillId });
                    }
                }

                this.addSkillExp(attackAnimal, skillCfg);

                if (skillCfg.triggertype == ESkillTriggerType.SUMMON) 
                {
                    if (attackAnimal.childCount < skillCfg.petnum) 
                    {
                        // 召唤
                        let summonNum = skillCfg.petnum - attackAnimal.childCount;
                        for (let i: number = 0; i < summonNum; i++) 
                        {
                            this.createMonster(skillCfg.petid, 1, attackAnimal, skillCfg);
                        }
                    }
                    else 
                    {
                        this.traceError(`召唤数据已达上限 ${attackUid},${attackAnimal.name}  ${attackAnimal.childCount}/${skillCfg.petnum}`);
                    }
                }
                else if (skillCfg.targetside == ESkillTarget.SELF) 
                {
                    // 释发给自己
                    if (attackAnimal) 
                    {
                        attackAnimal.hitSelf(attackAnimal, skillCfg);
                    }
                    else 
                    {
                        // 技能只能释放给自己
                        this.traceError(`技能只能释放给自己 AtkID:${attackUid},${attackAnimal.name}=>HitId${hitUids} Skill:${skillCfg.name}_${skillCfg.name}`);
                        return;
                    }
                }
                else 
                {
                    let hurtValue: number = 0;
                    let hitAnimal: FightingAnimalEntity;
                    for (let hitUid of hitUids) 
                    {
                        hitAnimal = this.animalMap[hitUid];
                        if (hitAnimal) 
                        {
                            // console.log(new Date().toTimeString(), `攻击：${attackAnimal.name}:${attackAnimal.eid}(${attackAnimal.sx}, ${attackAnimal.sy})=>${hitAnimal.name}:${hitAnimal.eid}(${hitAnimal.sx}, ${hitAnimal.sy}) Skill:${skillCfg.name}`)

                            if (skillCfg.targetside === ESkillTarget.FRIENDLY)// && hitAnimal.ownerEntity == attackAnimal
                            {
                                // 释发给友军
                                if (hitAnimal.teamId !== attackAnimal.teamId) 
                                {
                                    // 技能只能释放给自己
                                    this.traceError(`技能只能释放给友军 AtkID:${attackUid}, ${attackAnimal.name}=>HitId${hitUid} SkillID:${skillId}_${skillCfg.name}`);
                                    return;
                                }
                                else 
                                {
                                    hitAnimal.hitFriendly(attackAnimal, skillCfg);
                                }
                            }
                            else {
                                if (hitAnimal.teamId !== attackAnimal.teamId) 
                                {
                                    // 释发给敌军
                                    hurtValue += hitAnimal.hitEntity(attackAnimal, skillCfg);
                                }
                                else 
                                {
                                    // 宝宝不能攻击主人
                                    this.traceError(`宝宝不能攻击主人 AtkID:${attackUid},${attackAnimal.name}=>HitId${hitUid} SkillID:${skillId}`);
                                    return;
                                }
                            }
                        }
                        // else 
                        // {
                        //     // this.sendRemoveMonster(hitUid);
                        //     // 受击者不存在
                        //     this.traceError(`受击者不存在 AtkID:${attackUid},${attackAnimal.name}=>HitId${hitUid} SkillID:${skillId}`);
                        //     return;
                        // }
                    }

                    if (hurtValue) {
                        // 算吸血
                        attackAnimal.calcGain();
                    }
                }
            }
            else {
                // this.traceClient(`释放技能异常 ErrorCode:${errorCode} AtkID:${attackUid}=>HitId${hitUid} SkillID:${skillId}`);
            }
        }
        else {
            // 攻击者不存在
            this.traceError(`攻击者不存在 Uid:${attackUid}`);
            return;
        }
    }

    //------------------------------------------------------------------------------------------------------
    private testPosSet:Set<string> = new Set();
    private logAllAnimal():void
    {
        let set = this.testPosSet;
        set.clear();

        let err:boolean = false;
        for (let animal of this.animalList)
        {
            let tmpk = `${animal.sx}_${animal.sy}`;
            if (set.has(tmpk))
            {
                err = true;
                break;
            }
            set.add(tmpk);
        }

        if (err)
        {
            this.traceAnimalPoint();
        }
    }

    public traceAnimalPoint():void
    {
        let msg:string = '';
        for (let animal of this.animalList)
        {
            msg += `${animal.eid}_${animal.name} ${animal.sx+1},${animal.sy+1}\n`;
        }
        
        console.log('---------------------------------------------------------');
        console.log(msg);
        console.log('---------------------------------------------------------');
    }

    //------------------------------------------------------------------------------------------------------

    private addSkillExp(attackAnimal: FightingAnimalEntity, skillcfg:SkillCFG): void 
    {
        if (attackAnimal === this.heroEntity) 
        {
            // console.log(`addSkillExp:${skillId}`);
            // this.player?.skillMgr?.addExpBySkillId(baseSkillId, 1);
            if (skillcfg.id > 10000) {
                let baseSkillId = skillcfg.baseId;
                // 增加技能熟练度
                this.player?.skillMgr?.addExpBySkillId(baseSkillId, 1);

                if (baseSkillId === ESkillId.skill_3003 && attackAnimal.checkLearnBaseId(ESkillId.skill_3001) && this.player?.profession == EProfessionType.DAOSHI) {
                    this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_3001, 1);//skill_3005
                }
                else if (baseSkillId === ESkillId.skill_2002 && attackAnimal.checkLearnBaseId(ESkillId.skill_2001) && this.player?.profession === EProfessionType.FASHI) {
                    this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_2001, 1);//skill_2001
                }
                else if (baseSkillId === ESkillId.skill_1003 && attackAnimal.checkLearnBaseId(ESkillId.skill_1001) && this.player?.profession === EProfessionType.ZHANSHI) {
                    this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_1001, 1);//skill_2001
                }
            }
            else {
                if (attackAnimal.checkLearnBaseId(ESkillId.skill_1001) && this.player?.profession === EProfessionType.ZHANSHI) {
                    this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_1001, 1);
                }
                // if (attackAnimal.checkLearnBaseId(ESkillId.skill_3001) && this.player?.profession == EProfessionType.DAOSHI)
                // {
                //     this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_3001, 1);//skill_3005
                // }
                // else if (attackAnimal.checkLearnBaseId(ESkillId.skill_2001) && this.player?.profession === EProfessionType.FASHI)
                // {
                //     // 火球
                //     this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_2001, 1);//skill_2001
                // }
            }
        }
        else if (attackAnimal.ownerEntity === this.heroEntity) {
            // 宠物增加技能熟练度
            if (this.player?.profession == EProfessionType.DAOSHI) {
                this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_3005, 1);
            }
            else if (this.player?.profession === EProfessionType.FASHI) {
                this.player?.skillMgr?.addExpBySkillId(ESkillId.skill_2004, 1);
            }
        }
    }
    //--------------------------------------------------------------------------------------

    /** Boss复活 */
    private onBossRevive = (bossId: number) => 
    {
        if (this._mapCfg && this._mapCfg.boss == bossId) 
        {
            this.createBoss(this._mapCfg.boss);
        }
    }

    //--------------------------------------------------------------------------------------
    private isFighting:boolean = false;
    public isPK:boolean = false;
    private pkTimeId:NodeJS.Timeout;
    public start(mapId: number, roleId?:number): void 
    {
        if (this.isDispose)
        {
            return;
        }

        if (this._mapCfg && this._mapCfg.id !== mapId) 
        {
            this.stop();
        }

        if (!this.isFighting) 
        {
            let mapCfg = MapConfig.instance.getMapCfgById(mapId);
            if (mapCfg) 
            {
                if (mapCfg.size)
                {
                    this.isPK = (mapCfg.type === EMapType.PK);//true;//
                    this._mapCfg = mapCfg;
    
                    this.astarMap.setSize(mapCfg.size[0], mapCfg.size[1]);
                    
                    if (this.isPK)
                    {
                        this.addHero(this.player, 1, 2);
                        if (roleId)
                        {
                            this.addPlayer(roleId, 4, 2);
                        }
                        else
                        {
                            this.createRndPlayer(4, 2);
                        }

                        this.pkTimeId = setTimeout(() => 
                        {
                            this.isFighting = true;
                        }, 3000);
                    }
                    else
                    {
                        this.isFighting = true;

                        this.addHero(this.player);

                        this.player.on(CmdID.c2s_fighting_sync_animal, this.onReqSyncAnimal);
                        this.player.on(PlayerEvent.FIGHTING_BOSS_REVIVE, this.onBossRevive);

                        if (mapCfg.boss) 
                        {
                            if (this.player.bossEntity.checkBossLive(mapCfg.boss)) 
                            {
                                this.createBoss(mapCfg.boss);
                            }
                        }

                        this.checkCreateMonster();
                    }
                }
                else
                {
                    this.traceError(`副本大小未配置：${mapCfg.id}:${mapCfg.name}`);
                }
            }
            else {
                this.traceError(`副本不存在：${mapId}`);
            }
        }
    }

    public stop(): void 
    {
        if (this.isFighting) 
        {
            clearTimeout(this.pkTimeId);

            this.isFighting = false;

            this._mapCfg = undefined;

            this.player.off(CmdID.c2s_fighting_sync_animal, this.onReqSyncAnimal);
            this.player.off(PlayerEvent.FIGHTING_BOSS_REVIVE, this.onBossRevive);
            // this.player.off(CmdID.c2s_hero_revive, this.onReqRevive);

            this.reset();
        }
    }

    private createAnimalDt: number = 0;
    /**
     * 
     * @param dt 秒
     */
    public update(dt: number): void 
    {
        if (this.isFighting)
        {
            this.createAnimalDt += dt;
            if (this.isPK)
            {
                if (this.createAnimalDt > 2) 
                {
                    this.createAnimalDt = 0;

                    // this.createRndPlayer();
                }
            }
            else
            {
                if (this.createAnimalDt > 2.5) 
                {
                    this.createAnimalDt = 0;
                    // 生成怪
                    this.checkCreateMonster();
                }
            }
    
            for (let animalEntity of this.animalList) 
            {
                animalEntity.update(dt);
            }
        
            // this.logAllAnimal();
        }
    }

    private checkCreateMonster(isFirst:boolean = true): void 
    {
        let enemyCount = 0;
        for (let animal of this.animalList)
        {
            if ((animal instanceof FightingMonsterEntity) && !animal.ownerEntity)
            {
                enemyCount ++;
            }
        }

        if (enemyCount < this._mapCfg.maxmonsters)
        {
            this.createRndMonster();
            // this.createRndMonster();
            // this.createRndMonster();

            if (isFirst && Math.random() > 0.6) 
            {
                this.checkCreateMonster(false);
            }
        }
    }

    public statBossHp(bossId: number, hp: number): void 
    {
        this.player?.bossEntity.setBossHp(bossId, hp);
    }
    //-------------------------------------------------------------------------------------------------
    /** 补HP */
    public takeHp(value: number): void {
        this.heroEntity.takeHp(value);
    }

    /** 补MP */
    public takeMp(value: number): void {
        this.heroEntity.takeMp(value);
    }

    //-------------------------------------------------------------------------------------------------
    // 发消息专用
    // private traceErrorSt:number = Date.now();
    // private traceErrorNum:number = 0;
    public traceError(msg:string):void
    {
        Logger.log(msg);
        this.player.traceClient(msg);

        // this.traceErrorNum ++;
        // if (Date.now() - this.traceErrorSt > 15000)
        // {
        //     if (this.traceErrorNum > 15)
        //     {
        //         this.player.destroy();
        //     }
            
        //     this.traceErrorSt = Date.now();
        //     this.traceErrorNum = 0;
        // }
    }

    /** 创建怪 */
    public sendCreateAnimal(eid: number, monsterId: number, ownerEid: number, quality: number, hp: number, maxHp: number, x:number, y:number): void 
    {
        // const monsterCfg = MonsterConfig.instance.getMonsterCfgById(monsterId);
        this.player.send(CmdID.s2c_fighting_add_monster, { uEid: eid, monsterId: monsterId, ownerEid: ownerEid, quality: quality, hp: hp, maxhp: maxHp, x, y });
    }

    public sendCreateHero(hp:number, mp:number, x:number, y:number):void
    {
        this.player.send(CmdID.s2c_fighting_add_hero, {hp, mp, x, y });
    }

    public sendCreatePlayer(uEid: number, profession: EProfessionType, name: string, level:number, hp: number, mp: number, x:number, y:number):void
    {
        this.player.send(CmdID.s2c_fighting_add_player, {uEid, profession, name, level, hp, mp, x, y });
    }

    /** 删除怪 */
    public sendRemoveMonster(eid: number): void {
        // let monsterCfg = MonsterConfig.instance.getMonsterCfgById(monsterId);
        this.player.send(CmdID.s2c_fighting_remove_monster, { uEid: eid });
    }

    /** 增加Buff */
    public sendAddBuff(eid: number, buffEid: number, buffId: number): void {
        this.player.send(CmdID.s2c_fighting_add_buff, { uEid: eid, buffEid: buffEid, buffId: buffId });
    }
    public sendRemoveBuff(eid: number, buffEid: number): void {
        this.player.send(CmdID.s2c_fighting_remove_buff, { uEid: eid, buffEid: buffEid });
    }
    /** 属性变化  */
    public sendChangeAttr(eid: number, attrId: number, value: number): void {
        this.player.send(CmdID.s2c_fighting_change_attr, { uEid: eid, attrId: attrId, value: value });
        // this.traceClient(`属性变化  ${eid}_${attrId}_${value}`);
    }

    /**
     * 血量变化 
     * @param eid 变化者Eid
     * @param type EFightingHurtType
     * @param changeValue 
     * @param newValue 
     */
    public sendHpChange(eid: number, type: EFightingHurtType, changeValue: number, newValue: number): void {
        // this.player.send(CmdID.s2c_test_ack, {t:159912685731855});

        // if (changeValue)
        {
            this.player.send(CmdID.s2c_fighting_change_hp, { uEid: eid, type: type, changeValue: Math.floor(changeValue), newValue });
        }
    }

    /**
     * 掉落
     * @param uEid 用户ID
     * @param gold 金币
     * @param itemList 物品列表{itemId:number, value:number} itemId为装备的时候，value=品质，其他情况为数量 
     */
    public sendDrop(animalEntity: FightingMonsterEntity, exp: number, gold: number, itemList: { itemId: number, value: number, count: number, quality: number, tequan: boolean }[]): void 
    {
        // for (let itemObj of itemList)
        // {
        //     this.player.addItem(itemObj.itemId, itemObj.value, false, "战斗掉落");
        // }

        let extraExp = Math.ceil(this.player.totalAttr.addexp * exp * 0.01);
        let extraGold = Math.ceil(this.player.totalAttr.goldAdd * gold * 0.01);
        // let gainExp = Math.ceil(extraExp + exp);
        let gainGold = Math.ceil(extraGold + gold);

        // Logger.log(`掉落：${animalEntity.name}, exp:${exp}, gold:${gainGold}, itemList:${DataUtil.toJson(itemList)}`);

        this.player.fightingDrop(animalEntity.eid, animalEntity.monsterId, animalEntity.quality, exp, extraExp, gainGold, extraGold, itemList);
    }

    /** 
     * 请求复活 
     * type=1 元宝恢复
     * type=2 看视频复活
     * */
    private onReqRevive = (bodyObj: { type: number }) => 
    {
        if (!this.isFighting)
        {
            // 未在战斗中
            // this.player.send(CmdID.s2c_notice, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
            return;
        }
        if (this.heroEntity?.isLive)
        {
            // 角色未死亡，不需要复活
            // this.player.send(CmdID.s2c_notice, { code: ErrorConst.FAILED });
            return;
        }

        bodyObj = bodyObj || { type: 2 };
        // 验证是否可复活
        if (bodyObj.type == 1) 
        {
            if (this.player.yuanbao >= 20) 
            {
                this.player.addMoney(ERichesType.Yuanbao, -20, "主角复活");

                this.heroEntity.revive();
                this.player.send(CmdID.s2c_hero_revive, { code: ErrorConst.SUCCEED, uEid: this.heroEntity.eid, hp: this.heroEntity.hp, mp: this.heroEntity.mp });
            }
            else {
                this.player.send(CmdID.s2c_notice, { code: ErrorConst.YUANBAO_NOT_ENOUGH });
            }
        }
        else if (bodyObj.type == 2) 
        {
            if (this.player.dayMap.localRelive < this.player.dayMap.localReliveMax) 
            {
                this.heroEntity.revive();
                this.player.dayMap.updateDayMap(EDayMapType.videoRelive);
                this.player.send(CmdID.s2c_hero_revive, { code: ErrorConst.SUCCEED, uEid: this.heroEntity.eid, hp: this.heroEntity.hp, mp: this.heroEntity.mp });
            } 
            else 
            {
                this.player.send(CmdID.s2c_notice, { code: ErrorConst.TIME_USE_UP });
            }
        }
        else {
            this.player.send(CmdID.s2c_hero_revive, { code: ErrorConst.FAILED });
        }
    }

    private onReqSyncAnimal = ()=>
    {
        let animalObjList:{uEid:number, monsterId:number, quality:number, ownerEid:number, bufflist:{uEid:number, buffId:number}[], hp:number, maxhp:number, mp:number, maxmp:number, x:number, y:number}[] = [];
        for (let animal of this.animalList)
        {
            animalObjList.push({
                uEid:animal.eid,
                ownerEid:animal?.ownerEntity?.eid ?? 0,
                bufflist:animal.buffIdList,
                hp:animal.hp,
                maxhp:animal.maxHp,
                mp:animal.mp,
                maxmp:animal.maxMp,
                x:animal.sx,
                y:animal.sy,
                monsterId:(animal instanceof FightingMonsterEntity) ? animal.monsterId : 0,
                quality:(animal instanceof FightingMonsterEntity) ? animal.quality : 0
            });
        }
        
        this.player.send(CmdID.s2c_fighting_sync_animal, {animalList:animalObjList});

        // this.traceAnimalPoint();
    }

    //---------------------------------------------------------------------------------------------------------------

    protected onDestroy(): void 
    {
        this.player.off(CmdID.c2s_hero_revive, this.onReqRevive);

        this.stop();

        this.astarMap.destroy();
        this.astarMap = null;
        this.astar = null;

        super.onDestroy();
    }
}