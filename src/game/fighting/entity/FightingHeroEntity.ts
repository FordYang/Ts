import { EFightingHurtType } from "../../consts/EFightingHurtType";
import CmdID from "../../network/CmdID";
import FightingBasePlayerEntity from "./FightingPlayerEntity";

export default class FightingHeroEntity extends FightingBasePlayerEntity
{
    constructor()
    {
        super();
    }
    
    private tempSecond:number = 0;
    public update(dt:number):void
    {
        if (this.isLive)
        {
            super.update(dt);

            this.tempSecond += dt;
            if (this.tempSecond >= 1)
            {
                this.tempSecond = 0;
                
                this.fightingRoom.checkHeroHPMP(this.hp / this.maxHp, this.mp / this.maxMp);
            }
        }
    }

    protected onDie():void
    {
        super.onDie();
        
        this.fightingRoom.dieHero(this.eid);
    }

    /** 无敌 */
    public get invincible():boolean
    {
        if (Date.now() - this.reviveTime < 15000)
        {
            return true;
        }
    
        return super.invincible;
    }

    private reviveTime:number = -15000;
    /** 复活 */
    public revive():void
    {
        this._isLive = true;

        this.reviveTime = Date.now();
        this.playerAttr.revive();

        this.setAttr(this.playerAttr);
        
        this.fightingRoom?.player?.send(CmdID.s2c_fighting_sync_hero_hpmp, {hp:this.hp, maxhp:this.maxHp, mp:this.mp, maxmp:this.maxMp});
    }

    /** 吃药回血 */
    public takeHp(value:number):void
    {
        this.addHp(value);

        this.changeHp(this.eid, EFightingHurtType.TAKE, value, this.hp);
    }

    public takeMp(value:number):void
    {
        this.mp += value;
    }

    protected onDestroy()
    {

        super.onDestroy();
    }
}