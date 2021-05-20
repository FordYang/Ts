/**
 * 数据工具类
 * @author BrightLi
 * @since 2020/5/3
 */

import path from "path";
import fs from "fs";
import Logger from "./Logger";
import Long from "long";

export default class DataUtil {
    // 随机数
    static random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // 从数组中随机抽取一项
    static randomItem<T>(value: T[]): T {
        if (value == null || value.length < 1) {
            return null;
        }
        let index = this.random(0, value.length);
        return value[index];
    }

    //---------------------------------------------------------------------------------------

    // 数组洗牌
    static shuffle(value: any[]): any[] {
        if (!Array.isArray(value)) {
            return null;
        }
        let result = this.clone(value);
        let j: number;
        for (let i = result.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    static randomListBy(list: any[], total: number): any[] {
        if (list == null || list.length < total) {
            return [];
        }
        list = this.clone(list);
        let result = [];
        for (let i = 0; i < total; i++) {
            let random = Math.floor(Math.random() * list.length);
            result.push(list.splice(random, 1)[0]);
        }
        return result;
    }
    // 替换指定位置的字符
    static replaceChar(value: string, index: number, char: string): string {
        return value.substr(0, index) + char + value.substr(index + char.length);
    }

    // 格式化数字，不足位补0
    static prefixInteger(num: number, length: number): string {
        let result = (Array(length).join('0') + num).slice(-length);
        return result;
    }

    // "YYYY-mm-dd HH:MM"
    static formatDate(format: string, value: string): string {
        let now = new Date(value);
        let opt: any =
        {
            "Y+": now.getFullYear().toString(),
            "m+": (now.getMonth() + 1).toString(),
            "d+": now.getDate().toString(),
            "H+": now.getHours().toString(),
            "M+": now.getMinutes().toString(),
            "S+": now.getSeconds().toString(),
        }
        let result: RegExpExecArray;
        for (let key in opt) {
            result = new RegExp(`(${key})`).exec(format);
            if (result) {
                format = format.replace(result[1], (result[1].length == 1) ? (opt[key]) : (opt[key].padStart(result[1].length, "0")));
            }
        }
        return format;
    }

    // 根据ID生成5位邀请码
    static encodeInvite(value: number) {
        let key = 'E50CDG3HQA4B1NOPIJ2RSTUV67MWX89KLYZ';
        let result = "";
        while (value > 0) {
            let mod = value % 35;
            value = (value - mod) / 35;
            result = key[mod] + result;
        }
        if (result.length < 5) {
            result = "F" + result;
            let len = result.length;
            let min = 0;
            let max = key.length - 1;
            for (let i = len; i < 5; i++) {
                let index = Math.floor(Math.random() * (max - min + 1)) + min;
                result = key[index] + result;
            }
        }
        return result;
    }

    // 解码邀请码
    static decodeInvite(value: string): number {
        let key = 'E50CDG3HQA4B1NOPIJ2RSTUV67MWX89KLYZ';
        let index = value.indexOf("F");
        if (index != -1) {
            value = value.slice(index + 1, value.length);
        }
        let result = 0;
        let p = 0;
        for (let i = value.length - 1; i >= 0; i--) {
            let char = value[i];
            index = key.indexOf(char);
            if (index != -1) {
                result += index * Math.pow(35, p);
                p++;
            }
        }
        return result;
    }

    // 是否存在KV
    static hasKVByList(list: any[], key: string, value: any): boolean {
        for (let item of list) {
            if (item[key] == value) {
                return true;
            }
        }
        return false;
    }

    // 获得二维数组中的数值
    static intOf2Array(list: number[][], one: number, two: number, valid: number): number {
        if (!list) {
            return valid;
        }
        if (one < 0 || one >= list.length) {
            return valid;
        }
        let temp = list[one];
        if (!temp) {
            return valid;
        }
        if (two < 0 || two >= temp.length) {
            return valid;
        }
        return temp[two];
    }

    static numberByString(target: string, splitter: string, index: number, valid: number = 0): number {
        if (!target) {
            return valid;
        }
        let temp = target.split(splitter);
        if (temp.length < index) {
            return valid;
        }
        let result = parseInt(temp[index]);
        return result;
    }

    // 读取JSON文件
    static readJson(filename: string): any {
        let file = path.join(__dirname, filename);
        let data = fs.readFileSync(file);
        let result: any = DataUtil.jsonBy(data.toString());//require(file);
        return result;
    }

    // 读取目录下的所有JSON文件
    static readDir(value: string, ext: string = ".json"): any {
        let dir = path.join(__dirname, value);
        let jsonFiles: any[] = [];
        this.findJsonFile(jsonFiles, dir, ext);
        let result: any = {};
        for (let json of jsonFiles) {
            let data = fs.readFileSync(json);
            let value: any = data.toString();
            let key: string = path.basename(json, ext);
            result[key] = value;
        }
        return result;
    }
    // 查找JSON文件
    private static findJsonFile(jsonFiles: any[], dir: string, ext: string) {
        let files = fs.readdirSync(dir);
        files.forEach((item, index) => {
            let filePath = path.join(dir, item);
            let stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                this.findJsonFile(jsonFiles, filePath, ext);
            }
            else if (stat.isFile()) {
                if (filePath.endsWith(ext)) {
                    jsonFiles.push(filePath);
                }
            }
        });
    }

    // JSON解析
    static jsonBy(value: string): any 
    {
        if (!value) 
        {
            return null;
        }
        try 
        {
            return JSON.parse(value);
        }
        catch (error)
        {
            Logger.warn(`JSON解析:${value},失败:${error}`);
            return null;
        }
    }

    // 转换成JSON字符串
    static toJson(value: any, valid?: string): string 
    {
        if (value === null || value === undefined) 
        {
            return valid;
        }

        try 
        {
            return JSON.stringify(value);
        }
        catch (error) 
        {
            Logger.warn(`JSON转换:${value},失败:${error}`);
            return valid;
        }
    }

    // 是否为数字
    static isNumber(value: any): boolean {
        let type = typeof value;
        if (type !== 'number') {
            return false;
        }
        return true;
    }

    // 转换成数字
    static numberBy(value: any, valid: number = 0): number {
        return Number(value) || valid;
    }

    // 转换成字符串
    static stringBy(value: any): string {
        if (value["toString"]) {
            return `${value.toString()}`;
        }
        return `${value}`;
    }

    // 版本号比较
    static checkVersion(versionA: string, versionB: string): number {
        if (!versionA || !versionB) return 0;
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        return 0;
    }

    // 是否为数组
    static isArray(value: any): boolean {
        return Array.isArray(value);
    }

    // 是否为对象
    static isObject(value: any): boolean {
        return typeof value === "object";
    }

    // 是否为字符串
    static isString(value: any): boolean {
        let result = typeof value;
        return result == "string";
    }

    // 判断对象是否为空
    static isEmptyObject(value: any): boolean {
        let keys = Object.keys(value);
        return keys.length == 0;
    }

    // 是否为空字符串
    static isEmptyString(value: string): boolean {
        return !value;
    }

    // 是否为空数组
    static isEmptyArray(value: any): boolean {
        if (!Array.isArray(value)) {
            return true;
        }
        return value.length == 0;
    }

    // 正则测试
    static testRegExp(value: string, regexp: RegExp, min: number, max: number, tip: string) {
        if (value.length < min) {
            return `长度不能少于${min}个`;
        }
        if (value.length > max) {
            return `最多只能${max}个`;
        }
        let temp = regexp.test(value);
        if (!temp) {
            return tip;
        }
        return "";
    }

    // 获得键值
    static valueForKey(target: any, key: any): any {
        if (!target) {
            Logger.warn(`$警告:获得键值,对象不存在`);
            return null;
        }
        if (key == null) {
            Logger.warn(`$警告:获得键值,对象${target}KEY值不存在`);
            return null;
        }
        if (Array.isArray(target)) {
            return target[key];
        }
        if (this.isObject(target)) {
            return target[key];
        }

        Logger.warn(`$警告:获得键值,${target}[${key}]不是一个对象`);
        return null;
    }

    // 检查是否合法
    static checkValid(value: string): string {
        if (value == null || value.length < 1) {
            return "不能为空!";
        }
        let temp = value.trim();
        if (value.length != temp.length) {
            return "两侧不能有空格";
        }
        let list = [{ char: "\"", text: "双引号" },
        { char: "\'", text: "单引号" }];
        for (let item of list) {
            if (value.indexOf(item.char) != -1) {
                return `不能包含${item.text}`;
            }
        }
        return "";
    }

    // 检查MYSQL转义
    static checkMYSQL(value: string): string {
        value.replace(/g\'/g, "\'");
        value.replace(/g\"/g, "\"");
        return value;
    }

    static trim(value: string): string {
        if (!value) {
            return "";
        }
        value = value.trim();
        return value;
    }

    // 获得最大值经验值
    static maxExp(config: any, exp: number): any {
        let result = exp;
        for (let key in config) {
            let item = config[key];
            if (exp < item.exp) {
                result = item.exp;
                break;
            }
        }
        return result;
    }

    // 获得当前阶段的经验值与最大值
    static currentExp(config: any, exp: number): any {
        let result: any = { value: 0, max: 0 };
        for (let key in config) {
            let item = config[key];
            let level = item.id;
            let max_exp = item.exp;
            if (exp < max_exp) {
                if (level > 1) {
                    let prev = config[`${level - 1}`];
                    result.value = exp - prev.exp;
                    result.max = max_exp - prev.exp;
                } else {
                    result.value = exp;
                    result.max = max_exp;
                }
                break;
            }
        }
        return result;
    }

    // 是否有属性
    static hasProperty(target: any, key: string | number | symbol): boolean {
        if (this.isObject(target)) {
            if (target.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    }

    // 获得字典长度
    static getLength(value: any): number {
        if (!value) {
            return 0;
        }
        return Object.keys(value).length;
    }

    // 深度拷贝
    public static clone<T>(value: T): T {
        if (value instanceof Object) {
            let result: any = {};
            for (let key in value) {
                result[key] = this.clone(value[key]);
            }
            return result;
        }
        else if (Array.isArray(value)) {
            let result: any[] = [];
            for (let obj of value) {
                result.push(obj);
            }
        }
        return value;
    }

    // 克隆类实例
    static cloneClass(value: any): any {
        if (!value) {
            return null;
        }
        let result = Object.create(
            Object.getPrototypeOf(value),
            Object.getOwnPropertyDescriptors(value)
        );
        return result;
    }

    // 是否在范围内
    static atRange(target: number, range: number[]): boolean {
        if (this.isEmptyArray(range)) {
            return false;
        }
        for (let item of range) {
            if (target == item) {
                return true;
            }
        }
        return false;
    }

    // 是否在范围内
    static atRangeByString(target: string, keys: string[]): boolean {
        for (let key of keys) {
            if (target == key) {
                return true;
            }
        }
        return false;
    }

    static clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(value, min), max);
    }

    // 去除重复
    static removeRepeat(list: any[], key: string): any[] {
        if (list == null || !this.isArray(list) || list.length < 1) {
            return [];
        }
        let filters = [];
        let result: any[] = [];
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            let value = item[key];
            if (value) {
                if (filters.indexOf(value) == -1) {
                    filters.push(value);
                } else {
                    list.splice(i, 1);
                    i--;
                    result.push(item);
                }
            }
        }
        return result;
    }

    // 获得数组元素
    static getItemBy<T>(list: T[], index: number): T {
        if (Array.isArray(list)) {
            return list[index];
        }
        return undefined;
    }

    // 保留2位小数
    static toDecimal2(value: number): number {
        let temp = this.numberBy(value, 0);

        return parseInt(temp.toFixed(2));
    }

    // 获得定义值
    static getDefault<T>(value: T, valid: T): T {
        return value ?? value;
    }

    public static longToNumber(obj: any): void {
        if (obj) {
            let value: any;
            let keys = Object.keys(obj);// obj.keys();
            for (let key of keys) {
                value = obj[key];
                if (value instanceof Long) {
                    obj[key] = value.toNumber();
                }
                else if ((typeof value) === "object") {
                    this.longToNumber(obj[key]);
                }
            }
        }
    }
}