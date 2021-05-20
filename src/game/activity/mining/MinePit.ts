import DropConfig from "../../config/DropConfig";
import { ItemConfig } from "../../config/ItemConfig";
import MapConfig from "../../config/MapConfig";
import { SettingConfig } from "../../config/SettingConfig";
import { ErrorConst } from "../../consts/ErrorConst";
import PlayerEvent from "../../consts/PlayerEvent";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import MailMgr from "../../mgr/MailMgr";
import Player from "../../model/playerObj/Player";
import PlayerMgr from "../../model/playerObj/PlayerMgr";
import CmdID from "../../network/CmdID";
import DB from "../../utils/DB";
import MineBase, { IMinePit, IRecord } from "./MineBase";
export enum EPitOverType {
    normal = "normal",
    occupy = "occupy",
    fighting = "fighting",
    giveup = "giveup"
}

/**矿坑 */
export default class MinePit {
    /**矿坑位置 */
    private id: number;
    /**矿坑状态 */
    private state: number;
    /**矿坑所属 */
    private roleid: number;
    /**挖矿体力 */
    private energy: number;
    /**占领玩家 */
    private roleName: string;
    /**占领玩家的等级 */
    private roleLv: number;
    /**掉落Id */
    private dropId: number;
    /**掉落Id */
    private dropId2: number;
    /**记录 */
    private record: IRecord[];
    /**矿坑产物 */
    private awards: { [key: string]: number };
    /**消耗体力 */
    private readonly COST_OCCUPY: number = 10;
    /**当前服务器 */
    private serverid: number;
    /**下发消息 */
    private msgType: boolean;
    /**占领时间 */
    private occupy_date: any;
    /**矿坑保护时间 /s*/
    private protect: number;
    /**初始化矿洞 */
    constructor(serverid: number, quality: number, id: number) {
        this.state = 0;
        this.roleid = 0;
        this.energy = 0;
        this.record = [];
        this.awards = {};
        this.roleName = "";
        this.roleLv = 0;
        this.serverid = serverid;
        this.id = quality * 1000 + id;
        this.msgType = true;
        this.occupy_date = null;
        this.protect = Date.now();

        this.dropId = 500100 + (quality - 1);
        this.dropId2 = 500200;
    }

    /**矿洞的位置 */
    get mIndex() {
        return this.id;
    }

    /**矿坑角色 */
    get mRoleid() {
        return this.roleid;
    }

    /**传出去 */
    public get toClient() {
        return {
            id: this.id,
            state: this.state,
            roleid: this.roleid,
            energy: this.energy,
            record: this.record,
            awards: this.awards
        }
    }

    /**传出去 */
    public get toClientPit() {
        return {
            id: this.id,
            state: this.state,
            roleid: this.roleid,
            energy: this.energy,
            rolename: this.roleName,
            roleLv: this.roleLv
        }
    }

    /**设置状态 */
    public setDB(db: any) {
        this.state = db.state;
        this.roleid = db.roleid;
        this.energy = db.energy;
        this.roleName = db.roleName;
        this.roleLv = db.roleLv;
        this.occupy_date = new Date(db.occupy_date);
        if (db.record)
            this.record = DataUtil.jsonBy(db.record);
        if (db.awards)
            this.awards = DataUtil.jsonBy(db.awards);
    }

    /**获取玩家 */
    public getPlayerById(roleid: number) {
        if (!roleid || roleid == 0) return null;
        return PlayerMgr.shared.getPlayerByRoleId(roleid);
    }

    /**初始化 */
    public nonPit(id: number): IMinePit {
        return {
            id: id,
            state: 0,
            roleid: 0,
            energy: 0,
            record: [],
            awards: {}
        }
    }

    /**矿消息 */
    public onMinePit(player: Player) {
        if (this.protect < Date.now()) {
            if (player.playerEnergy.cooling) {
                player.send(CmdID.s2c_notice, { code: ErrorConst.CLICK_FAST });
            } else {
                if (player.playerEnergy.value < this.COST_OCCUPY) {
                    player.send(CmdID.s2c_notice, { code: ErrorConst.MATERIAL_NOT_ENOUGH });
                } else {
                    console.log("当前可以战力矿坑，当前的矿坑位置为：", this.id, "占领者为：", this.roleid);
                    player.updateEnergyDecrease(this.COST_OCCUPY);
                    player.playerEnergy.cooling = true;
                    player.send(CmdID.s2c_energy_change, { value: player.playerEnergy.value });
                    setTimeout(() => {
                        player.playerEnergy.cooling = false;
                    }, 1000 * 10);
                    if (this.state == 1) {
                        if (player.roleid == this.roleid) return;
                        console.log("当前是抢夺矿坑，位置为", this.id);
                        this.onfighting(player);
                    } else {
                        this.occupyPit(player);
                    }
                }
            }
        } else {
            player.send(CmdID.s2c_notice, { code: ErrorConst.PROTECTING });
        }
    }

    /**刷新矿坑 */
    public onUpdatePit(pit: IMinePit) {
        this.state = pit.state;
        this.roleid = pit.roleid;
        this.energy = pit.energy;
        this.record = pit.record;
        this.awards = pit.awards;
        this.protect = Date.now();
        /**发送全部消息 */
        PlayerMgr.shared.broadcast(CmdID.s2c_mine_occupy, { code: ErrorConst.SUCCEED, pit: DataUtil.toJson(this.toClientPit, "[]") });
    }

    /**放弃 */
    public onGiveup(id: number, roleid: number) {
        if (this.id != id || this.roleid != roleid) return;
        // if (this.awards)
        this.overpit_output_player(this.awards, this.roleid, EPitOverType.giveup);
        this.state = 0;
        this.roleid = 0;
        this.energy = 0;
        this.record = [];
        this.awards = {};
        this.roleName = "";
        this.roleLv = 0;
        let sql = `UPDATE cy_mine SET roleid = ${0} , state = ${0} , awards = '{}',record = '[]', occupy_date = NULL WHERE id = ${this.id} AND serverid = ${this.serverid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                Logger.log("矿洞删除执行出错");
                return;
            }
        });
        PlayerMgr.shared.broadcast(CmdID.s2c_mine_occupy, { code: ErrorConst.SUCCEED, pit: DataUtil.toJson(this.toClientPit, "[]") });
    }

    /**刷新当前矿坑体力 */
    update_energy(roleid: number, energy: number) {
        if (this.roleid != roleid) return;
        this.energy = energy;
    }

    /**当前矿坑被别人查询了 */
    public onSearchPitInfo(id: number, reqPlayer: Player) {
        if (this.id == id && reqPlayer) {
            if (this.state != 0) {
                DB.searchRoleByRoleid(this.roleid, (code, rows) => {
                    if (code == ErrorConst.SUCCEED) {
                        if (rows && rows.length > 0) {
                            let player = rows[0];
                            let tempR = {
                                roleid: player.role_id,
                                rolename: player.role_name,
                                rolelevel: player.role_level,
                                profession: player.profession,
                                combat: player.combat,
                                awards: DataUtil.toJson(this.awards, ""),
                                energy: this.energy,
                                occupytime: Math.floor(new Date(this.occupy_date).getTime() / 1000)
                            }
                            reqPlayer.send(CmdID.s2c_minepit_player, {
                                id: this.id,
                                protect: Math.floor(this.protect / 1000),
                                role: tempR
                            })
                        }
                    } else {
                        reqPlayer.send(CmdID.s2c_minepit_player, {
                            id: this.id,
                            protect: Math.floor(this.protect / 1000),
                            role: null
                        });
                    }
                });
            } else {
                reqPlayer.send(CmdID.s2c_minepit_player, {
                    id: this.id,
                    protect: Math.floor(this.protect / 1000),
                    role: null
                });
            }
        }
    }

    /**争夺 */
    public onfighting(player: Player) {
        let map = MapConfig.instance.getMapCfgById(player.mapid);
        if (map && map.rebornmap) player.changeMap({ mapid: map.rebornmap, type: 4 });
        setTimeout(() => {
            player.send(CmdID.s2c_arena, { mapId: 3001 });
            setTimeout(() => {
                player.startFight(true, 3001, this.roleid);
                let cb = (data: any) => {
                    player.off(PlayerEvent.FIGHTING_PK_OVER, cb);
                    if (data) {
                        Logger.log("onfighting 战斗结果：", data);
                        /**抢夺成功 */
                        // if (this.awards)
                        this.overpit_output_player(this.awards, this.roleid, EPitOverType.fighting, player.name);
                        this.occupyPit(player);
                    }
                }
                player.on(PlayerEvent.FIGHTING_PK_OVER, cb);
            }, 1000);
        }, 1500);
    }

    /**占领 */
    public occupyPit(player: Player) {
        /**独树一帜 */
        let sql1 = `SELECT * FROM cy_mine WHERE roleid = ${player.roleid} AND serverid = ${this.serverid};`;
        DB.selectMine(sql1).then((data) => {
            if (data.code == ErrorConst.SUCCEED) {
                if (data.rows.length <= 0) {
                    console.log("我还未占领，当前需要占领矿坑，", this.id);
                    this.update_pit(player.roleid);
                } else {
                    /**替换矿洞 我自己*/
                    console.log("我已经占领，需要结算后再占领", this.id);
                    let pit = data.rows[0];
                    let sql = `UPDATE cy_mine SET roleid = ${0} , state = ${0} , awards = '{}',record = '[]', occupy_date = NULL WHERE id = ${pit.id} AND serverid = ${this.serverid};`;
                    DB.query(sql, (error: any, rows: any) => {
                        if (error) {
                            Logger.log("矿洞删除执行出错");
                            return;
                        }
                        // Logger.log("矿洞删除执行成功");
                        let arawds = DataUtil.jsonBy(pit.awards);
                        // if (arawds)
                        this.overpit_output_player(arawds, pit.roleid, EPitOverType.occupy);
                        pit = this.nonPit(pit.id);
                        console.log("清除之前的矿洞成功拉", pit.id);
                        MineBase.instance.update_pit(pit);
                        /**刷新占据 */
                        console.log("继续占领矿坑", this.id);
                        this.update_pit(player.roleid);
                    });
                }
            }
        });
    }

    /**刷新当前矿坑 */
    public update_pit(roleid: number) {
        console.log("此处需要走占领逻辑", this.id, this.roleid);
        let tempPlayer = this.getPlayerById(roleid);
        if (!tempPlayer) return;
        let sql = `SELECT * FROM cy_mine WHERE id = ${this.id} AND serverid = ${this.serverid};`;
        DB.selectMine(sql).then((data) => {
            if (data.code == ErrorConst.SUCCEED) {
                if (data.rows.length <= 0) {
                    console.log("没有查到这个矿坑，只能替换了");
                    let sql = `INSERT INTO cy_mine(state, roleid, id, serverid, record,awards,roleName,roleLv,occupy_date) 
                    VALUES(${1}, ${tempPlayer.roleid},${this.id},${tempPlayer.serverid},'','','${tempPlayer.name}',${tempPlayer.level},NOW());`;
                    DB.query(sql, (error: any, rows: any) => {
                        if (error) {
                            Logger.log("矿洞执行插入出错");
                            return;
                        }
                        this.state = 1;
                        this.record = [];
                        this.awards = {};
                        this.occupy_date = new Date();
                        this.roleLv = tempPlayer.level;
                        this.roleName = tempPlayer.name;
                        this.roleid = tempPlayer.roleid;
                        this.protect = Date.now() + 1000 * 60 * 10;
                        this.energy = tempPlayer.playerEnergy.value;
                        // Logger.log("矿洞执行插入成功");
                        this.update_sqlenergy();
                        PlayerMgr.shared.broadcast(CmdID.s2c_mine_occupy, { code: ErrorConst.SUCCEED, pit: DataUtil.toJson(this.toClientPit, "[]") });
                    });
                } else {
                    console.log("有查到这个矿坑，那么替换就行了");
                    let sql = `UPDATE cy_mine SET roleid = ${tempPlayer.roleid}, state = ${1}, roleName = '${tempPlayer.name}',
                     roleLv = '${tempPlayer.level}', occupy_date = NOW(), record = '', awards = '' WHERE id = ${this.id} AND serverid = ${this.serverid};`;
                    DB.query(sql, (error: any, rows: any) => {
                        if (error) {
                            Logger.log("矿洞执行出错");
                            return;
                        }
                        Logger.log("矿洞执行成功");
                        this.state = 1;
                        this.record = [];
                        this.awards = {};
                        this.occupy_date = new Date();
                        this.roleLv = tempPlayer.level;
                        this.roleName = tempPlayer.name;
                        this.roleid = tempPlayer.roleid;
                        this.protect = Date.now() + 1000 * 60 * 10;
                        this.energy = tempPlayer.playerEnergy.value;
                        this.update_sqlenergy();
                        PlayerMgr.shared.broadcast(CmdID.s2c_mine_occupy, { code: ErrorConst.SUCCEED, pit: DataUtil.toJson(this.toClientPit, "[]") });
                    });
                }
            }
        });
    }

    /**刷新能量 */
    private update_sqlenergy() {
        let sql = `UPDATE cy_mine SET energy = ${this.energy} WHERE id = ${this.id} AND serverid = ${this.serverid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                Logger.log("矿能刷新失败");
                return;
            }
            // Logger.log("矿能刷新成功");
        });
    }

    /**玩家体力 */
    public updatePlayerEnergyBySQL() {
        /**同步给玩家体力数据 */
        if (this.roleid != 0) {
            let sql1 = `select energy from cy_role where role_id = '${this.roleid}';`;
            DB.query(sql1, (error: any, rows: any) => {
                if (error) {
                    Logger.log("矿能产出失败");
                    return;
                }
                let energy = DataUtil.jsonBy(rows[0].energy);
                energy.value = this.energy;
                // Logger.log("矿能产出成功123456", rows[0].energy, DataUtil.toJson(energy, ""));
                let sql2 = `update cy_role SET energy = '${DataUtil.toJson(energy, "")}' where role_id = '${this.roleid}';`;
                DB.query(sql2, (error: any, rows: any) => {
                    if (error) {
                        Logger.log("更新离线玩家体力失败");
                        return;
                    }
                    // Logger.log("更新离线玩家体力成功");
                });
            });
        }
    }

    /**矿洞消息 */
    public update_msg(type: boolean, roleid: number) {
        if (this.roleid != roleid) return;
        this.msgType = type;
    }

    /**矿坑产出 */
    public pit_output(tempPlayer: Player) {
        let dropCfg = DropConfig.instance.getDropCfgById(this.dropId);
        let pick = dropCfg.picks || 1;
        let tempList = []
        for (let i: number = 0; i < pick; i++) {
            let tmpDropObj = DropConfig.instance.getRndItemObj(this.dropId);
            if (tmpDropObj) {
                let itemId = { itemId: tmpDropObj.itemId, value: tmpDropObj.value };
                if (!this.awards[tmpDropObj.itemId]) this.awards[tmpDropObj.itemId] = 0;
                this.awards[tmpDropObj.itemId] += tmpDropObj.value;
                tempList.push(itemId);
            }
        }

        /**---天外陨铁 */
        let dropCfg2 = DropConfig.instance.getDropCfgById(this.dropId2);
        let pick1 = dropCfg2.picks || 1;
        for (let i: number = 0; i < pick1; i++) {
            let tmpDropObj2 = DropConfig.instance.getRndItemObj(this.dropId2);
            if (tmpDropObj2) {
                let itemId = { itemId: tmpDropObj2.itemId, value: tmpDropObj2.value };
                if (!this.awards[tmpDropObj2.itemId]) this.awards[tmpDropObj2.itemId] = 0;
                this.awards[tmpDropObj2.itemId] += tmpDropObj2.value;
                tempList.push(itemId);
            }
        }

        let data: IRecord = { droplist: tempList, update_date: Math.ceil(Date.now() / 1000) };
        if (tempPlayer && this.msgType) tempPlayer.send(CmdID.s2c_mintpit_msg, {
            info: DataUtil.toJson({ record: [data], awards: this.awards }, "")
        });

        this.record.push(data);
        if (this.record.length > 50) this.record.shift();

        let sql = `UPDATE cy_mine SET record = '${DataUtil.toJson(this.record, "[]")}',awards = '${DataUtil.toJson(this.awards, "{}")}'  WHERE id = ${this.id} AND serverid = ${this.serverid};`;
        DB.query(sql, (error: any, rows: any) => {
            if (error) {
                Logger.log("矿能产出失败");
                return;
            }
            // Logger.log("矿能产出成功");
        });
    }

    /**采矿结束 */
    private overpit_output_player(awards: any, roleid: number, type: string, fName: string = "") {
        let awardList = [];
        if (awards) {
            let itemIds = Object.keys(awards);
            for (let itemId of itemIds) {
                let config = ItemConfig.instance.getItemCfgById(Number(itemId));
                if (config) {
                    let data = { itemId: config.id, count: awards[itemId], quality: config.quality };
                    awardList.push(data);
                }
            }
        }
        switch (type) {
            case EPitOverType.normal:
                if (awardList && awardList.length > 0)
                    MailMgr.instance.sendSysMail(roleid, "挖矿结算", "矿洞结算内容", awardList);
                break;
            case EPitOverType.occupy:/**占领，替换 */
                if (awardList && awardList.length > 0)
                    MailMgr.instance.sendSysMail(roleid, "挖矿结算", "您占领了其他矿坑，这是您之前挖矿奖励", awardList);
                break;
            case EPitOverType.fighting:/**被抢夺 */
                MailMgr.instance.sendSysMail(roleid, "矿脉被夺通知", "您的矿洞被玩家【" + fName + "】抢夺，快去复仇吧！", awardList);
                break;
            case EPitOverType.giveup:/**放弃矿脉 */
                if (awardList && awardList.length > 0)
                    MailMgr.instance.sendSysMail(roleid, "挖矿结算", "您主动离开矿洞，下面是您的矿洞结算内容", awardList);
                break;
        }
    }

    /**刷新矿洞信息 */
    public update_min() {
        /**产生什么内容 */
        if (this.state == 0 || this.energy <= 0) return;
        let tempPlayer = this.getPlayerById(this.roleid);
        if (this.energy > 0) {
            this.energy--;
            if (tempPlayer) tempPlayer.updateEnergyDecrease(1);
            else this.updatePlayerEnergyBySQL();
            this.pit_output(tempPlayer);
            this.update_sqlenergy();
            if (this.energy == 0) {
                /**挖矿结束 */
                this.overpit_output_player(this.awards, this.roleid, EPitOverType.normal);

                this.state = 0;
                this.record = [];
                this.awards = {};
                this.occupy_date = new Date();
                this.roleLv = 0;
                this.roleName = "";
                this.roleid = 0;
                this.energy = 0;
                PlayerMgr.shared.broadcast(CmdID.s2c_mine_occupy, { code: ErrorConst.SUCCEED, pit: DataUtil.toJson(this.toClientPit, "[]") });

                let sql = `UPDATE cy_mine SET roleid = ${0} , state = ${0} , awards = '{}',record = '[]', occupy_date = NULL WHERE id = ${this.id} AND serverid = ${this.serverid};`;
                DB.query(sql, (error: any, rows: any) => {
                    if (error) {
                        Logger.log("矿洞能量完了删除执行出错");
                        return;
                    }
                    Logger.log("矿洞能量完了删除执行成功");
                });
            }
        }
    }
}

/**挖矿特殊时间触发 */
export enum EMineEventID {
    /**消极 */
    negative_1 = 10001,
    negative_2 = 10002,
    negative_3 = 10003,
    /**积极 */
    positive_1 = 11001,
    positive_2 = 11002,
}