import { dynamicObject } from "@/lib/types";
import { Request, Response } from "express";
import { Recover, RecoverUpdate, SaveWebPushToken, Signin, Signout, Signup, Verify } from "./app/user";
import zorm, { Settings } from "./zorm";

const Routes : dynamicObject = {
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        Test: async (req: Request, resp: Response) => {

            zorm.find(Settings).then(r => console.log(r)).catch(d => console.log(d))

            // const team = zorm
            //     .find(Users)
            //     .innerJoin(`fkRoles`, `r`, `r.bid = ${1}`)
            //     // .where({ `r.bid`: 2})
            // console.log(team._getRawQuery())
            // console.log(zorm.find(Users).expression(q => q
            //         .field(`joined`)
            //         .substring(`joined`, "@@", 1)
            //         .append(` / 1000`)
            //         .fromUnixTime()
            //         .date()
            //         .equals(`2025-07-06`) 
            // )._getRawQuery())
            // console.log(
            //     zorm.find(Users)
            //         .distinct()
            //         .expression(q => q
            //             .field(`owner`)
            //             .equals(111) //owner id
            //             .or()
            //             .exists(r => {
            //                 return r
            //                     .select(`1`)
            //                     .from(`roles`, `r`)
            //                     .where({
            //                         'r.bid': `b1`,
            //                         'r.uid': `r1`, //user id
            //                         'r.tid': `t1` //task id
            //                     })
            //             })
            //             .or()
            //             .exists(t => t 
            //                 .select(`1`)
            //                 .from(`tasks`, `t`)
            //                 .where({
            //                     't.bid': `b1`,
            //                     't.aid': 5 //task id
            //                 })
            //             )
            //     )
            //     ._getRawQuery())
            // console.log(zorm.find(Users).whereExpr(q => q.fromUnixTime()))
            // withPost(
            //     `https://ipnpb.sandbox.paypal.com/cgi-bin/webscr`,
            //     new URLSearchParams({ cmd: `_notify-validate`, mc_fee: `3.9` }).toString(),
            //     10,
            //     true,
            //     { 'Content-Type' : `application/x-www-form-urlencoded` }
            // )
            // .then(data => {
            //     console.log(`Ppl`, data)
            // })
            // .catch(err => {
            //     console.log(err)
            // })

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
            Recover, RecoverUpdate, Verify,
            PushOauth: SaveWebPushToken
        }
    }
}

export default Routes