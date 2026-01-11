import { Cog } from "@/app"
import { APP_NAME, APP_URL, SESS_DURATION, VAPID } from "@/config"
import { handleAPI, Logger } from "@/lib"
import { withZuzRequest } from "@/lib/zrequest"
import zorm from "@/zorm"
import { withCredentials } from "@zuzjs/core"
import bodyParser from "body-parser"
import { RedisStore } from "connect-redis"
import cookieParser from "cookie-parser"
import cors from "cors"
import de from "dotenv"
import express, { Request, Response } from "express"
import session from "express-session"
import http, { IncomingMessage } from "http"
import type { Buffer as BufferType } from "node:buffer"
import { Socket } from "node:net"
import { createClient } from "redis"
import webpush from "web-push"
import { WebSocket, WebSocketServer } from "ws"

const redisClient = createClient()
redisClient.connect().catch(console.error)
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

de.config()
withCredentials(true)

/** Parse APP_URL to get Host for session store */
const { hostname } = new URL(APP_URL);


const app = express();
app.disable(`x-powered-by`);
app.use(
    cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }), 
    cookieParser(process.env.ENCRYPTION_KEY), 
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    session({
        secret: process.env.ENCRYPTION_KEY!,
        name: `${APP_NAME.toLowerCase()}.sid`,
        resave: false,
        saveUninitialized: false,
        store: redisStore,
        cookie: { 
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 * SESS_DURATION,
            domain: hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
                ? undefined
                : `.${hostname.split('.').slice(-2).join('.')}`,
        }
    }),
    // withAccessLogger,
    withZuzRequest
)
 
app.get(`/*splat`, (req: Request, resp: Response) => handleAPI("Get", req, resp))
app.post(`/*splat`, (req: Request, resp: Response) => handleAPI("Post", req, resp))

const httpServer = http.createServer(app)
export const wss = new WebSocketServer({ noServer: true })

httpServer.on(`upgrade`, async (req: IncomingMessage, socket: Socket, head: BufferType) => {
    try{
        wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
            wss.emit('connection', ws, req);
        });
    }
    catch(err){
        Logger.error(`[HTTPRequestUpgradeErrored]`, err);
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
})

httpServer.listen(process.env.APP_PORT, async () => {

    zorm.connect().then(async () => {

        const vapidKeys = webpush.generateVAPIDKeys();
        const _cog = await Cog([`vapid_pk`, `vapid_sk`], [vapidKeys.publicKey, vapidKeys.privateKey])
        VAPID.pk = _cog!.vapid_pk as string;
        VAPID.sk = _cog!.vapid_sk as string; 
        
        console.log(`🚀 Server is running on port ${process.env.APP_PORT}`);
    })
    .catch((err: any) => {
        console.error(`[ZormConnectionFailed]`, err)
    })

    if (process.env.NOTIFY_SOCKET) {
        require('sd-notify').ready();
    }

})