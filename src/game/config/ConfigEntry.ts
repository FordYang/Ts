import { SkillConfig } from './SkillConfig';
import { TujianMonsterConfig } from './TujianMonsterConfig';
import JingmaiConfig from "./JingmaiConfig";
import DropConfig from './DropConfig';
import SkillBuffConfig from './SkillBuffConfig';
import DataUtil from '../gear/DataUtil';
import { ProfessionConfig } from './ProfessionConfig';
import { ItemConfig } from './ItemConfig';
import { CiZhuiConfig } from './CiZhuiConfig';
import { LevelUpConfig } from './LevelUpConfig';
import MapConfig from './MapConfig';
import MonsterConfig from './MonsterConfig';
import { ShopConfig } from './ShopConfig';
import LanguageConfig from './LanguageConfig';
import { LibaoConfig } from './LibaoConfig';
import { IntensifyConfig } from './IntensifyConfig';
import { IntensifyPartConfig } from './IntensifyPartConfig';
import QiandaoConfig from './QiandaoConfig';
import ChongzhiConfig from './ChongzhiConfig';
import { FuseConfig } from './FuseConfig';
import { TaskConfig } from './TaskConfig';
import { LilianConfig } from './LilianConfig';
import { ExchangeConfig } from './ExchangeConfig';
import JiJinConfig from './JiJinConfig';
import { SettingConfig } from './SettingConfig';
import { EquipCiZhuiConfig } from './EquipCiZhuiConfig';
import { ShenQiConfig } from './ShenQiConfig';
import Logger from '../gear/Logger';
import { NewTaskConfig } from './NewTaskConfig';
export default class ConfigEntry {
    public static readonly instance = new ConfigEntry();

    readDirJson() 
    {
        this.parseJson();
    }

    /**解析 */
    public parseJson(): void {
        let configs = DataUtil.readDir("../../conf/json", ".txt");

        ItemConfig.instance.parseJson(this.requireCfg(configs["item"]));
        CiZhuiConfig.instance.parseJson(this.requireCfg(configs["cizhui"]));
        EquipCiZhuiConfig.instance.parseJson(this.requireCfg(configs["equip_cizhui"]));
        ProfessionConfig.instance.parseJson(this.requireCfg(configs["profession"]));
        JingmaiConfig.instance.parseJson(this.requireCfg(configs["jingmai"]));
        TujianMonsterConfig.instance.parseJson(this.requireCfg(configs["tujian_monster"]));
        SkillConfig.instance.parseJson(this.requireCfg(configs["skill"]));
        SkillBuffConfig.instance.parseJson(this.requireCfg(configs["buff"]));
        MapConfig.instance.parseJson(this.requireCfg(configs["map"]));
        DropConfig.instance.parseJson(this.requireCfg(configs["drop"]), this.requireCfg(configs["drop_max"]));
        MonsterConfig.instance.parseJson(this.requireCfg(configs["monster"]));
        LevelUpConfig.instance.parseJson(this.requireCfg(configs["levelup"]));
        ShopConfig.instance.parseJson(this.requireCfg(configs["shop"]));
        LibaoConfig.instance.parseJson(this.requireCfg(configs["libao"]));
        IntensifyConfig.instance.parseJson(this.requireCfg(configs["equip_qianghua"]));
        IntensifyPartConfig.instance.parseJson(this.requireCfg(configs["equip_qianghua_parts"]));
        LanguageConfig.instance.parseJson(this.requireCfg(configs["language"]));
        QiandaoConfig.instance.parseJson(this.requireCfg(configs["qiandao_w"]), this.requireCfg(configs["qiandao_m"]));
        ChongzhiConfig.instance.parseJson(this.requireCfg(configs["chongzhi"]));
        FuseConfig.instance.parseJson(this.requireCfg(configs["fuse"]));
        TaskConfig.instance.parseJson(this.requireCfg(configs["task"]));
        LilianConfig.instance.parseJson(this.requireCfg(configs["lilian"]));
        ExchangeConfig.instance.parseJson(this.requireCfg(configs["duihunma"]));
        JiJinConfig.instance.parseJson(this.requireCfg(configs["jijin"]));
        SettingConfig.instance.parseJson(this.requireCfg(configs["openlevel"]));
        ShenQiConfig.instance.parseJson(this.requireCfg(configs["shenqi"]));
        NewTaskConfig.instance.parseJson(this.requireCfg(configs["task_renwu"]));
    }

    public hotUpdate(): void 
    {
        let configs = DataUtil.readDir("../../conf/json", ".txt");

        DropConfig.instance.hotupdate(this.requireCfg(configs["drop"]), this.requireCfg(configs["drop_max"]));
        ItemConfig.instance.hotupdate(this.requireCfg(configs["item"]));
        ChongzhiConfig.instance.hotupdate(this.requireCfg(configs["chongzhi"]));
        LibaoConfig.instance.hotupdate(this.requireCfg(configs["libao"]));
        SkillConfig.instance.hotupdate(this.requireCfg(configs["skill"]));
        SkillBuffConfig.instance.hotupdate(this.requireCfg(configs["buff"]));

        Logger.log('热更新配置完成');
    }

    private requireCfg(content: string): any[] {
        let jsonObj = DataUtil.jsonBy(content);
        let table: any[] = [];
        for (let id in jsonObj) {
            table.push(jsonObj[id]);
        }
        return table;
    }
}