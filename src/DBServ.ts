import * as mysql from "mysql";
import GameConf from "./conf/GameConf";
import DataUtil from "./game/gear/DataUtil";
import Logger from "./game/gear/Logger";
import DB from "./game/utils/DB";
let socketio = require('socket.io');

// 未知异常捕获
process.on('uncaughtException', (error: Error) => {
	Logger.warn(`$异常:${error.message}\n${error.stack}`);
});

// 数据库连接
class DBAgent {
	socket: any;
	name: string;
	id: number;
	constructor(socket: any) {
		this.socket = socket;
		this.name = '';
		this.id = 0;
	}

	send(event: string, data: any) {
		if (!this.socket.connected) {
			Logger.warn(`数据库连接:[${this.id}:${this.name}]已经断开连接,取消发送[${event}]`);
			return;
		}
		this.socket.emit(event, data);
	}
}

// 数据库服务器
export default class DBServ {

	static shared = new DBServ();

	agent: DBAgent;
	pool: mysql.Pool;
	agent_seed_id: number = 0;
	socket_pool: any = {};

	constructor() {
		Logger.info('系统配置表加载完毕');
		this.init();
	}

	init() {
		this.pool = mysql.createPool({
			host: GameConf.db_ip,
			user: GameConf.db_user,
			password: GameConf.db_pwd,
			database: GameConf.db_name,
			port: GameConf.db_port,
			connectionLimit: GameConf.isLocal ? 10 : 300,
			connectTimeout: 60 * 60 * 1000,
			acquireTimeout: 60 * 60 * 1000,
			timeout: 60 * 60 * 1000,
			// multipleStatements: true,
			charset: "utf8mb4"
		});
		Logger.info('数据库连接:初始化完毕!');
	}
	// 重置连接
	reset(socket: any) {
		let agent = new DBAgent(socket);
		let self = this;
		socket.on('sql', (data: any) => {
			self.fsql(agent, data);
		});
		socket.on('reg', (data: any) => {
			self.freg(agent, data);
		});
		socket.on('close', (data: any) => {
			self.fclose(agent);
		});
		socket.on("connect_error", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]连接错误[${data}]`);
		});
		socket.on("connect_timeout", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]连接超时[${data}]`);
		});
		socket.on("error", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]错误[${data}]`);
		});
		socket.on("disconnect", (reason: string) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]断开连接[${reason}]`);
			self.fclose(agent);
		});
		socket.on("reconnect", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]重连[${data}]`);
		});
		socket.on("reconnect_attempt", (data: any) => {
			Logger.info("尝试重新连接");
		});
		socket.on("reconnect_error", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]重连错误[${data}]`);
		});
		socket.on("reconnect_failed", (data: any) => {
			Logger.warn(`数据库连接:[${agent.id}:${agent.name}]连接失败[${data}]`);
		});
		socket.on("ping", (data: any) => {
			Logger.info(`数据库连接:[${agent.id}:${agent.name}]PING[${data}]`);
		});
		socket.on("pong", (data: any) => {
			Logger.info(`数据库连接:[${agent.id}:${agent.name}]PONG[${data}]`);
		});
		agent.id = this.agent_seed_id;
		this.socket_pool[this.agent_seed_id] = agent;
		this.agent_seed_id++;
		Logger.info(`数据库连接:[${agent.id}]已连接!`);
	}

	lanuch() {
		let io = socketio(GameConf.gate_db_port, {
			"transports": [
				'websocket', 'polling'
			]
		});
		io.sockets.on('connection', (socket: any) => {
			this.reset(socket);
		});
		Logger.info(`数据库服务V${GameConf.version}启动完毕,正在监听本地:${GameConf.gate_db_port}`);
	}

	fsql(agent: DBAgent, data: { id: number, sql: string, params: any[] }): void {
		this.query(data.sql, data.params, (error: any, rows: any) => {
			if (error) {
				let info = DB.errorInfo(error);
				Logger.warn(`SQL错误:[${data.sql}][${data.params}][${info.toString()}]`);
				agent.send('sqled', {
					id: data.id,
					error: error,
					rows: null,
				});
				return;
			}
			agent.send('sqled', {
				id: data.id,
				error: null,
				rows: rows,
			});
		});
	}

	// 注册连接
	freg(agent: DBAgent, data: any) {
		agent.name = data.name;
		Logger.info(`数据库连接:[${agent.id}:${agent.name}]完成注册`);
	}
	// 关闭连接
	fclose(agent: DBAgent) {
		let temp: DBAgent = DataUtil.valueForKey(this.socket_pool, agent.id);
		if (temp == null) {
			return;
		}
		Logger.info(`数据库连接:[${temp.id}:${temp.name}]关闭`);
		delete this.socket_pool[temp.id];
	}
	// 执行查询
	private query(sql: string, params: any[], callback: (error: Error, rows: any) => void) {
		if (DataUtil.isEmptyString(sql)) {
			Logger.warn(`SQL错误:SQL不能为空!`);
			return;
		}

		this.pool.query(sql, params, (query_error: Error, rows: any, fields: any) => {
			if (query_error) {
				Logger.warn(`SQL查询错误:${query_error}\n[${sql}]`);
			}
			//事件驱动回调  
			callback(query_error, rows);
		});
	}
}

new DBServ().lanuch();