import { RedisClient } from "redis";
import DataUtil from "./DataUtil";
import Logger from "./Logger";

export default class RedisUtil {
    // static redis: RedisClient;

    // static launch() {
    //     if (this.redis) {
    //         return;
    //     }
    //     this.redis = new RedisClient({
    //         host: "103.88.32.251",
    //         port: 6379,
    //         password: "111111"
    //     });
    //     Logger.debug(`REDIS连接`);
    // }

    // static async setValue(key: string, value: any) {
    //     let v: string = DataUtil.toJson(value, null);
    //     try {
    //         await this.redis.set(key, v);
    //     } catch (error) {
    //         Logger.warn(`REDIS:设置[${key}=${v}]错误:${error}\n${error.stack}`);
    //     }
    // };

    // static async setExpireValue(key: string, value: any, seconds: number) {
    //     let v: string = DataUtil.toJson(value, null);
    //     try {
    //         await this.redis.setex(key, seconds, v)
    //     } catch (error) {
    //         Logger.warn(`REDIS:设置[${key}=${v}:${seconds}秒]错误:${error}\n${error.stack}`);
    //     }
    // };

    // static async getValue(key: any, valid?: number): Promise<any> {
    //     try {
    //         let result = this.redis.get(key);
    //         if (result == null) {
    //             return valid;
    //         }
    //         result = DataUtil.jsonBy(result);
    //         return result;
    //     } catch (error) {
    //         Logger.warn(`REDIS:获得[${key}错误:${error}\n${error.stack}`);
    //         return valid;
    //     }
    // }

    // static async delValue(key: string): Promise<Number> {
    //     try {
    //         let result = await this.redis.del(key);
    //         return result;
    //     } catch (error) {
    //         return null;
    //     }
    // }
}