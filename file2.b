es{:::::}12
{|||||}format{:::::}12
{|||||}00e89c5134dea8e20ba4f0dfcff6e1822820fbc7.svn-base{:::::}import { IItemCFG } from "../../config/cfg/ItemCFG";
import { ILibaoCFG } from "../../config/cfg/LibaoCFG";
import { ItemConfig } from "../../config/ItemConfig";
import { LibaoConfig } from "../../config/LibaoConfig";
import { ProfessionConfig } from "../../config/ProfessionConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import { EQuality, ERichesType } from "../../consts/EGame";
import { EEquipType, EItemKey, EItemType, ESpecialEquipId, REMAKE_COSTCFG } from "../../consts/EItem";
import { ePrerogativeTime, ePrerogativeType, ESkillId } from "../../consts/ERole";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import CmdID from "../../network/CmdID";
import Player from "../playerObj/Player";
import BagObj from "./BagObj";
import Item from "./Item";
import Skill from "./Skill";
import { EDayMapType } from "./DayMap";
import { FuseConfig } from "../../config/FuseConfig";
import PlayerEvent from "../../consts/PlayerEvent";
import DB from "../../utils/DB";

// D��:q
:
