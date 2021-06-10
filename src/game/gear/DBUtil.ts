import DataUtil from "./DataUtil";
import mysql from "mysql";

export default class DBUtil 
{
    /**创建插入 */
    static createInsert(table: string, valueObj: { [key: string]: any }, attachCmd:string = ""): string 
    {
        // INSERT INTO table_name (列1, 列2,...) VALUES (值1, 值2,....)
        let keylist = Object.keys(valueObj);
        if (keylist) {
            let keystr = keylist.map((key) => {
                return mysql.escapeId(key);
            }).join(", ");
            let valuestr = mysql.escape(Object.values(valueObj));

            return `INSERT INTO ${table} (${keystr}) VALUES (${valuestr}) ${attachCmd};`;
        }
        return "";
    }

    public static createInsertList(table:string,  valueObjList: { [key: string]: any }[]):string
    {
        // INSERT INTO table_name (列1, 列2,...) VALUES (值1, 值2,....)
        if (valueObjList.length > 0) 
        {
            let keylist = Object.keys(valueObjList[0]);
            let keystr = keylist.map((key) => 
            {
                return mysql.escapeId(key);
            }).join(", ");

            let valuestrList:string[] = [];
            for (let valueObj of valueObjList)
            {
                valuestrList.push(`(${mysql.escape(Object.values(valueObj))})`);
            }

            return `INSERT INTO ${table} (${keystr}) VALUES ${valuestrList.join(",")};`;
        }
        return "";
    }

    /**创建更新 */
    static createUpdate(table: string, valueObj: { [key: string]: any }, conditionObj: { [key: string]: any }): string {
        //UPDATE table_name SET field1=new-value1, field2=new-value2
        let index = 0;
        let condition = ``;
        for (let key in conditionObj) {
            condition += `${index > 0 ? " AND " : ""}${key}=${mysql.escape(conditionObj[key])}`;
            index++;
        }
        let fieldstr = mysql.escape(valueObj);
        return `UPDATE ${table} SET ${fieldstr} WHERE ${condition};`;
    }

    /**创建选中 */
    static createSelect(table: string, keyList: string[], conditionObj: { [key: string]: any }): string {
        //SELECT * FROM cy_mail WHERE serverId='${serverId}' AND toRoleId=${toRoleId}
        /* 
            SELECT column_name,column_name
            FROM table_name
            [WHERE Clause]
            [LIMIT N][ OFFSET M]
        */
        if (keyList.length < 1) {
            return "";
        }
        let fields = keyList.join(", ");
        let index = 0;
        let condition = ``;
        for (let key in conditionObj) {
            condition += `${index > 0 ? " AND " : ""}${key}=${mysql.escape(conditionObj[key])}`;
            index++;
        }

        return `SELECT ${fields} FROM ${table}${condition ? ` WHERE ${condition}` : ""}`;
    }

    /**创建删除 */
    static createDelete(table: string, conditionObj: { [key: string]: any }): string {
        let index = 0;
        let condition = ``;
        for (let key in conditionObj) {
            condition += `${index > 0 ? " AND " : ""}${key}=${mysql.escape(conditionObj[key])}`;
            index++;
        }

        return `DELETE FROM ${table} WHERE ${condition};`;;
    }

    /**转码 */
    public static format(list: any[]): void {
        let len = list.length;
        for (let i: number = 0; i < len; i++) {
            if (typeof list[i] === "string") {
                list[i] = mysql.escape(list[i]);
            }
        }
    }

    /** */
    static toString(value: any): string {
        if (value) {
            if (value instanceof Date) {
                let result = DataUtil.formatDate("YYYY-mm-dd HH:MM:SS", value.toString());
                return `'${result}'`;
            }
            return `'${value["toString"] ? value.toString() : value}'`;
        }
        return ``;
    }
}