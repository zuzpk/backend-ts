import { dynamicObject } from "@/lib/types";
import { Request, Response } from "express";
import { Recover, RecoverUpdate, Signin, Signout, Signup, Verify } from "./app/user";
import zorm from "./lib/zorm";
import { Settings } from "./zorm/settings";
import { _ } from "./lib/core";

const Routes : dynamicObject = {
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        Test: async (req: Request, resp: Response) => {            

            const n = _(`hellocom`).camelCase().ucfirst()._
            // console.log(n)
            // const cog = [`oauth_after_signup`, `free_disk_bandwidth`, `allow_free_dbw`]
            // const query = zorm.find(Settings)
            // cog.forEach((v, i) => {
            //     if ( i == 0 )
            //         query.where({ okey: v })
            //     else
            //         query.or({ okey: v })
            // })

            // console.log(await query)

            resp.json({ kind: "pong" })
        },
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