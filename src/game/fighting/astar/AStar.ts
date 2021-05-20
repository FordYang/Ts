import { AStarMap } from "./AStarMap";
import { AStarNode } from "./AStarNode";
import { AstarNodeColor } from "./AStarNodeColor";
import { BinaryHeap } from "./BinaryHeap";

export class AStar
{
    private heap:BinaryHeap;

    // private _startNode:AStarNode;
    // private _endNode:AStarNode;

    // private _path:number[];

    private _nowVersion:number = 0;

    private SQRT22:number = 1.414;

    private astarMap:AStarMap;

    constructor()
    {
        this.heap = new BinaryHeap();
        // this._path = [];
    }

    public setAStarMap(astarMap:AStarMap):void
    {
        this.astarMap = astarMap;
    }

    public findPath(sNode:AStarNode, eNode:AStarNode, outPath?:number[]):boolean
    {
        // this._startNode = sNode;
        // this._endNode = eNode;
        // this._path = path;

        this.heap.clear();
        sNode.g = 0;

        return this.search(sNode, eNode, outPath);
    }

    private search(sNode:AStarNode, eNode:AStarNode, outPath:number[]):boolean
    {
        var tempNode:AStarNode = sNode;
        var heap:BinaryHeap = this.heap;

        this._nowVersion++;
        if (this._nowVersion > 60000)
        {
            this._nowVersion = 0;
        }
        
        tempNode.version = this._nowVersion;

        // var tmpCount:number = 0;

        while (Math.max(Math.abs(tempNode.nx - eNode.nx), Math.abs(tempNode.ny - eNode.ny)) > 1)//tempNode !== eNode
        {
            this.calcFGH(tempNode, -1, 0, eNode);
            this.calcFGH(tempNode, 1, 0, eNode);
            this.calcFGH(tempNode, 0, -1, eNode);
            this.calcFGH(tempNode, 0, 1, eNode);

            // tmpCount++;
            if (heap.length === 0)
            {
                return false;
            }
            
            tempNode = heap.pop();
            tempNode.color = AstarNodeColor.BLACK;
        }

        // console.log("运算次数:------->", tmpCount);
        if (outPath && sNode !== tempNode)
        {
            // console.log('start:', sNode.nx, sNode.ny, ' end:', eNode.nx, eNode.ny, ' t:', tempNode.nx, tempNode.ny);

            this.buildPath(sNode, tempNode, outPath);
        }

        return true;
    }

    private calcFGH(parentNode:AStarNode, offx:number, offy:number, eNode:AStarNode):void
    {
        let tmpNode = this.astarMap.getNodeByGrid(parentNode.nx + offx, parentNode.ny + offy);

        if (tmpNode && tmpNode.walkable)
        {
            let tmpG = parentNode.g + 1;//tmpLink.cost;
            let tmpH = this.manhattan(tmpNode, eNode);
            let tmpF = tmpG + tmpH;
    
            // if (this.findMaxDist >= tmpF)
            {
                if (tmpNode.version !== this._nowVersion)
                {
                    tmpNode.f = tmpF;
                    tmpNode.g = tmpG;
                    tmpNode.h = tmpH;
                    tmpNode.nParent = parentNode;
                    tmpNode.color = AstarNodeColor.WHITE;
                    tmpNode.version = this._nowVersion;
                    this.heap.push(tmpNode);

                    // console.log(parentNode.nx, parentNode.ny, offx, offy, tmpNode.nx, tmpNode.ny);
                }
                else
                {
                    if (tmpNode.f > tmpF)
                    {
                        tmpNode.f = tmpF;
                        tmpNode.g = tmpG;
                        tmpNode.h = tmpH;
                        tmpNode.nParent = parentNode;
                        
                        this.heap.push(tmpNode);

                        // console.log(parentNode.nx, parentNode.ny, offx, offy, tmpNode.nx, tmpNode.ny);
                    }
                }
            }
        }
    }

    private buildPath(sNode:AStarNode, eNode:AStarNode, outPath:number[]):void
    {
        var tmpNode:AStarNode = eNode;
        while (tmpNode !== sNode)
        {
            outPath.push(tmpNode.ny, tmpNode.nx);
            tmpNode = tmpNode.nParent;
        }
        outPath.reverse();

        // console.log('path:', outPath);
    }

    private manhattan(node:AStarNode, eNode:AStarNode):number
    {
        return Math.abs(node.nx - eNode.nx) + Math.abs(node.ny - eNode.ny);
    }

    private euclidian(node:AStarNode, eNode:AStarNode):number
    {
        var dx:number = node.nx - eNode.nx;
        var dy:number = node.ny - eNode.ny;

        return Math.sqrt(dx * dx + dy * dy);
    }
}

