import { Recover, RecoverUpdate, SaveWebPushToken, Signin, Signout, Signup, Verify } from "@/app/user";
import { dynamic } from "@zuzjs/core";
import { Request, Response } from "express";

const Routes : dynamic = {
    WebSocket: {
        private: ['/wss'],
        public: []
    },
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        Auth: (req: Request, resp: Response) => {
            if ( req.session.loggedIn ){
                
                const _resp = { 
                    kind: "authSuccess",
                    id: req.session.sender,
                    sets: [] as dynamic[]
                };

                resp.send(_resp)
                    
            }
            else{
                resp.send({ error: `oauth` })
            }
        },
    },
    Post: {
        U: {
            /** Authenticated routes */
            private: {
                Signout
            },
            Signup, Signin,
            Recover, RecoverUpdate, Verify,
            PushOauth: SaveWebPushToken
        }
    }
}

export default Routes