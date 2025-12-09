import { Recover, RecoverUpdate, SaveWebPushToken, Signin, Signout, Signup, Verify } from "@/app/user";
import { dynamic } from "@zuzjs/core";
import { Request, Response } from "express";

const Routes : dynamic = {
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
   
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