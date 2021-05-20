import { ErrorConst } from "../../consts/ErrorConst";
import GameUtil from "../../core/GameUtil";
import ArrayUtil from "../../gear/ArrayUtil";
import Logger from "../../gear/Logger";
import AuthorMgr from "../../mgr/AuthorMgr";
import CmdID from "../../network/CmdID";
import Player from "./Player";

// 玩家管理器
export default class PlayerMgr {
    // 单例
    static shared = new PlayerMgr();

    //------------------------------------------------------------------------------------------------------------

    private player_num_peak: number = 0;

    public prevSaveTime: number = 0;

    private playerIdMap: { [roleid: number]: Player };
    private playerEidMap: { [eid: number]: Player };
    private playerlist: Player[];

    constructor() {
        this.playerIdMap = {};
        this.playerEidMap = {};
        this.playerlist = [];
    }

    public get playerL(): Player[] {
        return this.playerlist;
    }

    launch(): void {

    }

    /**
     * 
     * @param dt 秒
     */
    update(dt: number): void 
    {
        let roleidlist = this.playerlist;
        let len = roleidlist.length;
        for (let i: number = 0; i < len; i++) {
            roleidlist[i].update(dt);
        }
    }

    public update_sec():void
    {
        for (let player of this.playerlist) 
        {
            player.update_sec();
        }
    }

    /** 一分钟触发一次 */
    public update_min(): void 
    {
        for (let player of this.playerlist) 
        {
            player.update_min();
        }
        // this.checkAuthor();
    }

    public resetDay():void
    {
        for (let player of this.playerlist) 
        {
            player.resetDay();
        }
    }

    public addPlayer(player: Player): boolean {
        if (this.playerIdMap[player.roleid]) {
            Logger.error("角色重复创建");
            return false;
        }

        this.playerlist.push(player);
        this.playerIdMap[player.roleid] = player;
        this.playerEidMap[player.onlyid] = player;

        this.player_num_peak = Math.max(this.player_num_peak, this.playerlist.length);
        return true;
    }

    public delPlayer(roleId: number): void {
        let player = this.getPlayerByRoleId(roleId);
        if (player) {
            delete this.playerIdMap[roleId];
            delete this.playerEidMap[player.onlyid];
            ArrayUtil.fastRemove(this.playerlist, player);
        }
    }

    getPlayerByOnlyId(onlyId: number, isWarn: boolean = true): Player {
        let player = this.playerEidMap[onlyId];
        if (isWarn && !player) {
            Logger.warn(`$警告:找不到玩家:onlyId=${onlyId}`);
        }
        return player;
    }

    public getPlayerByRoleId(roleId: any, prefix: string = ""): Player {
        let player = this.playerIdMap[roleId];
        if (player == null && prefix.length > 0) {
            Logger.warn(`${prefix}找不到玩家:roleId=${roleId}`);
        }
        return player;
    }

    /**通过账号获取玩家 唯一 */
    public getPlayerByAccount(account: number): Player {
        for (let player of this.playerlist) {
            if (player.account == account) return player;
        }
        return null;
    }

    /** 当前用户（包括挂机用户 */
    public getPlayerNum(): number {
        return this.playerlist.length;
    }

    /** 最大同时在线 */
    public getPlayerNumPeak(): number {
        return this.player_num_peak;
    }

    public getTrustNum(): number {
        let result = 0;
        for (let player of this.playerlist) {
            if (!player.online) {
                result++;
            }
        }
        return result;
    }

    public sendToPlayer(onlyid: number, cmdstr: string, obj: any): void {
        let player = this.getPlayerByOnlyId(onlyid);
        if (player) {
            player.send(cmdstr, obj);
        }
    }

    //--------------------------------------------------------------------
    /** 给所有玩家发消息 */
    public broadcast(cmdstr: any, obj?: any, exceptPlayer?: Player): void {
        for (let player of this.playerlist) {
            if (player !== exceptPlayer && player.online) {
                player.send(cmdstr, obj);
            }
        }
    }

    public traceFightPoint(): void {
        for (let player of this.playerlist) {
            player.fightingRoom.traceAnimalPoint();
        }
    }

    /**每分钟校验 */
    public checkAuthor() {
        for (let player of this.playerlist) {
            let needCheck = AuthorMgr.instance.checkList(player.account);
            if (!needCheck) continue;
            AuthorMgr.instance.checkPlayer(player.account, (author: boolean) => {
                if (author) {
                    /**玩家需要实名认证 */
                    Logger.log("检查实名认证的玩家", player.account, player.name);
                    player.send(CmdID.s2c_author_notice, {
                        state: 0
                    })
                }
            });
        }
    }

    /**同步实名 */
    public syncAuthorPlayer(account: number, state: number) {
        AuthorMgr.instance.delAuthorID(account);
        if (state == 3) {
            let player = this.getPlayerByAccount(account);
            if (player) {
                player.checkFangChenMi();
            }
            /**验证成功 */
            AuthorMgr.instance.addAuthor(account);
        } else if (state == 2) {
            /**验证失败 */
            let player = this.getPlayerByAccount(account);
            if (player) {
                player.send(CmdID.s2c_author_notice, {
                    state: 1
                })
            }
        }
    }

    /**同步 */
    public authorPlayerFailed(account: number) {
        // let player = this.getPlayerByAccount(account);
        // if (player) {
        //     player.send(CmdID.s2c_author_notice, {
        //         state: 3
        //     });
        // }
    }
    //--------------------------------------------------------------------

    private saveInProgress: boolean = false;
    // 全部存档
    public saveAll(isLast: boolean, callback?: (player: Player) => void): Promise<string> {
        return new Promise((resolve) => {
            if (this.saveInProgress) {
                Logger.debug(`保存中，请等待。。。`);
                resolve("保存中，请等待。。。");
                return;
            }

            // Logger.info('玩家全部存档逻辑');
            if (Date.now() - this.prevSaveTime > 3000) {
                this.saveInProgress = true;
                this.prevSaveTime = Date.now();
                let totalPlayer = this.playerlist.length;
                // // 重置存档计数
                let onlineNum = 0;
                let saveCount = 0;
                let saveFailed = 0;

                let pList: Promise<ErrorConst>[] = [];

                for (let player of this.playerlist) {
                    if (player.online) {
                        onlineNum++;
                    }
                    let p = player.execSaveAll(isLast);
                    p.then((code) => {
                        callback?.(player);
                    });
                    pList.push(p);
                }

                Promise.allSettled(pList).then((codelist) => {
                    for (let code of codelist) {
                        if (code.status === "fulfilled" && code.value === ErrorConst.SUCCEED) {
                            saveCount++;
                        }
                        else {
                            saveFailed++;
                        }
                    }
                    // 全部玩家存档完成
                    this.saveInProgress = false;
                    let msg = `玩家存档完毕:服务器[${GameUtil.serverName}]:存档失败[${saveFailed}]机器人数[${0}]在线玩家数[${onlineNum}]托管玩家[${totalPlayer - onlineNum}]总玩家数[${totalPlayer}]`;
                    resolve(msg);
                });
            } else {
                Logger.debug(`保存操作太频繁。`);
                resolve("保存操作太频繁。");
            }
        })
    }

    // 踢下线
    public kickedOutPlayer(roleIdList: number[]): void {
        for (let roleId of roleIdList) {
            let player = this.getPlayerByRoleId(roleId);
            if (player) {
                player.destroy();

                Logger.info(`踢出玩家[${player.roleid}:${player.name}]`);
            }
        }
    }

    //-----------------------------------------------------------------------------------
    // 测试
    public testTaskReset():void
    {
        for (let player of this.playerlist)
        {
            player.taskEntity.testReset();
        }
    }

    public testTaskSet(taskId:number):void
    {
        for (let player of this.playerlist)
        {
            player.taskEntity.testTaskSet(taskId);
        }
    }
}
