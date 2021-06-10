import { AStarNode } from "./AStarNode";

export class AStarFloyd
{
    public static floyd(path:AStarNode[]):AStarNode[]
    {
        if (path.length <= 2)
        {
            return path;
        }

        var ret:AStarNode[] = [];

        var tmpNodeA:AStarNode = path[0];
        var tmpNodeB:AStarNode = path[1];
        var tmpDxA:number = tmpNodeB.nx - tmpNodeA.nx;
        var tmpDyA:number = tmpNodeB.ny - tmpNodeA.ny;

        ret.push(tmpNodeA);
        ret.push(tmpNodeB);

        var tmpDxB:number, tmpDyB:number;
        
        tmpNodeA = tmpNodeB;
        var len:number = path.length;
        for (var i:number = 2; i < len; i++)
        {
            tmpNodeB = path[i];
            tmpDxB = tmpNodeB.nx - tmpNodeA.nx;
            tmpDyB = tmpNodeB.ny - tmpNodeA.ny;
            if (tmpDxA == tmpDxB && tmpDyA == tmpDyB)
            {
                ret[ret.length - 1] = tmpNodeB;
            }
            else
            {
                tmpDxA = tmpDxB;
                tmpDyA = tmpDyB;
                ret.push(tmpNodeB);
            }
            tmpNodeA = tmpNodeB;
        }

        return ret;
    }
}