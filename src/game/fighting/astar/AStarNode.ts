import { IPoolObject } from "../../core/memop/IPoolObject";
import { AstarNodeColor } from "./AStarNodeColor";

export class AStarNode implements IPoolObject
{
    nx:number;
    ny:number;

    /* 是否可行走 */
    walkable:boolean;

    //------------------------------
    public attachObj:any;

    //------------------------------------------------------------------
    
    public f:number;
    public g:number;
    public h:number;

    public color:AstarNodeColor;

    public version:number;

    public nParent:AStarNode;

    // links:AStarLink[];

    constructor()
    {

        // this.links = [];
    }

    public recyclePool():void
    {
        this.nParent = null;

        this.version = -1;
    }
    
    public setInfo(nx:number, ny:number, walk:boolean):void
    {
        this.nx = nx;
        this.ny = ny;
        this.walkable = walk;
    }
}