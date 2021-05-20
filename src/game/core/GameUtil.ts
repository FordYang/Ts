// 游戏工具类
import * as os from "os";
import SnowFlack53 from "../gear/SnowFlake53";
import ServerConf from "../../conf/ServerConf";
import Logger from "../gear/Logger";
import GameConf from "../../conf/GameConf";

export default class GameUtil {
    // REDIS服务是否开启
    static redisEnabled: boolean = true;
    // 本地IP地址
    static localIP: string;
    // 服务器配置
    static serverConf: ServerConf;
    // 服务器类型
    static serverType: string;
    // 网络类型
    static netType: string;
    // 服务器索引
    static serverId: number;
    // 服务器名称
    static serverName: string;
    // 游戏帧时间
    static frameTime: number;
    // 15分钟后销毁玩家数据 离线清除30 * 60 * 
    static playerSkipTime: number = 1000;
    // 30分钟后销毁战斗数据
    static battleSkipTime: number = 30 * 60 * 1000;
    // 每30分钟保存一次玩家数据
    static savePlayerTime: number = 30 * 1000;//* 60
    // 是否关服
    static isClose: boolean = false;
    /**雪花算法 */
    private static snowFlake53: SnowFlack53;

    /**启动辅助类 */
    static launch() {
        this.snowFlake53 = new SnowFlack53(BigInt(this.serverId - 1000 + 1));
        Logger.isDebug = GameConf.isDebug;
        Logger.info(`[${GameConf.channel}:${Logger.isDebug ? `调试` : `正式`}]读取游戏全局配置完成!`);
    }

    public static get gameTime(): number {
        return Date.now();
    }

    /**获取IP地址 */
    static getIPAdress(): string {
        var interfaces = os.networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return "127.0.0.1";
    }

    /**屏蔽字 */
    static numchar: string[] = [
        'q', 'Q', 'O',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        '１', '２', '３', '４', '５', '６', '７', '８', '９', '０',
        '一', '二', '三', '四', '五', '六', '七', '八', '九', '零', '〇',
        '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
        '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹',
        '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉',
        '⑴', '⑵', '⑶', '⑷', '⑸', '⑹', '⑺', '⑻', '⑼',
        '⒈', '⒉', '⒊', '⒋', '⒌', '⒍', '⒎', '⒏', '⒐',
        'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ',
        '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾',
        '➊', '➋', '➌', '➍', '➎', '➏', '➐', '➑', '➒', '➓',
        '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓻', '⓼', '⓽',
        '㈠', '㈡', '㈢', '㈣', '㈤', '㈥', '㈦', '㈧', '㈨',
        '壹', '贰', '叁', '叄', '肆', '伍', '陆', '柒', '捌', '扒', '玖',
        '伞', '溜', '君', '羊', '久', '巴',
        '玉', '仙', '裙', '群', '西', '游',
    ];
    static limitBroadcastList: string[] = [
        'qq',
        'QQ',
        '微信',
        '君羊',
        '君.羊',
        '龙马服',
        '残端',
        '私服'
    ];
    static checkLimitWord = function (msg: any): boolean {
        let numcount = 0;
        for (let k = 0; k < msg.length; k++) {
            let msgchar: any = msg[k];
            if (GameUtil.numchar.indexOf(msgchar) != -1) {
                numcount++
                if (numcount >= 6) {
                    return false;
                }
            }
        }
        for (let i = 0; i < GameUtil.limitBroadcastList.length; i++) {
            const fword = GameUtil.limitBroadcastList[i];
            let exp = "[" + fword.split('').join("].*[") + "]";
            let reg = new RegExp(exp, 'im');
            if (reg.test(msg)) {
                return false;
            }
        }
        return true;
    }

    /**标识自增 */
    static seed_index: number = 10000;
    static getAutoAddId(): number {
        GameUtil.seed_index++;
        return GameUtil.seed_index;
    }

    /**唯一标识码 */
    static nextId(): number {
        if (this.snowFlake53 == null) {
            throw new Error("服务器没有正常启动!");
        }
        return this.snowFlake53.nextId();
    }

    /**随机值 含最大最小值*/
    static random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**获取随机值等阶
     * @param {Array<number>} array 品质随机池子
     */
    static getRandomIndex(array: Array<number>): number {
        let _proportion = 0;
        for (let i = 0; i < array.length; i++)
            _proportion += array[i];
        let _random = Math.floor(Math.random() * _proportion);
        let _ofx = _proportion - _random;
        let _compareNum = 0;
        for (let j = array.length - 1; j >= 0; j--) {
            _compareNum += array[j];
            if (_compareNum >= _ofx) {
                return j;
            }
        }
        return 0;
    }
}
