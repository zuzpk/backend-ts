// import { Request, Response } from "express"
// import { dynamicObject } from "@/lib/types"
// import { fromHash, headers } from "@/lib/core"
// import { APP_NAME, SESS_KEYS, SESS_PREFIX } from "@/config"
// import DB from "@/lib/prisma"

import prisma from "@/lib/prisma"

export const UserTemp = () => {
    console.log(prisma)
}

// export enum UserType {
//     Guest = 0,
//     User = 1,
//     Admin = 9
// }

// export type User = {
//     ID: string | number,
//     utp: UserType,
//     name: string,
//     email: string,
//     status: string
// }

// export const uname = (u: dynamicObject) : string => u.name == `none` ? u.name.split(`@`)[0] : u.name || `Guest`

// export const youser = async ( u: dynamicObject ) : Promise<User> => {
    
//     return {
//         ID: 1,
//         utp: u.type == `admin` ? UserType.Admin : UserType.User,
//         name: uname(u),
//         email: u.email.trim(),
//         status: u.status
//     }

// }

// export const withSession = async (req: Request, resp: Response, raw = true): Promise<dynamicObject> => {

//     return new Promise((resolve, reject) => {

//         const { userAgent, cfIpcountry } = headers(req);
//         const country = cfIpcountry || `unknown`
//         const payload = req.body

//         try {

//             const _auth : string[] = []
//             for ( const c in payload ){
//                 if ( SESS_KEYS.includes( c.replace(SESS_PREFIX, ``)) ){
//                     _auth.push(c)
//                 }
//             }

//             if ( _auth.length != SESS_KEYS.length ){
//                 return reject({
//                     error: `oauth`,
//                     message: req.lang!.unauthorized
//                 })
//             }

//             const _uid = payload[`${SESS_PREFIX}ui`]
//             const _sid = payload[`${SESS_PREFIX}si`]

//             const uid = fromHash(_uid)
//             const sid = fromHash(_sid)

//             if ( !_uid || !_sid || !uid || !sid ){
//                 return reject({
//                     error: `oauth`,
//                     message: req.lang!.unauthorized
//                 })
//             }

//             Promise.all([
//                 DB.SELECT("SELECT uid FROM users_sess WHERE ID=? AND expiry>? AND status=?", [sid, Date.now(), 1]),
//                 DB.SELECT("SELECT * FROM users WHERE ID=?", [uid]),            
//             ])
//             .then(([sess, user]) => {

//                 const u = user.row!

//                 if ( uid != sess.row!.uid ){
//                     return reject({
//                         error: `oauth`,
//                         message: `Your session is expired. Sign in again.`
//                     })
//                 }

//                 if ( u.status == -1 ){
//                     return reject({
//                         error: `oauth`,
//                         message: `You are banned from ${APP_NAME}.`
//                     })
//                 }

//                 // Update(u.ID, {
//                 //     signin: `${country}@@${Date.now()}`
//                 // })
//                 // .then(async x => {
//                 //     if ( raw )
//                 //         resolve(u)
//                 //     else
//                 //         resolve({
//                 //             kind: `oauth`,
//                 //             u: await youser(u)
//                 //         })
//                 // })
//                 // .catch(err => {
//                 //     console.log(`[withUserSessError2]`, err)
//                 //     reject({
//                 //         error: `oauth`,
//                 //         message: `your session token is invalid. signin again.`
//                 //     })
//                 // })

//             })
//             .catch(err => {
//                 console.log(`[withUserSessError]`, err)
//                 reject({
//                     error: `oauth`,
//                     message: `Session token is invalid.`
//                 })
//             })

//         }
//         catch(e){
//             reject({
//                 error: `serverBusy`,
//                 message: req.lang!.serverBusy
//             })
//         }


//     })

// }