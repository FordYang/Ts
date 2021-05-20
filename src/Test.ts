import mysql from "mysql";
import GameConf from "./conf/GameConf";


let pool = mysql.createPool({
   host:"127.0.0.1",
   user:"ford",
   password:"1235789",
   database:"test",
   port: 3306,
   charset: "utf8mb4"
});

let sql = `select * from cy_rank1 where role_server_id=1000`;
pool.query(sql, async (err, rows, fields)=>
{
  if (err)
  {
    return;
  }
  //UPDATE table_name SET field1=new-value1, field2=new-value2
  // for (let row of rows)
  // {
  //   let serverid = await selectServer(row.role_id);

  //   let updateSql = `update cy_pay set server_id=${serverid} where role_id=${row.role_id}`;
  //   if (serverid)
  //   {
  //     pool.query(updateSql);
  //   }
  // }
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

console.log(process.env);

console.log(mysql.escape([]));

// let o = {a:10, b:"10", c:new Date()};
// let cc = JSON.stringify(o);
// let o1 = [cc, 10, "20", false];
// let ccc = mysql.escapeId("c...c");
// let ddd = mysql.escape(o1);

// console.log(cc);
// console.log(ccc);
// console.log(ddd);

// var userId = 1;
// var sql = "SELECT * FROM ?? WHERE ?? = ?";
// var inserts = ['users', 'id', userId];
// sql = mysql.format(sql, inserts); // SELECT * FROM users WHERE id = 1

// console.log(sql);

// let addSql = 'insert into test (date,byte,char1,b1) values (?,?,?,?)';
// let byte = Buffer.from("你好");
// let addSqlParams = [new Date(), byte, ccc, byte];
// connection.query(addSql, addSqlParams, (err, result)=>{
//    if (err)
//    {
//       console.log(err);
//       return;
//    }

// //    console.log(result);
// });

// let modSql = "update test set `date`=? where id=?";
// let modSqlParams = [new Date(), 12];
// let mm = mysql.format(modSql, modSqlParams);
// console.log(mm);
// connection.query(modSql, modSqlParams, (err, result)=>{
//    if (err)
//    {
//       console.log(err);
//       return;
//    }

//    console.log(result);
// });

// var delSql = "delete from test where id=3";
// connection.query(delSql, (err, result)=>
// {
//    if (err)
//    {
//       console.log(err);
//       return;
//    }

//    console.log(result);
// });

// connection.query("select char1, date from test", (err, result)=>
// {
//    if (err)
//    {
//       console.log(err);
//       return;
//    }

//    let date:Date = result[0].date;

//    let cc = result[0].char1;

//    // date.getTime();

//    console.log(date, cc);
// });

// var post  = {id: 12};
// // mysql.format('SELECT * FROM users WHERE ?', post);
// var query = connection.query(`UPDATE test SET char1 = '{\\"date\\":\\"2021_4_10\\",\\"map\\":{\\"2101\\":{\\"v\\":48,\\"m\\":55},\\"2102\\":{\\"v\\":23,\\"m\\":27},\\"2103\\":{\\"v\\":18,\\"m\\":21},\\"2104\\":{\\"v\\":0,\\"m\\":11},\\"2105\\":{\\"v\\":0,\\"m\\":7},\\"2106\\":{\\"v\\":0,\\"m\\":5},\\"4002\\":{\\"v\\":0,\\"m\\":2},\\"103033\\":{\\"v\\":108,\\"m\\":281},\\"103034\\":{\\"v\\":116,\\"m\\":320},\\"103036\\":{\\"v\\":34,\\"m\\":34},\\"103039\\":{\\"v\\":8,\\"m\\":31},\\"103040\\":{\\"v\\":2,\\"m\\":5},\\"104001\\":{\\"v\\":8,\\"m\\":9},\\"104002\\":{\\"v\\":10,\\"m\\":10},\\"104003\\":{\\"v\\":9,\\"…"104019\\":{\\"v\\":0,\\"m\\":10},\\"104020\\":{\\"v\\":0,\\"m\\":10},\\"104021\\":{\\"v\\":7,\\"m\\":10},\\"104022\\":{\\"v\\":9,\\"m\\":9},\\"104023\\":{\\"v\\":1,\\"m\\":9},\\"104024\\":{\\"v\\":0,\\"m\\":11},\\"104025\\":{\\"v\\":10,\\"m\\":10},\\"104026\\":{\\"v\\":0,\\"m\\":9},\\"104027\\":{\\"v\\":1,\\"m\\":10},\\"104028\\":{\\"v\\":6,\\"m\\":9},\\"104029\\":{\\"v\\":0,\\"m\\":10},\\"104030\\":{\\"v\\":8,\\"m\\":11},\\"104031\\":{\\"v\\":0,\\"m\\":10},\\"104032\\":{\\"v\\":0,\\"m\\":10},\\"104033\\":{\\"v\\":5,\\"m\\":9},\\"104034\\":{\\"v\\":56,\\"m\\":361}}}' WHERE id=12;`, function(err, results) 
// {
//     // ...
//     console.log(err);
// });

// console.log(query);

// let aaa = mysql.escape({a:10, b:"10", c:true, d:new Date()});

// let bbb = aaa.split(",").map((a)=>{
//     return a.trim();
// });

// console.log(aaa, bbb, ccc);

// let interfaces = networkInterfaces();

// console.log(interfaces);
