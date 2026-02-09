import { Recover, RecoverUpdate, SaveWebPushToken, Signin, Signout, Signup, Verify } from "@/app/user";
import { dynamic } from "@zuzjs/core";
import { Request, Response } from "express";

const Routes : dynamic = {
    WebSocket: {
        private: ['/ws'],
        public: []
    },
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        Auth: (req: Request, resp: Response) => resp.json(
            req.session.loggedIn ? 
                { 
                    kind: "authSuccess",
                    user: {
                        ID: 1,
                        nm: req.session.sender
                    },
                } 
                : { 
                    error: `oauth` 
                }
        ),
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