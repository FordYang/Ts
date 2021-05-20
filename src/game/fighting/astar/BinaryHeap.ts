export class BinaryHeap
{
    private _heapVec:{f:number}[];

    constructor()
    {
        this._heapVec = [];
    }

    public get length():number
    {
        return this._heapVec.length;
    }

    public clear():void
    {
        this._heapVec.length = 0;
    }

    public get minVal():number
    {
        return this._heapVec[0].f;
    }

    public push(val:{f:number}):void
    {
        var heapVec:{f:number}[] = this._heapVec;

        heapVec.push(val);
        var curIdx:number = heapVec.length - 1;
        var parentIdx:number = (curIdx - 1) >> 1;
        var tmpObj:{f:number};
        while (curIdx > 0 && heapVec[curIdx].f < heapVec[parentIdx].f)
        {
            tmpObj = heapVec[curIdx];
            heapVec[curIdx] = heapVec[parentIdx];
            heapVec[parentIdx] = tmpObj;

            curIdx = parentIdx;
            parentIdx = (curIdx - 1) >> 1;
        }
    }

    public pop():any
    {
        var heapVec:{f:number}[] = this._heapVec;

        if (heapVec.length == 1)
        {
            return heapVec.pop();
        }

        var min:{f:number} = heapVec[0];
        heapVec[0] = heapVec.pop();

        var len:number = heapVec.length;
        var curIdx:number = 0;
        var leftIdx:number = 0;
        var rightIdx:number = 0;
        var minIdx:number = 0;
        var tmpObj:{f:number};

        leftIdx = curIdx * 2 + 1;
        rightIdx = leftIdx + 1;
        while (leftIdx < len)
        {
            if (rightIdx < len)
            {
                minIdx = heapVec[leftIdx].f < heapVec[rightIdx].f ? leftIdx: rightIdx;
            }
            else
            {
                minIdx = leftIdx;
            }

            if (heapVec[minIdx].f < heapVec[curIdx].f)
            {
                tmpObj = heapVec[minIdx];
                heapVec[minIdx] = heapVec[curIdx];
                heapVec[curIdx] = tmpObj;

                curIdx = minIdx;
                
                leftIdx = curIdx * 2 + 1;
                rightIdx = leftIdx + 1;
            }
            else
            {
                break;
            }
        }
        return min;
    }
}