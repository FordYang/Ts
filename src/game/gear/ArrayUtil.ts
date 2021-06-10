export default class ArrayUtil {
    public static fastRemoveIdx<T>(list: T[], idx: number): void {
        list[idx] = list[list.length - 1];
        list.length = list.length - 1;
    }

    public static fastRemove<T>(list: T[], data: T): void 
    {
        let idx = list.indexOf(data);
        if (idx !== -1) 
        {
            ArrayUtil.fastRemoveIdx(list, idx);
        }
    }
}