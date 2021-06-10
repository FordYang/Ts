import GameConf from '../../conf/GameConf';
import GameUtil from '../core/GameUtil';
import Logger from '../gear/Logger';
import * as socketio from "socket.io-client";
import mysql from "mysql";
import GlobalEnvMgr from '../mgr/GlobalEvnMgr';
import Launch from '../core/Launch';

interface SqlBackObj {
	id: number;
	sql: string;
	/** 0:未发送 1：已发送 */
	state: number;
	params: any[];
	func: (error: any, rows: any[]) => void;
}

export default class DBForm {
	public static readonly instance = new DBForm();

	sqlPool: SqlBackObj[];
	socket: socketio.Socket;
	sql_seed = 0;

	private callback: () => void;

	constructor() {
		this.sqlPool = [];
	}

	launch(callback?: () => void) {
		if (this.socket) {
			return;
		}
		this.callback = callback;

		let uri = `http://localhost:${GameConf.gate_db_port}`;
		this.socket = socketio.io(uri,
			{
				reconnection: true,
				autoConnect: true
			});
		let self = this;
		this.socket.on('connect', () => {
			//绑定连接上服务器之后触发的数据
			self.reset();
		});

		this.socket.on("disconnection", () => {
			Logger.info("连接:DBServ断开连接");
		});

		this.socket.on("sqled", (data: any) => {
			let id = data.id;
			let sqlInfo = this.sqlPool[id];
			if (sqlInfo) {
				if (data.error) {
					Logger.warn(`SQL错误:[${sqlInfo.sql}][${sqlInfo.params}][${data.error.toString()}]`);
				}

				sqlInfo.func?.(data.error, data.rows)
			}
			delete self.sqlPool[id];
		});
	}


	private reset(): void {
		this.socket.emit('reg',
			{
				name: GameUtil.serverName,
			});

		for (let sql_seed_id in this.sqlPool) {
			let sqlinfo = this.sqlPool[sql_seed_id];
			this.emitSql(sqlinfo);
		}

		this.callback?.();
		this.callback = null;
	}

	private emitSql(sqlInfo: SqlBackObj): void {
		if (sqlInfo && sqlInfo.state === 0) {
			sqlInfo.state = 1;
			this.socket.emit('sql',
				{
					id: sqlInfo.id,
					sql: sqlInfo.sql,
					params: sqlInfo.params
				});
		}
	}

	public asyncQuery(sql: string, params?: any[]): Promise<{ err: any, data?: any }> {
		return new Promise((resolve) => {
			let tmpSql = mysql.format(sql, params);
			DBForm.instance.query(tmpSql, (err, rows) => {
				resolve({ err: err, data: rows });
			});
		})
	}

	// 查询
	query(sql: string, callback?: (error: any, data: any) => void, params?: any[]) {
		if (sql) {
			this.sql_seed++;
			if (this.sql_seed > 60000) {
				this.sql_seed = 0;
			}

			let sqlinfo =
			{
				id: this.sql_seed,
				state: 0,
				sql: sql,
				params: params as any[],
				func: callback,
			}
			this.sqlPool[this.sql_seed] = sqlinfo;

			if (this.socket.connected) {
				this.emitSql(sqlinfo);
			}
			else {
				callback?.(new Error("未连接数据库服务"), null);
			}
		}
		else {
			let msg = `SQL错误:[SQL不能为空]!`
			Logger.warn(msg);
			callback?.(new Error(msg), null);
		}
	}
}