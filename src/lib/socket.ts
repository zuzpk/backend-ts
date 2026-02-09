import { dynamic } from "@zuzjs/core";
import { IncomingMessage } from "node:http";
import { LogEntry, logHistory } from "./logger";
import { pubsub } from "@/cache";
import { Events } from "./types";
import pc from "picocolors"

export const handleSocketMessage = (req:IncomingMessage, ms, ws, origin) => {
    
    const raw = JSON.parse(Buffer.isBuffer(ms) ? ms.toString(`utf8`) : `string` == typeof ms ? ms : ms.data)

    const respond = (a: string, m: dynamic) => {
        if ( ws && ws.readyState == WebSocket.OPEN ){
            ws.send(JSON.stringify({ a, m, }))
        }
    }

    pubsub.on(Events.TLog, (entry: LogEntry) => respond("tlog", { msg: `[${pc.cyan(entry.appId)}] ${entry.message}` }))    

    if ( `a` in raw && `m` in raw){

        switch(raw.a){
            case "ping":
                respond("pong", {})
                break;
            case "tlog":
                logHistory.forEach((log: LogEntry) => {
                    respond("tlog", { appId: raw.m, msg: `[${pc.cyan(log.appId)}] ${log.message}` })
                })
                break;
        }


    }

}