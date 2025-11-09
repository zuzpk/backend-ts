import { withAccessLogger } from "@/lib/logger"
import { withZuzRequest } from "@/lib/zrequest"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import de from "dotenv"
import express, { Request, Response } from "express"
import http from "http"
import webpush from "web-push"
import { WebSocketServer } from "ws"
import { Cog } from "./app"
import { API_KEY, VAPID } from "./config"
import { _, headers } from "./lib/core"
import { handleSocketMessage } from "./lib/socket"
import { withZuzAuth } from "./lib/zauth"
import Routes from "./routes"
import zorm from "./zorm"

de.config()

const app = express();
app.disable(`x-powered-by`);
app.use(
    cors(), 
    cookieParser(process.env.ENCRYPTION_KEY), 
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    withAccessLogger,
    withZuzRequest
)

const httpServer = http.createServer(app)
const wss = new WebSocketServer({ server: httpServer })

const handleAPI = (requestMethod: "Post" | "Get", req: Request, resp: Response) => {

    const [ key, method, action, ...rest ] = req.url.split(`/`).filter(Boolean)
    
    if ( key == API_KEY && method ){
        try{

            const apiRoutes = Routes[requestMethod]
            const METHOD = _(method).camelCase().ucfirst()._
            const ACTION = action ? _(action).camelCase().ucfirst()._ : null

            // console.log(METHOD, ACTION)

            if ( METHOD in apiRoutes ){

                if ( _(apiRoutes[METHOD]).isFunction() ){
                    return apiRoutes[METHOD](req, resp)    
                }
                
                else if( 
                    ACTION &&
                    _(apiRoutes[METHOD]).isObject() && 
                    apiRoutes[METHOD].private &&
                    ACTION in apiRoutes[METHOD].private
                ){
                    return withZuzAuth(req, resp, () => apiRoutes[METHOD].private[ACTION](req, resp))
                }
                else if( 
                    ACTION &&
                    _(apiRoutes[METHOD]).isObject() && 
                    ACTION in apiRoutes[METHOD]
                ){
                    return apiRoutes[METHOD][ACTION](req, resp)
                }

                return resp.status(403).send({
                    error: `403`,
                    message: req.lang!.apiWrongAction
                })
                
            }

            return resp.status(403).send({
                error: `403`,
                message: req.lang!.apiWrongMethod
            })

        }catch(e){
            console.log(e)
            return resp.status(403).send({
                error: `403`,
                message: req.lang!.youAreLost
            })

        }
    }

    return resp.status(404).send({
        error: `404`,
        message: req.lang!.youAreLost
    })
}

app.get(`*`, (req: Request, resp: Response) => handleAPI("Get", req, resp))
app.post(`*`, (req: Request, resp: Response) => handleAPI("Post", req, resp))

wss.on(`connection`, (ws, req) => {
    const { origin, cfConnectingIp, cfIpcountry } = headers(req)
    console.log(`[${cfIpcountry}:${cfConnectingIp}] Socket Client Connected`)
    ws.on(`message`, ms => handleSocketMessage(ms, ws, origin))
    ws.on(`close`, () => {
        console.log(`[${cfIpcountry}:${cfConnectingIp}] Socket Client Disconnected`)
    })
})

// 
httpServer.listen(process.env.APP_PORT, async () => {
    
    zorm.connect().then(async () => {
        const vapidKeys = webpush.generateVAPIDKeys();
        VAPID.pk = await Cog(`vapid_pk`, vapidKeys.publicKey)
        VAPID.sk = await Cog(`vapid_sk`, vapidKeys.privateKey)        
    })
    
    console.log(`Watching you on port`, process.env.APP_PORT, `:)`) 

})