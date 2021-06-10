import Logger from "./Logger";

/**
 * SnowFlake 53位雪花算法
 *
 * SnowFlake的结构如下(共53bits，每部分用-分开):
 *  1bit不用 31bit 时间戳 5bit 数据标识id 16bit 序列号id
 *
 * - 1位标识，二进制中最高位为1的都是负数，但是我们生成的id一般都使用整数，所以这个最高位固定是0
 * - 31位时间截(秒级)，注意，31位时间截不是存储当前时间的时间截，而是存储时间截的差值（当前时间截 - 开始时间截得到的值），这里的的开始时间截，一般是我们的id生成器开始使用的时间，由我们程序来指定的（如下下面程序IdWorker类的startTime属性）。41位的时间截，可以使用69年，年T = (1L << 41) / (1000L * 60 * 60 * 24 * 365) = 69
 * - 5位的数据机器位，可以部署在32个节点，5位workerId
 * - 16位序列，毫秒内的计数，16位的计数顺序号支持每个节点每毫秒(同一机器，同一时间截)产生65535个ID序号
 * - 加起来刚好53位，为一个Long型。
 * SnowFlake的优点是
 *   - 整体上按照时间自增排序
 *   - 并且整个分布式系统内不会产生ID碰撞(由数据中心ID和机器ID作区分)
 *   - 并且效率较高，经测试，SnowFlake每秒能够产生26万ID左右。
 */
export default class SnowFlack53 {
    // 开始时间截 (2021-01-01 12:00:00)，这个可以设置开始使用该系统的时间 1609473600
    private readonly twepoch: bigint = 1609473600n;
    // 位数划分 [数据标识id(5bit 31)、机器id(5bit 31)](合计共支持1024个节点)、序列id(12bit 4095)
    private readonly workerIdBits: bigint = 5n; // 标识Id
    private readonly sequenceBits: bigint = 16n; // 序列Id
    // 支持的最大十进制id
    // 这个移位算法可以很快的计算出几位二进制数所能表示的最大十进制数
    // -1 左移5位后与 -1 异或
    private readonly maxWorkerId: bigint = -1n ^ (-1n << this.workerIdBits);
    // 生成序列的掩码，这里为65535 
    private readonly sequenceMask: bigint = -1n ^ (-1n << this.sequenceBits);
    // 机器ID向左移16位 数据标识id向左移17位(12+5) 时间截向左移21位(5+16)
    private readonly workerIdShift: bigint = this.sequenceBits;
    private readonly dataCenterIdShift: bigint = this.sequenceBits + this.workerIdBits;
    private readonly timestampLeftShift: bigint = this.dataCenterIdShift;
    // 工作机器ID(0~31) 毫秒内序列(0~65535)
    private sequence: bigint = 0n;
    // 上次生成ID的时间截（这个是在内存中？系统时钟回退+重启后呢）
    private lastTimestamp: bigint = -1n;
    private readonly workerId: bigint;
    private readonly dataCenterId: any;
    /**
    * 构造函数
    * 运行在内阁
    * @param {bigint} workerId 工作ID (0~31)
    * @param {bigint} sequence 毫秒内序列 (0~65535)
    */
    constructor(workerId: bigint) {
        if (workerId > this.maxWorkerId || workerId < 0n) {
            throw new Error(
                `机器ID不能大于${this.maxWorkerId}或小于0!`,
            )
        }
        this.workerId = workerId;
        return this;
    }

    /**
     * 获得下一个ID (该方法是线程安全的)
     *
     * @returns {number} SnowflakeId 返回53位id
     */
    public nextId(): number {
        let timestamp = this.timeGen();
        // 如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过这个时候应当抛出异常
        const diff = timestamp - this.lastTimestamp;
        if (diff < 0n) {
            throw new Error(
                `Clock moved backwards. Refusing to generate id for ${-diff} milliseconds`
            );
        }
        // 如果是同一时间生成的，则进行毫秒内序列
        if (diff === 0n) {
            this.sequence = (this.sequence + 1n) & this.sequenceMask;
            // 毫秒内序列溢出
            if (this.sequence === 0n) {
                // 阻塞到下一个，获得新的时间戳
                timestamp = this.tilNextMillis(this.lastTimestamp);
            }
        } else {
            // 时间戳改变，毫秒内序列重置
            this.sequence = 0n;
        }
        // 保存上次生成ID的时间截
        this.lastTimestamp = timestamp;
        // 移位并通过或运算拼到一起组成64位的ID
        // 将各 bits 位数据移位后或运算合成一个大的64位二进制数据
        let nextId: BigInt = (
            ((timestamp - this.twepoch) << this.timestampLeftShift) | // 时间数据左移21
            (this.workerId << this.workerIdShift) | // 机器id左移 16
            this.sequence
        );
        let result: number = parseInt(nextId.toString());
        if (Number.isSafeInteger(result)) {
            return result;
        } else {
            let info = `分布式ID超出JS整数安全范围`;
            Logger.warn(info);
            throw new Error(info);
        }
    }
    /**
     * 阻塞到下一个秒，直到获得新的时间戳
     * @param {bigint} lastTimestamp 上次生成ID的时间截
     * @return {bigint} 当前时间戳
     */
    private tilNextMillis(lastTimestamp: bigint): bigint {
        let timestamp = this.timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = this.timeGen();
        }
        return timestamp;
    }
    /**
     * 返回以秒为单位的当前时间
     * @return {bigint} 当前时间(秒)
     */
    private timeGen(): bigint {
        let result = BigInt(Math.floor(new Date().valueOf() / 1000));
        return result;
    }
    // 获得分步式自增ID机器ID
    public getWorkerId(id: bigint): number {
        let workerId = (id >> this.sequenceBits) & this.maxWorkerId;
        let result = parseInt(workerId.toString());
        return result;
    }
    // 获得分步式自增ID序列号ID
    public getSequence(id: bigint): number {
        let sequence = id & this.sequenceMask;
        let result = parseInt(sequence.toString());
        return result;
    }
}