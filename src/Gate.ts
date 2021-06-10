import GameUtil from "./game/core/GameUtil";
import ServerMgr from "./game/gate/ServerMgr";
import Logger from "./game/gear/Logger";
import DBForm from "./game/utils/DBForm";
import GameConf from "./conf/GameConf";
import HttpGate from "./game/gate/HttpGate";
import FrozenIPMgr from "./game/gate/FrozenIPMgr";
import FrozenMacMgr from "./game/gate/FrozenMacMgr";
import ConfigEntry from "./game/config/ConfigEntry";
import GateCmd from "./game/gate/GateCmd";

// 未知异常捕获
process.on('uncaughtException', function (err: any) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});

export default class Gate {
    /**启动 */
    lanuch() {
        // 加载配置
        GameUtil.serverType = 'gate';
        GameUtil.localIP = GameUtil.getIPAdress();
        GameUtil.serverId = GameConf.gate_id;
        GameUtil.serverName = GameConf.gate_name;
        GameUtil.launch();
        Logger.info(`${GameUtil.serverName}V${GameConf.version} 启动...`);
        // 启动命令行管理
        GateCmd.shared.launch();
        Logger.info('1.命令行模块启动完毕');
        //启动http模块
        HttpGate.instance.start(GameConf.gate_port);
        Logger.info(`2.HTTP模块启动完毕，开始监听${GameConf.isLocal ? GameConf.local_ip : GameConf.outer_ip}:${GameConf.gate_port}`);
        DBForm.instance.launch();
        Logger.info(`3.数据库管理模块启动完毕`);
        //启动服务器管理模块
        ServerMgr.instance.launch();
        Logger.info(`4.服务器管理模块启动完毕`);
        //启动封禁IP管理模块
        FrozenIPMgr.instance.launch();
        Logger.info(`5.封禁IP管理模块启动完毕`);
        //启动封禁设备管理模块
        FrozenMacMgr.instance.launch();
        Logger.info(`6.封禁设备管理模块启动完毕`);
        //启动游戏配置模块
        ConfigEntry.instance.readDirJson();
        Logger.info(`7.游戏配置管理模块启动完毕`);
        /**网关启动完毕 */
        Logger.info('*****网关服务器启动完毕，等待命令*****');
    }
}

new Gate().lanuch();