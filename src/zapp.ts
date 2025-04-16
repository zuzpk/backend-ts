import { withAccessLogger } from "@/lib/logger"
import { withZuzRequest } from "@/lib/zrequest"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import de from "dotenv"
import express, { Request, Response } from "express"
import http from "http"
import { WebSocketServer } from "ws"
import { API_KEY } from "./config"
import { _, headers } from "./lib/core"
import { handleSocketMessage } from "./lib/socket"
import { withZuzAuth } from "./lib/zauth"
import Routes from "./routes"

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

//TEST
app.get(`/api/wallet/v2/search`, (req: Request, resp: Response) => {
    resp.send({
        "code": 0,
        "message": "OK",
        "data": {
            "count": 1,
            "token": [
                {
                    "type": 2,
                    "top": 2,
                    "isOfficial": 1,
                    "name": "Tether USD",
                    "shortName": "USDT",
                    "id": "",
                    "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                    "balance": 117,
                    "balanceStr": "117",
                    "totalBalance": 117,
                    "totalBalanceStr": "117",
                    "trxCount": 10.000000,
                    "usdCount": 0E-15,
                    "cnyCount": 0E-23,
                    "price": 4.17587185,
                    "usdPrice": "0.999979593935565",
                    "cnyPrice": "7.29298095592377650262570",
                    "logoUrl": "https://static.tronscan.org/production/logo/usdtlogo.png",
                    "precision": 6,
                    "inMainChain": false,
                    "inSideChain": false,
                    "maincontractAddress": "",
                    "homePage": "https://tron.network/usdt",
                    "isInAssets": true,
                    "isShield": false,
                    "tokenDesc": "USDT is the official stablecoin issued by Tether on the TRON network.",
                    "issueTime": "2019-04-16 12:41:20",
                    "issueAddress": "THPvaUhoh2Qn2y9THCZML3H815hhFhn5YC",
                    "totalSupply": 66729830031,
                    "totalSupplyStr": "66729830031.173842",
                    "marketId": 0,
                    "recommandSortId": 0,
                    "tokenStatus": 0,
                    "transferStatus": true,
                    "national": "DM",
                    "defiType": 0,
                    "assetIdSet": null,
                    "matchField": 4,
                    "nrOfTokenHolders": 63658823,
                    "transferCount": 0
                }
            ],
            "word": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        }
    })
})


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

httpServer.listen(process.env.APP_PORT, () => console.log(`Watching you on port`, process.env.APP_PORT, `:)`) )