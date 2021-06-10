import CyObject from "../../core/CyObject";
import { Pool } from "../../core/memop/Pool";
import { AStarNode } from "./AStarNode";

export class AStarMap extends CyObject
{
    private static nodePool:Pool<AStarNode> = new Pool(AStarNode, 5000);

    //----------------------------------------------------------------------------
    private row:number;
    private col:number;

    private nodeList:AStarNode[];

    constructor()
    {
        super();

        this.nodeList = [];
    }

    public setSize(row:number, col:number):void
    {
        this.row = row;
        this.col = col;

        this.recycleNodeList();
        
        for (let i = 0; i < row; i++)
        {
            for (let j = 0; j < col; j++)
            {
                // let tmpWalk = Math.random() < 0.7;
                let aNode = this.createMapNode(j, i, true);
                this.nodeList.push(aNode);
            }
        }
    }

    private createMapNode(tx:number, ty:number, walk:boolean):AStarNode
    {
        var aNode:AStarNode = AStarMap.nodePool.alloc();//new AStarNode();
        aNode.setInfo(tx, ty, walk);
        return aNode;
    }

    /**
     * 根据行列返回节点
     * @param x 列
     * @param y 行
     * @returns 节点
     */
    public getNodeByGrid(x:number, y:number):AStarNode
    {
        if (x < 0 || x >= this.col || y < 0 || y >= this.row)
        {
            return null;
        }

        let idx = this.col * y + x;
        return this.nodeList[idx];
    }

    /**
     * 设置节点的可行走区域
     * @param x 
     * @param y 
     * @param walk 
     */
    public setWalkable(x:number, y:number, walk:boolean):void
    {
        let node = this.getNodeByGrid(x, y);
        if (node)
        {
            node.walkable = walk;
        }
    }

    public getRndPoint()
    {
        for(let i:number = 0; i < 20; i++)
        {
            let node = this.nodeList[Math.floor(Math.random() * this.nodeList.length)];
            if (node.walkable)
            {
                return {x:node.nx, y:node.ny};
            }
        }

        for (let node of this.nodeList)
        {
            if (node.walkable)
            {
                return {x:node.nx, y:node.ny};
            }
        }
        return null;
    }
    //---------------------------------------------------------------------------------
    private recycleNodeList():void
    {
        for (let node of this.nodeList)
        {
            AStarMap.nodePool.free(node);
        }
        this.nodeList.length = 0;
    }

    protected onDestroy():void
    {
        this.recycleNodeList();

        super.onDestroy();
    }
}