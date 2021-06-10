import * as qs from "qs";
import * as https from "https";
import * as http from "http";
import DataUtil from "../gear/DataUtil";
import Logger from "../gear/Logger";
import { IncomingMessage, ServerResponse } from "http";
import express from "express";
import { ErrorConst } from "../consts/ErrorConst";

export default class Http {
	static sendpost(host: any, port: any, path: any, data: any, callback: any) {
		if (host == null) {
			Logger.warn(`HTTP错误:host不能为空!`);
			return;
		}
		var content = qs.stringify(data);
		var options = {
			hostname: host,
			port: port,
			path: path + '?' + content,
			method: 'GET'
		};
		let req = http.request(options, function (res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				callback(chunk);
			});
		});
		req.setTimeout(5000);
		req.on('error', function (e) {
			Logger.warn(`problem with request:${e.message}`);
		});
		req.end();
	};

	static sendgeturl = function (url: any, data: any, callback: any, safe: any) {
		let content = qs.stringify(data);
		url = url + '?' + content;
		let proto: any = http;
		if (safe) {
			proto = https;
		}
		let req = proto.get(url, function (res: any) {
			var str = "";
			res.setEncoding('utf8');
			res.on('data', function (chunk: any) {
				str += chunk;
			});
			res.on("end", function () {
				console.log(str.toString());
			});
		});

		req.on('error', function (e: any) {
			console.log('problem with request: ' + e.message);
			callback(false, e);
		});
		req.setTimeout(5000);
		req.end();
	};

	static isJSON(str: any) {
		if (typeof str == 'string') {
			try {
				var obj = DataUtil.jsonBy(str);
				if (typeof obj == 'object' && obj) {
					return true;
				} else {
					return false;
				}

			} catch (e) {
				console.log('error：' + str + '!!!' + e);
				return false;
			}
		}
		return false;
	}

	static sendget(host: string, port: any, path: any, data: any, callback: (success: boolean, data: any) => void, safe?: any) {
		if (!host) {
			Logger.debug('请求网址不能为空');
			callback(false, null);
			return;
		}
		if (!DataUtil.atRange(port, [7561, 7910, 7911, 7912, 7913, 7914, 7915, 7916, 7917, 8918, 7919, 7920])) {
			Logger.debug(`$警告:非法请求${host}:${port}?${data}`);
		}
		let content = qs.stringify(data);
		let options: any = {
			hostname: host,
			path: path + '?' + content,
			method: 'GET'
		};
		if (port) {
			options.port = port;
		}
		let proto: any = http;
		if (safe) {
			proto = https;
		}
		let req = proto.request(options, (res: IncomingMessage) => {
			res.setEncoding('utf8');

			let data: string = "";
			res.on("end", () => {
				try {
					let json = DataUtil.jsonBy(data);
					callback(true, json);
				}
				catch (error) {
					callback(false, data);
				}
			})

			res.on('data', function (chunk: any) {
				data += chunk;
			});
		});

		req.setTimeout(15000);
		req.on('error', function (error: Error) {
			let info = `http://${host}${path}:${port},请求错误:${error.message}`;
			Logger.warn(info);
			callback(false, error);
		});
		req.end();
	};

	static sendPost(host: any, path: any, data: any, callback: any) {
		let contents = qs.stringify(data);
		let options: any = {
			host: host,
			// port: 8081,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': contents.length
			}
		};
		let req = https.request(options, function (res: any) {
			res.setEncoding('utf8');
			res.on('data', function (data: any) {
				callback(data);
			});
		});
		req.write(contents);
		req.end();
	};

	static reply(res: express.Response, data: { code: ErrorConst, [key: string]: any }): void {
		let msg = DataUtil.toJson(data);
		res.end(msg);
	};
}

