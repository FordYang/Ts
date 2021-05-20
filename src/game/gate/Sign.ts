import md5 from 'md5';
// 以下示例为ES6示例
const SECRET = '1c2rYUhFD18M3sO2'
export default class Md5Sign {
    static onSignMd5(params: any) {
        params['time'] = Math.floor(Date.now() / 1000);// 获取秒时间戳
        params['secret'] = SECRET;
        params['sign'] = this.doSign(params);
        delete params['secret'];
    }

    static arrSort(params: any) {
        let result: any = {}
        Object.keys(params).sort().map(key => {
            result[key] = params[key]
        })
        return result;
    }

    static doSign(params: any) {
        const obj: any = this.arrSort(params) // 对象内的属性按顺序排列
        const queryArr = []
        for (const key in obj) {
            const str = `${key}=${obj[key]}`
            queryArr.push(str)
        }
        const query = queryArr.join('&')
        return md5(query)
    }
}