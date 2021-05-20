import { ErrorConst } from "../game/consts/ErrorConst";
import DB from "../game/utils/DB";
import mysql from "mysql";
import GameConf from "../conf/GameConf";
// #创建角色
let DBPool = mysql.createPool({
  host: "sh-cdb-qh83ks2s.sql.tencentcdb.com",
  user: "sa",
  password: "mj123456",
  database: "cyxt",
  port: GameConf.db_port,
  charset: "utf8mb4"
});

let skill_zs = [{ "baseId": 1999, "level": 1, "curexp": 0, "state": 1, "isauto": true, "pugong": true },
{ "baseId": 1001, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1002, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1003, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1004, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1005, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1006, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 1007, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false }];

let skill_fs = [{ "baseId": 2999, "level": 1, "curexp": 0, "state": 1, "isauto": true, "pugong": true, "equiplv": 0 },
{ "baseId": 2001, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2002, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2003, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2004, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2005, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2006, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 },
{ "baseId": 2007, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false, "equiplv": 0 }];

let skill_ds = [{ "baseId": 3999, "level": 1, "curexp": 0, "state": 1, "isauto": true, "pugong": true },
{ "baseId": 3001, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3002, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3003, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3004, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3005, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3007, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false },
{ "baseId": 3008, "level": 10, "curexp": 0, "state": 1, "isauto": true, "pugong": false }];

async function createPlayer(): Promise<number> {
  return new Promise((resolve) => {
    let account_id = 'CS_10004';
    let password = '123456';
    let platform_id = 3;

    let sql1 = `SELECT * FROM cy_account WHERE account_id = '${account_id}';`;
    DBPool.query(sql1, async (err, rows, fields) => {

    });

    let sql = `INSERT INTO cy_account(account_id, password_id, platform_id, phone, create_date) VALUES('${account_id}', '${password}','${platform_id}','', NOW());`;
    DBPool.query(sql, async (err, rows, fields) => {
      if (err) {
        return;
      }
      let player: any = {};
      player.money = 10000000;
      player.yuanbao = 100000;

      console.log("createPlayer", err, rows.insertId, fields);

      resolve(0);
      return;
      // let insertsql = `INSERT INTO cy_role(account,account_id,server_id,role_name,profession,role_exp,role_level,mapid,state,logintimes,money,yuanbao,create_date,lastonline) 
      // VALUES('${rows.account}','${rows.account_id}','${rows.server_id}','${rows.role_name}','${rows.profession}',0,1,1001,1,0,0,0, NOW(), NOW());`;
      // DB.query(sql, function (error: any, rows: any) {
      //   if (error) {
      //     callback(ErrorConst.FAILED, 0);
      //     return;
      //   }
      //   if (rows.length < 1) {
      //     Logger.warn(`创建角色:[${roleInfo.account}:${roleInfo.role_name}]不能多于一个!`);
      //     callback(ErrorConst.FAILED, 0);
      //     return;
      //   }
      //   callback(ErrorConst.SUCCEED, rows.insertId);
      // });
    });
  });
}

createPlayer();