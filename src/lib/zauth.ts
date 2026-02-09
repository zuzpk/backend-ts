import { removeAuthCookies, youser } from "@/app/user"
import { APP_NAME, SESS_KEYS, SESS_PREFIX } from "@/config"
import { fromHash, headers, withSeperator } from "@/lib/core"
import zorm, { Users, UsersSess } from "@/zorm"
import { _ } from "@zuzjs/core"
import { NextFunction, Request, Response } from "express"

export const withZuzAuth = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {

    if ( !req.session.loggedIn ){
      return res.send({
        error: `oauth`,
        stamp: Date.now(),
        message: req.lang!.unauthorized
      })
    } 

    next()

}