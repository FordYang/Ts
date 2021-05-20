
export default class Logger {
    /**是否开启调试 */
    static isDebug: boolean = true;

    /**输出 */
    public static log(message?: any, ...optionalParams: any[]): void 
    {
        if (!this.isDebug) 
        {
            return;
        }
        console.log(new Date().toTimeString(), message, ...optionalParams);
    }
    /**打印报错 */
    public static error(message?: any, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams);
    }
    /**打印警告 */
    static warn(msg: any) {
        console.warn(msg);
    }
    /**输出详情 */
    static info(msg: any) {
        console.info(msg);
    }
    /**调试日志 */
    static debug(msg: any) {
        if (!this.isDebug) {
            return;
        }
        console.debug(msg);
    }
}

// /**配置输出 */
// export const conf4js = {
//     appenders: [{
//         type: "console",
//         category: "console"
//     }, {
//         type: "dateFile",
//         filename: __dirname + '/../logs/' + gametype,
//         alwaysIncludePattern: true,
//         pattern: "-yyyy-MM-dd-hh.log",
//         category: "console"
//     }],
//     replaceConsole: true,
//     levels: {
//         "console": "ALL",
//     }
// }