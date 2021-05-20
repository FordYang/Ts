import mysql from "mysql";
import { createServer } from "node:http";
import EventEmitter from "events";
import { networkInterfaces } from "os";
import GameConf from "./conf/GameConf";


let pool = mysql.createPool({
   host:"sh-cdb-qh83ks2s.sql.tencentcdb.com",
   user:"sa",
   password:"mj123456",
   database:"cyxt",
   port: GameConf.db_port,
   charset: "utf8mb4"
});

let sql = `select role_id from cy_pay`;
pool.query(sql, async (err, rows, fields)=>
{
  if (err)
  {
    return;
  }
  //UPDATE table_name SET field1=new-value1, field2=new-value2
  for (let row of rows)
  {
    let serverid = await selectServer(row.role_id);

    let updateSql = `update cy_pay set server_id=${serverid} where role_id=${row.role_id}`;
    if (serverid)
    {
      pool.query(updateSql);
    }
  }
});

async function selectServer(role_id:number):Promise<number>
{
  return new Promise((resolve)=>{
    let sql = `select server_id from cy_role where role_id=${role_id}`;
    pool.query(sql, (err, rows:{server_id:number}[], fields)=>
    {
      if (err)
      {
        console.log(sql);
        resolve(0);
        return;
      }
      if (rows.length)
      {
        resolve(rows[0].server_id);
        return;
      }
      console.log(sql);
      resolve(0);
    });
  });
}