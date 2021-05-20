import Logger from "../gear/Logger";
import GameUtil from "../core/GameUtil";
import Agent from "./Agent";
import AgentBase from "./AgentBase";
import ws from "ws";
import ArrayUtil from "../gear/ArrayUtil";
import PlayerMgr from "../model/playerObj/PlayerMgr";
import { IncomingMessage } from "http";

let agent_seed_id = 1000;

function nextId(): number {
    return agent_seed_id++;
}


export default class AgentMgr {
    static shared = new AgentMgr();

    //------------------------------------------------------------------------------------------------------------

    private io: ws.Server;

    private agentlist: Agent[];
    private agentMap: { [id: number]: Agent };

    constructor() {
        this.io = null;

        this.agentlist = [];
        this.agentMap = {};
    }

    /** 一分钟触发一次 */
    public update_min(): void 
    {
        for (let agent of this.agentlist) 
        {
            agent.update_min();
        }
    }

    //------------------------------------------------------------------------------------------------------------
    private addAgent(agent: Agent) {
        agent.id = nextId();
        this.agentlist.push(agent);
        this.agentMap[agent.id] = agent;
        agent_seed_id++;
    }

    delAgent(agentId: number) {
        let agent = this.agentMap[agentId];
        ArrayUtil.fastRemove(this.agentlist, agent);

        delete this.agentMap[agentId];
    }

    getAgent(agentid: any): Agent {
        return this.agentMap[agentid];
    }

    launch() 
    {
        let wss = new ws.Server(
            { 
                port: GameUtil.serverConf.game_port,
                verifyClient:(info:  { origin: string; secure: boolean; req: IncomingMessage })=>
                {
                    // console.log(info);
                    return true;
                }
            });

        wss.on("connection", (ws) => 
        {
            let agent = new Agent(ws);
            agent.init();
            this.addAgent(agent);

            ws.on("close", (code, reason) => 
            {
                this.delAgent(agent.id);
            });

            ws.on("error", (err) => 
            {
                this.delAgent(agent.id);
            });
        });

        wss.on('error', (ws: any) => 
        {
            Logger.debug('error');
        });

        this.io = wss;
        Logger.debug(`网关代理模块启动完毕，正在监听${GameUtil.serverConf.game_ip}:${GameUtil.serverConf.game_port}`);
    }

    // 关服
    public close(): void 
    {
        let tmplist = this.agentlist.concat();
        for (let agent of tmplist) 
        {
            agent.destroy();
        }

        this.agentlist.length = 0;
        this.agentMap = {};

        if (this.io) 
        {
            this.io.close();
            this.io = null;
        }
    }
}
