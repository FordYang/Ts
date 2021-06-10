export default class DateUtil 
{
    private static tdate:Date = new Date();
    public static get nowDay(): number 
    {
        let date = DateUtil.tdate;
        date.setTime(Date.now());

        return date.getMonth() * 31 + date.getDate();//`${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
    }

    static toString(value: Date): string {
        let year = value.getFullYear();
        let month = (value.getMonth() + 1).toString();
        let day = value.getDate().toString();
        let result = `${year}-${month}-${day}`;
        return result;
    }

    static dateBy(value: string): Date {
        if (value == null) {
            return null;
        }
        let params = value.split("-");
        if (params.length != 3) {
            return null;
        }
        let year = parseInt(params[0]);
        let month = parseInt(params[1]);
        let day = parseInt(params[2]);
        let result = new Date(year, month - 1, day);
        return result;
    }

    static atRange(start: string, end: string): boolean {
        let now = new Date();
        let startDate = this.dateBy(start);
        if (startDate) {
            if (now < startDate) {
                return false;
            }
        }
        let endDate = this.dateBy(end);
        if (endDate) {
            if (now > endDate) {
                return false;
            }
        }
        return true;
    }
    // 格式化消息时间
    static formatMsgTime(last: Date): string {
        let year = last.getFullYear();
        let month = last.getMonth() + 1;
        let day = last.getDate();
        let hour = last.getHours();
        let minute = last.getMinutes();
        let now = new Date();
        let now_time = now.getTime();
        let milliseconds = 0;
        let result;
        milliseconds = now_time - last.getTime();
        if (milliseconds <= 1000 * 60 * 1) {
            result = '刚刚';
        }
        else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
            result = Math.round((milliseconds / (1000 * 60))) + '分钟前';
        }
        else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
            result = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
        }
        else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
            result = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
        }
        else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
            result = month + '-' + day + ' ' + hour + ':' + minute;
        } else {
            result = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
        }
        return result;
    };

    
	/**
	 * 格式2  yyyy-mm-dd h:m:s
	 * @param  {number} ms        毫秒数
	 * @returns string            返回自1970年1月1号0点开始的对应的时间点
	 */
	public static format_2(date:Date): string 
    {
        if (date)
        {
            let year = date.getFullYear().toString().padStart(2, "0");
            let month = (date.getMonth() + 1).toString().padStart(2, "0"); 	//返回的月份从0-11；
            let day = date.getDate().toString().padStart(2, "0");
            let hours = date.getHours().toString().padStart(2, "0");
            let minute = date.getMinutes().toString().padStart(2, "0");
            let second = date.getSeconds().toString().padStart(2, "0");
            return `${year}-${month}-${day} ${hours}:${minute}:${second}`;
        }
        return '';
	}
}