import { dynamicObject } from "@/lib/types";
import { Request, Response } from "express";
import { Recover, RecoverUpdate, Signin, Signout, Signup, Verify } from "./app/user";

const Routes : dynamicObject = {
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        // Test: async (req: Request, resp: Response) => {            

        //     console.log(await zorm.find(Users))

        //     resp.json({ kind: "pong" })
        // },
    },
    Post: {
        U: {
            /** Authenticated routes */
            private: {
                Signout
            },
            Signup, Signin,
            Recover, RecoverUpdate, Verify
        }
    }
}

export default Routes