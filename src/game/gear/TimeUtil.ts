export default class TimeUtil {
    static delay(block: () => void, delay: number = 15000, handle: number = 0): NodeJS.Timeout {
        if (handle != 0) {
            return null;
        }
        let result = setTimeout(block, delay);
        return result;
    }

    static cancelDelay(handle: NodeJS.Timeout): NodeJS.Timeout {
        if (handle != null) {
            clearTimeout(handle);
        }
        return handle;
    }

    static loop(block: () => void, timeout: number, handle: number = 0): NodeJS.Timeout {
        this.cancelLoop(handle);
        let result = setInterval(block, timeout);
        return result;
    }

    static cancelLoop(handle: number): number {
        if (handle != 0) {
            clearInterval(handle);
        }
        return 0;
    }

    static hasRun(handle: number): boolean {
        if (handle == 0) {
            return false;
        }
        return true;
    }
}