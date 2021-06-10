import { EAttrType, EProfessionType } from "../../consts/ERole";

export default class BaseAttachAttr
{
    public attachName:string = "AttachAttr";

    protected profession:EProfessionType;

    constructor(profession?:EProfessionType)
    {
        this.setProfession(profession);
    }

    public setProfession(profession:EProfessionType):void
    {
        this.profession = profession;
    }

    //------------------------------------------------------------------------------------------

    /** 根据属性ID获取属性值 */
    public getAttrById(attrId: number): number 
    {
        throw new Error("方法必须复写");
    }

    /** 设置属性值 */
    protected setAttrValue(attrId: number, value: number): void 
    {
        throw new Error("方法必须复写");
    }

    //------------------------------------------------------------------------------------------
    
    public getFighting(): number 
    {
        return 0;
    }
    
    //------------------------------------------------------------------------------------------
    
    public get desc(): string 
    {
        let attrDescL = this.descList.map((val) => 
        {
            return `${val.name}：${val.value}`;
        });
        return attrDescL.join("\n");
    }
    
    public get descList(): { name: string, value: string }[] 
    {
        let descL: { name: string, value: string }[] = [];

        if (this.hp) 
        {
            descL.push({ name: "生命值", value: this.hp.toString() });
        }
        if (this.mp) 
        {
            descL.push({ name: "魔法值", value: this.mp.toString() });
        }
        if (this.minac || this.maxac) {
            descL.push({ name: "防御", value: `${this.minac || 0}-${this.maxac}` });
        }
        if (this.profession === EProfessionType.DAOSHI)
        {
            if (this.minds || this.maxds) {
                descL.push({ name: "道术", value: `${this.minds || 0}-${this.maxds}` });
            }
        }
        else if (this.profession === EProfessionType.FASHI)
        {
            if (this.minfs || this.maxfs) {
                descL.push({ name: "魔法", value: `${this.minfs || 0}-${this.maxfs}` });
            }
        }
        else
        {
            if (this.minzs || this.maxzs) {
                descL.push({ name: "攻击", value: `${this.minzs || 0}-${this.maxzs}` });
            }
        }
        if (this.fixeddamage) {
            descL.push({ name: "固伤", value: this.fixeddamage.toString() });
        }
        if (this.fixedac) {
            descL.push({ name: "固防", value: this.fixedac.toString() });
        }
        if (this.hit) {
            descL.push({ name: "命中率", value: this.hit.toString() });
        }
        if (this.evade) {
            descL.push({ name: "闪避", value: this.evade.toString() });
        }
        if (this.critical) {
            descL.push({ name: "暴击", value: this.critical.toString() });
        }
        if (this.tenacity) {
            descL.push({ name: "韧性", value: this.tenacity.toString() });
        }
        return descL;
    }
    
    //------------------------------------------------------------------------------------------
    
    /** 攻击 */
    public get zs(): string {
        return `${this.getAttrById(EAttrType.MIN_ZS)}_${this.getAttrById(EAttrType.MAX_ZS)}`;
    }
    /** 魔法 */
    public get fs(): string {
        return `${this.getAttrById(EAttrType.MIN_FS)}_${this.getAttrById(EAttrType.MAX_FS)}`;
    }
    /** 道术 */
    public get ds(): string {
        return `${this.getAttrById(EAttrType.MIN_DS)}_${this.getAttrById(EAttrType.MAX_DS)}`;
    }

    /** 防护 */
    public get ac(): string {
        return `${this.getAttrById(EAttrType.MIN_AC)}_${this.getAttrById(EAttrType.MAX_AC)}`;
    }
    
    //------------------------------------------------------------------------------------------

    protected get professionAtkAttrId():EAttrType
    {
        if (this.profession === EProfessionType.DAOSHI)
        {
            return EAttrType.DS;
        }
        else if (this.profession === EProfessionType.FASHI)
        {
            return EAttrType.FS;
        }
        return EAttrType.ZS;
    }

    /** 最小攻击 */
    public get minAtk():number
    {
        if (this.profession == EProfessionType.DAOSHI)
        {
            return this.getAttrById(EAttrType.MIN_DS);
        }
        else if (this.profession === EProfessionType.FASHI)
        {
            return this.getAttrById(EAttrType.MIN_FS);
        }

        return this.getAttrById(EAttrType.MIN_ZS);
    }
    /** 最大攻击 */
    public get maxAtk():number
    {
        if (this.profession == EProfessionType.DAOSHI)
        {
            return this.getAttrById(EAttrType.MAX_DS);
        }
        else if (this.profession === EProfessionType.FASHI)
        {
            return this.getAttrById(EAttrType.MAX_FS);
        }
        
        return this.getAttrById(EAttrType.MAX_ZS);
    }

    //------------------------------------------------------------------------------------------

    /** 血量 */
    public get hp(): number {
        return this.getAttrById(EAttrType.HP);
    }
    public set hp(value: number) {
        this.setAttrValue(EAttrType.HP, value);
    }
    public get totalHp():number
    {
        return this.hp + this.hp * this.maxhprate * 0.01;
    }
    /** 法力 */
    public get mp(): number {
        return this.getAttrById(EAttrType.MP);
    }
    public set mp(value: number) {
        this.setAttrValue(EAttrType.MP, value);
    }
    public get totalMp():number
    {
        return this.mp + this.mp * this.maxmprate * 0.01;
    }
    /** 最小攻击 */
    public get minzs(): number {
        return this.getAttrById(EAttrType.MIN_ZS);
    }
    public set minzs(value: number) {
        this.setAttrValue(EAttrType.MIN_ZS, value);
    }
    /** 最大攻击 */
    public get maxzs(): number {
        return this.getAttrById(EAttrType.MAX_ZS);
    }
    public set maxzs(value: number) {
        this.setAttrValue(EAttrType.MAX_ZS, value);
    }
    /** 最小防御 */
    public get minac(): number {
        return this.getAttrById(EAttrType.MIN_AC);
    }
    public set minac(value: number) {
        this.setAttrValue(EAttrType.MIN_AC, value);
    }
    /** 最大防御 */
    public get maxac(): number {
        return this.getAttrById(EAttrType.MAX_AC);
    }
    public set maxac(value: number) {
        this.setAttrValue(EAttrType.MAX_AC, value);
    }
    /** 最小法攻 */
    public get minfs(): number {
        return this.getAttrById(EAttrType.MIN_FS);
    }
    public set minfs(value: number) {
        this.setAttrValue(EAttrType.MIN_FS, value);
    }
    /** 最大法攻 */
    public get maxfs(): number {
        return this.getAttrById(EAttrType.MAX_FS);
    }
    public set maxfs(value: number) {
        this.setAttrValue(EAttrType.MAX_FS, value);
    }
    /** 最小道术 */
    public get minds(): number {
        return this.getAttrById(EAttrType.MIN_DS);
    }
    public set minds(value: number) {
        this.setAttrValue(EAttrType.MIN_DS, value);
    }
    /** 最大道术 */
    public get maxds(): number {
        return this.getAttrById(EAttrType.MAX_DS);
    }
    public set maxds(value: number) {
        this.setAttrValue(EAttrType.MAX_DS, value);
    }
    /** 幸运 */
    public get lucky(): number {
        return this.getAttrById(EAttrType.LUCKY);
    }
    public set lucky(value: number) {
        this.setAttrValue(EAttrType.LUCKY, value);
    }
    /** 固伤 */
    public get fixeddamage(): number {
        return this.getAttrById(EAttrType.FIXED_DAMAGE);
    }
    public set fixeddamage(value: number) {
        this.setAttrValue(EAttrType.FIXED_DAMAGE, value);
    }
    /** 固减 */
    public get fixedac(): number {
        return this.getAttrById(EAttrType.FIXED_AC);
    }
    public set fixedac(value: number) {
        this.setAttrValue(EAttrType.FIXED_AC, value);
    }
    /** 伤害增幅 */
    public get adddamage(): number {
        return this.getAttrById(EAttrType.ADD_DAMAGE);
    }
    public set adddamage(value: number) {
        this.setAttrValue(EAttrType.ADD_DAMAGE, value);
    }
    /** 伤害减免 */
    public get addac(): number {
        return this.getAttrById(EAttrType.ADD_AC);
    }
    public set addac(value: number) {
        this.setAttrValue(EAttrType.ADD_AC, value);
    }
    /** 生命吸取 */
    public get absorbhp(): number {
        return this.getAttrById(EAttrType.ABSORB_HP);
    }
    public set absorbhp(value: number) {
        this.setAttrValue(EAttrType.ABSORB_HP, value);
    }
    /** 法力吸取 */
    public get absorbmp(): number {
        return this.getAttrById(EAttrType.ABSORB_MP);
    }
    public set absorbmp(value: number) {
        this.setAttrValue(EAttrType.ABSORB_MP, value);
    }
    /** 极品掉率 */
    public get dropbest(): number {
        return this.getAttrById(EAttrType.DROP_BEST);
    }
    public set dropbest(value: number) {
        this.setAttrValue(EAttrType.DROP_BEST, value);
    }
    /** 装备掉率 */
    public get adddrop(): number {
        return this.getAttrById(EAttrType.ADD_DROP);
    }
    public set adddrop(value: number) {
        this.setAttrValue(EAttrType.ADD_DROP, value);
    }
    /** 经验加成 */
    public get addexp(): number {
        return this.getAttrById(EAttrType.ADD_EXP);
    }
    public set addexp(value: number) {
        this.setAttrValue(EAttrType.ADD_EXP, value);
    }
    /** 攻速 */
    public get atkSpeed(): number {
        return this.getAttrById(EAttrType.ATK_SPD);
    }
    public set atkSpeed(value: number) {
        this.setAttrValue(EAttrType.ATK_SPD, value);
    }
    /** 命中 */
    public get hit(): number {
        return this.getAttrById(EAttrType.HIT);
    }
    public set hit(value: number) {
        this.setAttrValue(EAttrType.HIT, value);
    }
    /** 闪避 */
    public get evade(): number {
        return this.getAttrById(EAttrType.EVADE);
    }
    public set evade(value: number) {
        this.setAttrValue(EAttrType.EVADE, value);
    }
    /** 暴击 */
    public get critical(): number {
        return this.getAttrById(EAttrType.CRITICAL);
    }
    public set critical(value: number) {
        this.setAttrValue(EAttrType.CRITICAL, value);
    }
    /** 暴击增幅 */
    public get crtdamage(): number 
    {
        return this.getAttrById(EAttrType.CRT_DAMAGE);
    }
    public set crtdamage(value: number) 
    {
        this.setAttrValue(EAttrType.CRT_DAMAGE, value);
    }
    /** 韧性 */
    public get tenacity(): number {
        return this.getAttrById(EAttrType.TENACITY);
    }
    public set tenacity(value: number) {
        this.setAttrValue(EAttrType.TENACITY, value);
    }
    /** 生命增幅 */
    public get maxhprate(): number {
        return this.getAttrById(EAttrType.MAX_HP_RATE);
    }
    public set maxhprate(value: number) {
        this.setAttrValue(EAttrType.MAX_HP_RATE, value);
    }
    /** 法力增幅 */
    public get maxmprate(): number {
        return this.getAttrById(EAttrType.MAX_MP_RATE);
    }
    public set maxmprate(value: number) {
        this.setAttrValue(EAttrType.MAX_MP_RATE, value);
    }
    
    /** 法力增幅 */
    public get goldAdd(): number {
        return this.getAttrById(EAttrType.ADD_GOLD);
    }
    public set goldAdd(value: number) {
        this.setAttrValue(EAttrType.ADD_GOLD, value);
    }

    /**伤害减免 */
    public get injuryfree():number
    {
        return this.getAttrById(EAttrType.ADD_AC);
    }

    /** 伤害增幅 */
    public get injuryincrease():number
    {
        return this.getAttrById(EAttrType.ADD_DAMAGE);
    }
}