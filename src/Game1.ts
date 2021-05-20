import GameUtil from "./game/core/GameUtil";
import Logger from "./game/gear/Logger";
import DBForm from "./game/utils/DBForm";
import ServerConf from "./conf/ServerConf";
import GameConf from "./conf/GameConf";
import GameCmd from "./game/common/GameCmd";
import HttpGame from "./game/network/http/HttpGame";
import ConfigEntry from "./game/config/ConfigEntry";
import Launch from "./game/core/Launch";
import MineBase from "./game/activity/mining/MineBase";

// 未知异常捕获
process.on('uncaughtException', function (err: any) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
})

// 游戏服1
var GameDebug_01: ServerConf = new ServerConf(
    1001, // 服务器索引
    "cyz的服务器", // 服务器名称
    "127.0.0.1",
    7711, // SOCKET端口
    7811, // CLI端口
    7911, // HTTP端口
);

function main() {
    GameUtil.localIP = GameUtil.getIPAdress();
    // 加载配置表
    let conf: ServerConf = GameDebug_01;
    GameUtil.serverType = conf.type;
    GameUtil.serverName = conf.name;
    GameUtil.serverId = conf.id;
    GameUtil.serverConf = conf;
    GameUtil.launch();
    Logger.info(`${GameUtil.serverName}V${GameConf.version} 启动...`);
    Logger.info("1.系统配置表加载完毕");
    // 启动命令行管理
    GameCmd.shared.launch();
    Logger.info('2.命令行模块启动完毕');
    //启动http模块
    HttpGame.shared.start(conf.http_port);
    Logger.info(`3.HTTP模块启动完毕，开始监听${GameConf.local_ip}:${conf.http_port}`);
    //游戏配置加载成功
    ConfigEntry.instance.readDirJson();
    Logger.info(`4.游戏配置模块启动完毕`);
    DBForm.instance.launch(() => {
        Logger.info('5.数据库模块启动完毕');
        /**激情矿洞 */
        MineBase.instance.launch(conf.id);
        Logger.info(`6.激情矿洞模块启动`);
        Launch.shared.start();
        Logger.info('*****游戏模块启动成功*****');
    });
}

main();