import { dynamicObject } from "@/lib/types";
import { Request, Response } from "express";
import { UserTemp } from "./app/user";

const Routes : dynamicObject = {
    Get: {
        Ping: (req: Request, resp: Response) => resp.json({ kind: "pong" }),
        Test: async (req: Request, resp: Response) => {
            UserTemp()
            // const u = await prisma.users.findFirst({
            //     where: {
            //         ID: 1
            //     }
            // })
            // console.log(`prisma data`, u)
            // .then(data => {
            //     console.log(`prismaData`, data)
            // })
            // .catch(err => {
            //     console.log(`prismaError`, err)
            // })
            resp.json({ kind: "pong" })
        },
    }
}

export default Routes