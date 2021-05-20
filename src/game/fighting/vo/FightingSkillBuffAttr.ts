import SkillBuffCFG from "../../config/cfg/SkillBuffCFG";
import FightingAnimalEntity from "../entity/FightingAnimalEntity";
import FightingSkillBuffVO from "./FightingSkillBuffVO";

export default class FightingSkillBuffAttr
{
    //-----------------------------------
    // 增加属性
    /** 生命吸取 */
    private _addHp:number = 0;
    /** 生命吸取百分比 */
    private _lifeDraw:number = 0;
    /** 法力吸取 */
    private _addMp:number = 0;
    /** 攻击力 */
    private _zs:number = 0;
    /** 魔力 */
    private _fs:number = 0;
    /** 道术 */
    private _ds:number = 0;
    /** 防御值 */
    private _ac:number = 0;
    /** 防御百分比 */
    private _ac2:number = 0;
    /** 攻击百分比 */
    private _zs2:number = 0;
    /** 魔力百分比 */
    private _fs2:number = 0;
    /** 道术百分比 */
    private _ds2:number = 0;
    /** 攻击速度百分比 */
    private _atkSpeek:number = 0;
    /** 闪避 */
    private _evade:number = 0;

    //-----------------------------------
    // 持续增益
    /** 每秒增加基础生命百分比 */
    private _hpPercent:number = 0;
    /** 每秒增加生命值  */
    private _hp:number = 0;
    /** 每秒增加魔法值  */
    private _mp:number = 0;
    

    //----------------------------------------------------------------
    /** 状态 0：无 1：眩晕  2：定身 */
    private _state:number = 0;
    
    /** 生命值上限 */
    private _maxHp:number = 0;
    /** 生命值上限百分比 */
    private _maxHp2:number = 0;

    /** 附加魔法值上限 */
    private _maxMp:number = 0;
    /** 法力值上限百分比 */
    private _maxMp2:number = 0;

    /** 经验增幅百分比 */
    private _exp2:number = 0;
    // /** 护盾 */
    // private _shiled:number = 0;

    /** 受到伤害降低百分比 */
    private _injuryFree:number = 0;

    private _injuryincrease:number = 0;

    //----------------------------------------------------------------
    constructor()
    {
        this.reset();
    }
    
    public reset():void
    {
        this._addHp = this._lifeDraw = this._addMp = 0;
        this._ac = this._zs = this._fs = this._ds = 0;

        this._ac2 = this._zs2 = this._fs2 = this._ds = 0;

        this._atkSpeek = this._evade = 0;

        this._hpPercent = this._hp = this._mp = 0;

        this._state = 0;

        this._maxHp = this._maxHp2 = this._maxMp = this._maxHp2 = 0;

        this._exp2 = 0;

        this._injuryFree = 0;
        this._injuryincrease = 0;
    }

    public addBuff(buffVo:FightingSkillBuffVO):void
    {
        let buffCfg = buffVo.buffCfg;

        let mulFactor:number = 1;//buffCfg.bufftype == 1 ? 1 : -1;
        
        this._hp += (buffCfg.hp ?? 0) * mulFactor;
        this._mp += (buffCfg.mp ?? 0) * mulFactor;
        this._addHp += (buffCfg.addhp ?? 0) * mulFactor;
        this._lifeDraw += (buffCfg.lifedraw ?? 0) * mulFactor;
        this._addMp += (buffCfg.addmp ?? 0) * mulFactor;
        this._zs += (buffCfg.zs ?? 0) * mulFactor;
        this._fs += (buffCfg.fs ?? 0) * mulFactor;
        this._ds += (buffCfg.ds ?? 0) * mulFactor;
        this._ac += (buffCfg.ac ?? 0) * mulFactor;
        this._ac2 += (buffCfg.ac2 ?? 0) * mulFactor * 0.01;
        this._fs2 += (buffCfg.fs2 ?? 0) * mulFactor * 0.01;
        this._zs2 += (buffCfg.zs2 ?? 0) * mulFactor * 0.01;
        this._ds2 += (buffCfg.ds2 ?? 0) * mulFactor * 0.01;
        this._atkSpeek += (buffCfg.atkspped ?? 0) * mulFactor;
        this._evade += (buffCfg.dodge ?? 0) * mulFactor;
        this._hpPercent += (buffCfg.hppercent ?? 0) * mulFactor * 0.01;
        this._state |+ (buffCfg.state ?? 0) * mulFactor;
        this._maxHp += (buffCfg.maxhp ?? 0) * mulFactor;
        this._maxHp2 += (buffCfg.maxhp2 ?? 0) * mulFactor * 0.01;
        this._maxMp += (buffCfg.maxmp ?? 0) * mulFactor;
        this._maxMp2 += (buffCfg.maxmp2 ?? 0) * mulFactor * 0.01;
        this._exp2 += (buffCfg.exp2 ?? 0) * mulFactor * 0.01;
        this._injuryFree += (buffCfg.Injuryfree ?? 0) * mulFactor;
        this._injuryincrease += (buffCfg.Injuryincrease ?? 0) * mulFactor;

        this._hp += buffVo.hp;
        this._ac += buffVo.ac;
    }

    //----------------------------------------------------------------
    /** 攻击力 */
    public get atk():number
    {
        return Math.max(this.zs, this.fs, this.ds);
    }

    /** 攻击力（增加基础百分比) */
    public get atkPercent():number
    {
        return Math.max(this.zs2, this.fs2, this.ds2);
    }

    /** 生命吸取 */
    public get addHp():number
    {
        return this._addHp;
    }
    /** 生命吸取百分比 */
    public get lifeDraw():number
    {
        return this._lifeDraw;
    }
    /** 法力吸取 */
    public get addMp():number
    {
        return this._addMp;
    }
    /** 攻击力 */
    public get zs():number
    {
        return this._zs;
    }
    /** 魔力 */
    public get fs():number
    {
        return this._fs;
    }
    /** 道术 */
    public get ds():number
    {
        return this._ds;
    }
    /** 防御值 */
    public get ac():number
    {
        return this._ac;
    }
    /** 防御百分比 */
    public get ac2():number
    {
        return this._ac2;
    }
    /** 攻击百分比 */
    public get zs2():number
    {
        return this._zs2;
    }
    /** 魔力百分比 */
    public get fs2():number
    {
        return this._fs2;
    }
    /** 道术百分比 */
    public get ds2():number
    {
        return this._ds2;
    }
    /** 攻击速度百分比 */
    public get atkSpeek():number
    {
        return this._atkSpeek;
    }
    /** 闪避 */
    public get evade():number
    {
        return this._evade;
    }
    /** 每秒增加基础生命百分比 */
    public get hpPercent():number
    {
        return this._hpPercent;
    }
    /** 每秒增加生命值 */
    public get hp():number
    {
        return this._hp;
    }
    /** 每秒增加魔法值 */
    public get mp():number
    {
        return this._mp;
    }
    /** 状态 0：无 1：眩晕  2：定身 */
    public get state():number
    {
        return this._state;
    }
    /** 生命值上限 */
    public get maxHp():number
    {
        return this._maxHp;
    }
    /** 生命值上限百分比 */
    public get maxHp2():number
    {
        return this._maxHp2;
    }
    /** 附加魔法值上限 */
    public get maxMp():number
    {
        return this._maxMp;
    }
    /** 法力值上限百分比 */
    public get maxMp2():number
    {
        return this._maxMp2;
    }
    /** 经验增幅百分比 */
    public get exp2():number
    {
        return this._exp2;
    }
    /** 受到伤害降低百分比 */
    public get injuryFree():number
    {
        return this._injuryFree;
    }
    /** 受到伤害增幅百分比 */
    public get injuryincrease():number
    {
        return this._injuryincrease;
    }
}