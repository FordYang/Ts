import { SkillConfig } from "../../config/SkillConfig";

export default class FightingAnimalAttr
{
    /** 技能ID列表 */
    public skillIdList:number[];

    public passBuffIdList:number[];

    public name:string = "";

    public level:number = 0;

    public teamId:number = 0;

    public exp:number = 0;

    public hp: number = 0;

    public maxhp: number = 0;
    public mp: number = 0;
    public maxmp: number = 0;

    /**攻击 */
    public minact: number = 0;
    public maxact: number = 0;
    
    /**最小物攻 */
    public  minzs: number;
    /**最大物攻 */
    public  maxzs: number;
    /**最小法攻 */
    public  minfs: number;
    /**最大法攻 */
    public  maxfs: number;
    /**最小道术 */
    public  minds: number;
    /**最大道术 */
    public  maxds: number;

    /**防御 */
    public minac: number = 0;
    public maxac: number = 0;

    /**攻速 */
    public atkSpeed: number = 0;

    /**幸运（ */
    public lucky: number = 0;

    /**固伤 */
    public fixeddamage: number = 0;
    /**固防 */
    public fixedac: number = 0;

    /**命中 */
    public hit: number = 0;
    /**闪避 */
    public evade: number = 0;

    /**暴击 */
    public critical: number = 0;
    /**韧性 */
    public tenacity: number = 0;

    // /**生命增幅 */
    // public maxhprate: number = 0;
    // /**法力增幅 */
    // public maxmprate: number = 0;
    
    /**伤害增幅 */
    public adddamage: number = 0;
    /**伤害减免 */
    public addac: number = 0;

    /**暴击伤害 */
    public crtdamage: number = 0;
    
    /**生命吸取 */
    public absorbhp: number = 0;
    /**法力吸取 */
    public absorbmp: number = 0;
}