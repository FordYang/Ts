import mysql from "mysql";
import GameConf from "../conf/GameConf";
// #更新数据库
let pool = mysql.createPool({
  host: "sh-cdb-qh83ks2s.sql.tencentcdb.com",
  user: "sa",
  password: "mj123456",
  database: "cyxt",
  port: GameConf.db_port,
  charset: "utf8mb4"
});

let sql = `select roleid from cy_record_money`;
pool.query(sql, async (err, rows, fields) => {
  if (err) {
    return;
  }
  //UPDATE table_name SET field1=new-value1, field2=new-value2
  for (let row of rows) {
    let serverid = await selectServer(row.roleid);

    let updateSql = `update cy_record_money set serverid=${serverid} where roleid=${row.roleid}`;
    if (serverid) {
      pool.query(updateSql);
    }
  }
});

async function selectServer(role_id: number): Promise<number> {
  return new Promise((resolve) => {
    let sql = `select server_id from cy_role where role_id=${role_id}`;
    pool.query(sql, (err, rows: { server_id: number }[], fields) => {
      if (err) {
        console.log(sql);
        resolve(0);
        return;
      }
      if (rows.length) {
        resolve(rows[0].server_id);
        return;
      }
      console.log(sql);
      resolve(0);
    });
  });
}