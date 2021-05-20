import Signal from "../../core/Signal";
import Http from "../../utils/Http";
import express, { json, urlencoded } from "express";
import { Request, Response } from "express";
import Launch from "../../core/Launch";
import GameUtil from "../../core/GameUtil";
import DataUtil from "../../gear/DataUtil";
import Logger from "../../gear/Logger";
import GameConf from "../../../conf/GameConf";
import { ErrorConst } from "../../consts/ErrorConst";
import MailMgr from "../../mgr/MailMgr";
import PlayerMgr from "../../model/playerObj/PlayerMgr";
import PayMgr from "../../mgr/PayMgr";
import GameTokenMgr from "../../mgr/GameTokenMgr";
import Player from "../../model/playerObj/Player";
import CmdID from "../CmdID";
import { ESystemNoticeType } from "../../consts/ESystemNoticeType";

// 网络请求
export default class HttpGame {
	static shared = new HttpGame();
	/**设置跨域访问 */
	app: express.Express;
	constructor() {
		this.app = express();
		this.app.use(function (req: Request, res: Response, next: any) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Expose-Headers", "'Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With");
			res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
			res.header("X-Powered-By", ' 3.2.1');
			res.header("Content-Type", "application/json;charset=utf-8");
			next();
		});
		this.app.use(json({ limit: "10mb" }));
		this.app.use(urlencoded({ limit: "10mb", extended: true }));
	}
	/**客户端IP */
	getClientIP(req: any, res: any): string {
		var ip = req.headers['x-forwarded-for'] ||
			req.ip ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress || '';
		if (ip.split(',').length > 0) {
			ip = ip.split(',')[0];
		}
		return ip;
	}

	// 全部存档
	saveAll(req: any, res: any) {
		Logger.info(`服务器[${GameUtil.serverName}]正在存档!`);
		Launch.shared.saveAll(false, (msg: string) => {
			let data =
			{
				server_id: GameUtil.serverId,
				server_name: GameUtil.serverName,
			};
			Http.reply(res, { code: ErrorConst.SUCCEED, msg: msg, data: data });
		});
	}

	// 关服
	close(req: any, res: any) {
		if (GameUtil.isClose) {
			let data =
			{
				server_id: GameUtil.serverId,
				server_name: GameUtil.serverName,
			}

			Http.reply(res, { code: ErrorConst.SUCCEED, msg: "服务器已关闭", data: data });
			return;
		}

		Launch.shared.close((msg: string) => {
			let data =
			{
				server_id: GameUtil.serverId,
				server_name: GameUtil.serverName,
			}
			Http.reply(res, { code: ErrorConst.SUCCEED, msg: msg, data });
		});
	}

	// 发送邮件
	sendMail(req: express.Request, res: express.Response): void 
	{
		if (!GameConf.mailEnabled) 
		{
			Http.reply(res, { code: ErrorConst.FAILED, msg: `发送邮件:邮件功能未开启` });
			return;
		}

		let queryObj = req.query;
		let toRoleId: number = parseInt(queryObj.to_role_id as string) || 0;
		MailMgr.instance.checkNew(toRoleId);
	}

	private sendNotice(req: express.Request, res: express.Response): void {
		let reqParam = req.query;
		let role_id: number = Number(reqParam.role_id) ?? 0;
		let msg = String(reqParam.msg);

		if (!msg) {
			Http.reply(res, {
				code: ErrorConst.FAILED,
				msg: `缺少必要参数！msg`
			});
			return;
		}

		let playerlist = role_id ? [PlayerMgr.shared.getPlayerByRoleId(role_id)] : PlayerMgr.shared.playerL;
		if (playerlist && playerlist.length > 0) {
			for (let player of playerlist) {
				player?.send(CmdID.s2c_sys_notice, { type: ESystemNoticeType.PAO_MA_DENG, msg });
			}
		}
		else {
			Http.reply(res, {
				code: ErrorConst.FAILED,
				msg: `未找到用户！role_id`
			});
			return;
		}

		Http.reply(res, {
			code: ErrorConst.SUCCEED,
		});
	}

	/** 支付成功后，平台回调此方法 */
	pay(req: express.Request, res: express.Response): void {
		let bodyObj = req.body;
		let paramObj = req.query;
		let orderId: number = parseInt((bodyObj.cp_order_no || paramObj.cp_order_no) as string);
		let cpOrderNo: string = (bodyObj.order_no || paramObj.order_no) as string;
		let is_success: boolean = bodyObj.is_success;
		let amount: number = Number(bodyObj.amount);
		let sign: string = bodyObj.sign;


		Logger.log("支付订单返回:", DataUtil.toJson(bodyObj));

		if (is_success) {
			if (orderId && cpOrderNo) {
				PayMgr.instance.payOk(orderId, cpOrderNo, amount, (code: ErrorConst, msg: string) => {
					if (code === ErrorConst.SUCCEED) {
						Http.reply(res, { code: ErrorConst.SUCCEED, msg: `游戏内充值成功` });
					}
					else {
						Http.reply(res, { code: ErrorConst.FAILED, msg: `游戏内充值失败 (${msg})` });
					}
				});
			}
			else {
				Http.reply(res, { code: ErrorConst.FAILED, msg: `游戏内充值失败 定单号为空` });
			}
		}
		else {
			Http.reply(res, { code: ErrorConst.FAILED, msg: "平台充值失败" });
		}
	}

	private pingGame(req: express.Request, res: express.Response): void {
		if (GameUtil.isClose) {
			Http.reply(res, { code: ErrorConst.SERVER_MAINTENANCE });
			return;
		}

		let resultObj =
		{
			code: ErrorConst.SUCCEED,
			sid: GameUtil.serverId,
			playernum: PlayerMgr.shared.getPlayerNum(),
			trustnum: PlayerMgr.shared.getTrustNum(),
			idlist: GameTokenMgr.instance.accountIdList
		};

		Signal.instance.gatePing();

		Http.reply(res, resultObj);
	}

	/**实名认证结果 */
	private authorPlayer(req: express.Request, res: express.Response) {
		if (GameUtil.isClose) {
			Http.reply(res, { code: ErrorConst.SERVER_MAINTENANCE });
			return;
		}

		let query = req.query;
		let resultObj = {
			code: ErrorConst.SUCCEED
		};
		console.log("同步服务器实名认证列表!");
		PlayerMgr.shared.syncAuthorPlayer(Number(query.uid), Number(query.state));

		Http.reply(res, resultObj);
	}
	//---------------------------------------------------------------------------------------------------------------------------------------

	// 启动Http服务
	start(port: number) {
		// 游戏服务器路由
		let list: { [key: string]: any } = {
			/**关服 */
			["close"]: this.close.bind(this),
			/**保存数据 */
			["save_all"]: this.saveAll.bind(this),
			//-----------------------------------------------------------------------------------------
			/**发送邮件 */
			["send_mail"]: this.sendMail.bind(this),
			// 系统通知
			['send_notice']: this.sendNotice.bind(this),
			/**支付 */
			["pay"]: this.pay.bind(this),
			/**收集游戏服务器信息 */
			["ping_game"]: this.pingGame.bind(this),
			/** */
			["author"]: this.authorPlayer.bind(this),

		};

		for (let key in list) {
			this.app.get('/' + key, list[key]);
			this.app.post('/' + key, list[key]);
		}
		this.app.listen(port);
	}
}