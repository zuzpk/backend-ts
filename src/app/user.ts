import { ADMIN_EMAIL, APP_NAME, APP_URL, SESS_COOKIE_SETTING, SESS_COOKIE_SETTING_HTTP, SESS_DURATION, SESS_KEYS, SESS_PREFIX } from "@/config"
import { Decode, Encode, fromHash, headers, Logger, sendMail, sendPush, toHash, withoutSeperator, withSeperator } from "@/lib"
import { User, UserStatus, UserType } from "@/lib/types"
import zorm, { PushTokens, Users, UsersSess } from "@/zorm"
import { _, dynamic, MD5, numberInRange } from "@zuzjs/core"
import de from "dotenv"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { Cog } from "."

de.config()

export const uname = (u: Users) : string => u.fullname == `none` ? u.fullname.split(process.env.SEPERATOR!)[0]! : u.fullname || `Guest`

export const youser = async ( u: Users, cc?: string ) : Promise<User> => {
    
    const [ country, stamp ] = withoutSeperator(u.signin)

    return {
        ID: toHash(u.ID),
        utp: u.utype as unknown as UserType,
        name: uname(u),
        email: u.email.trim(),
        cc: cc || country,
        status: u.status as UserStatus
    }

}

export const Signin = async (req: Request, resp: Response) => {

    const { userAgent, cfIpcountry : country } = headers(req)
    
    const { em, psw } = req.body

    if ( !em || _(em).isEmpty() || !psw || _(psw).isEmpty() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.emailPassRequired
        })
    }

    if ( !_(em).isEmail() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.invalidEmail
        })
    }

    const user = await zorm.find(Users).where({ email: em.trim().toLowerCase() })
    if ( !user.hasRows ){
        return resp.send({
            error: `invalidEmail`,
            message: req.lang!.unknownEmail
        })
    }

    const u = user.row!

    if ( u.password != Encode(psw) ){   
        return resp.send({
            error : 'invalidPassword',
            message : req.lang!.wrongPassword
        })
    }
    
    if ( u.status == -1 ){
        return resp.send({
            error: `accountBanned`,
            message: _(req.lang!.youAreBanned).formatString( APP_NAME )
        })
    }
    
    const geo = withSeperator( country, Date.now() )

    return zorm.update(Users)
        .with({ signin: geo })
        .where({ ID: u.ID })
        .then(async (result) => {
            const { ID, email, password } = result.record as Users
            const session = await zorm.create(UsersSess).with({
                uid: ID,
                token: Encode(withSeperator(ID, email, password, Date.now())),
                expiry: String(Date.now() + SESS_COOKIE_SETTING.maxAge!),
                uinfo: geo
            })
            const _you = await youser(result.record as Users, country)
            resp.cookie(SESS_KEYS.ID, toHash(result.record!.ID), SESS_COOKIE_SETTING)
            resp.cookie(SESS_PREFIX + SESS_KEYS.ID, toHash(result.record!.ID), SESS_COOKIE_SETTING_HTTP)
            resp.cookie(SESS_PREFIX + SESS_KEYS.Data, _you, SESS_COOKIE_SETTING_HTTP)
            resp.cookie(SESS_PREFIX + SESS_KEYS.Fingerprint, toHash(result.record!.ID), SESS_COOKIE_SETTING_HTTP)
            resp.cookie(SESS_PREFIX + SESS_KEYS.Session, toHash(session.id!), SESS_COOKIE_SETTING_HTTP)
            resp.cookie(SESS_PREFIX + SESS_KEYS.Token, jwt.sign(
                {
                    em: result.record!.email.trim(),
                    cc: country,
                    ts: Date.now()
                }, 
                process.env.ENCRYPTION_KEY!,
                {
                    audience: APP_NAME.replace(/\s+/g, `-`).toLowerCase(),
                    issuer: APP_NAME,
                    expiresIn: Date.now() + SESS_DURATION
                }
            ), SESS_COOKIE_SETTING_HTTP)

            return resp.send({
                kind: `oauth`,
                u: _you
            })

        })
        .catch((err) => {
            Logger.error(`[signinErrored]`, err)
            return resp.send({
                error: `oauth`,
                message: req.lang!.signinFailed
            })
        })

}

export const Signup = async (req: Request, resp: Response) => {

    const { userAgent, cfIpcountry : country } = headers(req)
    const { nm, em, psw, rpsw } = req.body

    if ( !em || _(em).isEmpty() || !psw || _(psw).isEmpty() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.emailPassRequired
        })
    }

    if ( !_(em).isEmail() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.invalidEmail
        })
    }

    const [ name, tld ] = em.toLowerCase().trim().split(`@`)

    const checkTLD = await fetch(`https://${tld}`)

    if ( checkTLD.status != 200 ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.invalidEmailDomain
        })
    }

    const email = `${name}@${tld}`.toLowerCase().trim()

    const check = await zorm.find(Users).where({ email })
    if ( check.hasRows ){
        return resp.send({
            error : 'EmailAlreadyTaken',
            message : req.lang!.emailExists
        })
    }
    
    //New
    const geo = withSeperator( country, Date.now() )
    const ucode = numberInRange(111111, 999999)
    const token = toHash(ucode);
    const password = Encode(psw)

    let reff = 0
    if ( `__urf` in req.body ){
        reff = fromHash(req.body.__urf) || 0
    }

    const user = await zorm
        .create(Users)
        .with({
            token, 
            ucode: String(ucode),
            email: em,
            password,
            fullname: withSeperator((nm || name).trim().split(/\s+/g)),
            reff,
            joined: geo,
            signin: geo
        })

    if ( user.created ){

        const otpToken = Encode(withSeperator(`signup`, user.id!, ucode, Date.now()))
        const verifyToken = Encode(withSeperator(`signup`, user.id!, token, Date.now()))

        return sendMail(
            `${APP_NAME} <${ADMIN_EMAIL}>`, 
            email, 
            _(req.lang!.emailSignupSubject).formatString(ucode)._,
            _(req.lang!.emailSignupMessage).formatString(APP_NAME, ucode, `${APP_URL}u/verify/${verifyToken}`, em)._
        )
        .then(async r => {

            let _resp : dynamic = {
                kind: `accountCreated`,
                token: otpToken,
                email,
                message: req.lang!.accountCreated
            }
            const oauth = await Cog(`oauth_after_signup`, 1)
            if ( oauth ){
                const { ID, email, password } = user.record!
                const session = await zorm.create(UsersSess).with({
                    uid: ID,
                    token: Encode(withSeperator(ID, email, password, Date.now())),
                    expiry: String(Date.now() + SESS_COOKIE_SETTING.maxAge!),
                    uinfo: geo
                })
                const _you = await youser(user!.record as Users, country)
                _resp.u = _you
                resp.cookie(SESS_KEYS.ID, toHash(user.record!.ID), SESS_COOKIE_SETTING)
                resp.cookie(SESS_PREFIX + SESS_KEYS.ID, toHash(user.record!.ID), SESS_COOKIE_SETTING_HTTP)
                resp.cookie(SESS_PREFIX + SESS_KEYS.Data, _you, SESS_COOKIE_SETTING_HTTP)
                resp.cookie(SESS_PREFIX + SESS_KEYS.Fingerprint, toHash(user.record!.ID), SESS_COOKIE_SETTING_HTTP)
                resp.cookie(SESS_PREFIX + SESS_KEYS.Session, toHash(session.id!), SESS_COOKIE_SETTING_HTTP)
                resp.cookie(SESS_PREFIX + SESS_KEYS.Token, jwt.sign(
                    {
                        em: user.record!.email.trim(),
                        cc: country,
                        ts: Date.now()
                    }, 
                    process.env.ENCRYPTION_KEY!,
                    {
                        audience: APP_NAME.replace(/\s+/g, `-`).toLowerCase(),
                        issuer: APP_NAME,
                        expiresIn: Date.now() + SESS_DURATION
                    }
                ), SESS_COOKIE_SETTING_HTTP)
            }
            return resp.send(_resp)
        })
        .catch(err => {
            Logger.error(`[signupError]`, err)
            return resp.send({
                error: `accountNotCreated`,
                message: req.lang!.accountNotCreated
            })
        })

    }

    Logger.error(`[signupErrored]`, user.error?.message)
    return resp.send({
        error: `accountNotCreated`,
        message: user.error?.message || req.lang!.accountNotCreated
    })

}

export const Recover = async (req: Request, resp: Response) => {

    const { userAgent, cfIpcountry : country } = headers(req)
    
    const { em } = req.body

    if ( !em || _(em).isEmpty() || !_(em).isEmail() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.invalidEmail
        })
    }

    const user = await zorm.find(Users).where({ email: em.toLowerCase().trim() })

    if ( !user.hasRows ){
        return resp.send({
            error: `invalidEmail`,
            message: req.lang!.unknownEmail
        })
    }

    const u = user.row!

    if ( u.status == -1 ){
        return resp.send({
            error: `accountBanned`,
            message: _(req.lang!.youAreBanned).formatString( APP_NAME )
        })
    }

    const ucode = numberInRange(111111, 999999)
    const token = toHash(ucode);

    const you = await zorm.update(Users)
        .with({ token, ucode: String(ucode) })
        .where({ ID: u.ID })

    if ( !you.updated ){
        return resp.send({
            error: `oauth`,
            message: req.lang!.recoveryFailed
        })
    }


    const otpToken = Encode(withSeperator(`recover`, u.ID, ucode, Date.now()))
    const verifyToken = Encode(withSeperator(`recover`, u.ID, token, Date.now()))

    return sendMail(
        `${APP_NAME} <${ADMIN_EMAIL}>`, 
        u.email, 
        _(req.lang!.emailRecoverSubject).formatString(ucode)._,
        _(req.lang!.emailRecoverMessage).formatString(APP_NAME, ucode, `${APP_URL}u/verify/${verifyToken}`, u.email)._
    )
    .then(async r => {
        return resp.send({
            kind: `verificationCodeSent`,
            token: otpToken,
            email: u.email,
            message: req.lang!.recoveryEmailSent
        })
    })
    .catch(err => {
        Logger.error(`[signupError]`, err)
        return resp.send({
            error: `recoveryNotSent`,
            message: req.lang!.recoverEmailFailed
        })
    })
}

export const RecoverUpdate = async (req: Request, resp: Response) => {
    
    const { token, repassw } = req.body
    const [ mode, uid, ucode, utoken ] = withoutSeperator( Decode( token ) )

    if ( !uid || !ucode || !utoken ){
        return resp.send({
            error: `recoveryFailed`,
            message: req.lang!.securityTokenInvalid
        })
    }
    
    const user = await zorm.find(Users).where({ ID: uid, token: utoken, ucode })

    if ( !user.hasRows ){
        return resp.send({
            error: `recoveryFailed`,
            message: req.lang!.securityTokenInvalid
        })
    }

    const code = numberInRange(111111, 999999)
    const voken = toHash(code);

    const you = await zorm.update(Users)
        .with({
            token: voken,
            ucode: String(code),
            password: Encode(repassw)
        })
        .where({ ID: uid })

    if ( you.updated ){
        return resp.send({
            kind: `recoverySuccess`,
            name: user.row!.fullname,
            message: req.lang!.passwordUpdated
        })
    }

    return resp.send({
        error: `recoveryFailed`,
        message: req.lang!.passwordNotUpdated
    })

}

export const Verify = async (req: Request, resp: Response) => {

    const { token, otp } = req.body

    if( !token || _(token).isEmpty() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.verifyTokenRequired
        })
    }
    
    const [ mode, uid, ucode, expiry ] = withoutSeperator( Decode( token ) )

    if ( !uid || !ucode || !mode ){
        return resp.send({
            error: `verificationFailed`,
            message: req.lang!.verifyTokenInvalid
        })
    }

    if ( otp ){

        if ( ucode != otp ){
            return resp.send({
                error: `verificationFailed`,
                message: req.lang!.verifyTokenInvalid
            })
        }

    }

    const user = await zorm.find(Users).where({ ID: Number(uid), ucode, status: `!-1` })

    if ( user.hasRows ){
        
        const u = user.row!

        if ( _(mode).equals(`signup`) && u.status == 1 ){
            return resp.send({
                error: `verificationFailed`,
                code: 101,
                message: req.lang!.alreadyVerified,
            })
        }

        const ucode = numberInRange(111111, 999999)
        const token = toHash(ucode);
              
        return zorm.update(Users)
            .with({
                token, ucode: String(ucode), status: u.status == 0 ? 1 : u.status
            })
            .where({
                ID: uid
            })
            .then(save => {
                return resp.send({
                    kind: `verificationSuccess`,
                    name: withoutSeperator( u.fullname )[0],
                    token: _(mode).equals(`recover`) ? Encode( withSeperator( `update`, u.ID, ucode, token, Date.now() ) ) : `-`,
                    message: req.lang!.verifySuccess
                })
            })
            .catch(err => {
                Logger.error(`[verifyError]`, err)
                return resp.send({
                    error: `verificationFailed`,
                    code: 102,
                    message: req.lang!.verifyFailed
                })
            })
    }

    Logger.error(`[verifyTokenError]`)
    return resp.send({
        error: `verificationFailed`,
        code: 102,
        message: req.lang!.verifyTokenInvalid
    })

}

export const removeAuthCookies = (resp: Response) : Response => {

    const _n = { ...SESS_COOKIE_SETTING }
    const _v = { ...SESS_COOKIE_SETTING_HTTP }
    delete _n.maxAge
    delete _v.maxAge

    resp.clearCookie(SESS_KEYS.ID, _n)
    Object.keys(SESS_KEYS).forEach((k) => {
        resp.clearCookie(SESS_PREFIX + SESS_KEYS[k], _v)
    })

    return resp
}

export const Signout = async (req: Request, resp: Response) => {

    const session = await zorm.delete(UsersSess).where({ ID: req.sessionID! })

    if ( session.deleted ){

        const _n = { ...SESS_COOKIE_SETTING }
        const _v = { ...SESS_COOKIE_SETTING_HTTP }
        delete _n.maxAge
        delete _v.maxAge

        resp.clearCookie(SESS_KEYS.ID, _n)
        Object.keys(SESS_KEYS).forEach((k) => {
            resp.clearCookie(SESS_PREFIX + SESS_KEYS[k], _v)
        })

        return resp.send({
            kind: `signoutSuccess`,
            message: req.lang!.signoutSuccess
        })

    }

    return resp.send({
        error: `signoutFailed`,
        message: req.lang!.signoutFailed
    })

}



export const RemoveWebPushToken = async (endpoint: string) => {

    await zorm.delete(PushTokens)
        .where({ endpoint })
        .catch((err: any) => console.log(`[RemoveWebPushToken Failed]`, err))
}

export const SaveWebPushToken = async (req: Request, resp: Response) : Promise<any> => {

    const { userAgent, cfIpcountry : country } = headers(req)
    const { token, em } = req.body

    if ( !em || _(em).isEmpty() || !_(em).isEmail() ){
        return resp.send({
            error: `invalidData`,
            message: req.lang!.invalidEmail
        })
    }

    else{

        const u = await zorm.find(Users).where({ email: em.trim() })
        let uid = 0
        let uname = ``
        if ( u.hasRows ){
            uname = u.row.fullname
            uid = u.row.ID;
        }
        else{

            const geo = withSeperator( country, Date.now() )
            const ucode = numberInRange(111111, 999999)
            const utoken = toHash(ucode);
            const password = Encode(`p12345678`)

            let reff = 0
            if ( `__urf` in req.body ){
                reff = fromHash(req.body.__urf) || 0
            }

            const [ name, tld ] = em.toLowerCase().trim().split(`@`)
            uname = name
            const user = await zorm
                .create(Users)
                .with({
                    token: utoken, 
                    ucode: String(ucode),
                    email: em,
                    password,
                    fullname: withSeperator(name.trim()),
                    reff,
                    joined: geo,
                    signin: geo
                })

            if ( user.created ){
                uid = user.id!
            }
        }

        if ( uid == 0 ){
            return resp.send({
                error: `emailFailed`,
                message: `We are unable to register your email. Try again!`
            })
        }

        const hash = MD5(JSON.stringify(token))
        const exist = await zorm.find(PushTokens)
        .where({ uid, hash })
        
        if ( !exist.hasRows ){

            await zorm.create(PushTokens)
            .with({
                uid,
                hash,
                endpoint: token.endpoint,
                p256dh: token.keys.p256dh,
                auth: token.keys.auth,
                stamp: String(Date.now()),
                status: 1
            })

            // console.log(`[WebPushSaveResult]`, save)
        }

        sendPush(
            token,
            {
                title: _(req.lang!.webPushWelcomeTitle).formatString(uname, APP_NAME)._,
                message: req.lang!.webPushWelcomeMessage!,
            }
        )

        resp.send({
            kind: `pushSubscribed`,
            message: `Good Job! That was easy :)`
        })

    }
}