import { APP_URL, APP_VERSION, VAPID } from '@/config';
import crypto from 'crypto';
import de from "dotenv";
import { Request } from "express";
import Hashids from "hashids";
import nodemailer from 'nodemailer';
import webpush from "web-push";
import { Logger } from "./logger";
import { dynamicObject } from "./types";

de.config()
const encryptionAlgo = 'aes-256-cbc';
const hashids = new Hashids(process.env.ENCRYPTION_KEY, +process.env.HASHIDS_LENGTH!)


class withGlobals {
    
    _: any;

    constructor(value: any){
        this._ = value
    }

    isTypeof(v: any){
        return typeof this._ === typeof v
    }

    isFunction(){
        return typeof this._ === "function"
    }

    isArray(){
        return Array.isArray(this._)
    }

    isNull(){ 
        return this._ === null
    }

    isString(){
        return typeof this._ === "string"
    }

    isNumber(){
        return /^[+-]?\d+(\.\d+)?$/.test(this._ as any)
    }

    isObject(){
        return typeof this._ === "object" && !Array.isArray(this._) && this._ !== null
    }

    isEmpty(){
        if (Array.isArray(this._)) return this._.length === 0
        if (typeof this._ === "object" && this._ !== null) return Object.keys(this._).length === 0
        return this._ === "" || String(this._).length === 0
    }

    isEmail(){ 
        return typeof this._ === "string" && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this._)
    }

    isUrl(){
        return typeof this._ === "string" && /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(this._)
    }

    toLowerCase(){
        this._ = typeof this._ === "string" ? this._.toLowerCase() : String(this._).toLowerCase()
        return this
    }

    equals(v : any){ return this._ === v }

    ucfirst(){
        this._ = typeof this._ === "string" ? this._.charAt(0).toUpperCase() + this._.slice(1) : this._
        return this
    }

    formatString(v: string | number, ...vv: (string | number)[]){
        if (typeof this._ !== "string") this._ = "";
        const values = [v, ...vv];
        this._ = this._.replace(/%(\d+)/g, (inp: any, index: any) => values[Number(index)]?.toString() || `%${index}`)
        return this
    }

    camelCase(){
        this._ = typeof this._ === "string"
            ?   this._
                  .split(/[^a-zA-Z0-9]+/)
                  .map((word, index) =>
                      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join("")
            : this._
        return this
    }

    value(){ return this._ }

    valueOf(){ return this._ }

    toString(){ return String(this._) }

    [Symbol.toPrimitive](hint: string){
        if (hint === "number") return Number(this._);
        if (hint === "boolean") return Boolean(this._);
        return String(this._);
    }

}

export const _ = <T>(value: T) => new withGlobals(value);

export const toHash = ( str : number ) : string => hashids.encode(str)

export const fromHash = ( str : string ) : number => {
    try{
        const n = hashids.decode(str)
        return n.length >= 0 ? Number(n[0]) : 0
    }
    catch(e){
        return 0
    }
}

export const withSeperator = (str: string|number, ...more: (string|number)[]) : string => [str, ...more].join(process.env.SEPERATOR)

export const withoutSeperator = (str: string) : string[] => str.split(process.env.SEPERATOR!)

export const lang = (str: string, values: (string|number)[]) => str.replace(/%(\d+)/g, (_, index) => values[Number(index)].toString() || `%${index}`)

const safeB64Encode = (str: string): string => {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const safeB64Decode = (str: string): string => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return str //Buffer.from(str, 'base64').toString('utf8');
}

const encryptKey = (key?: string): Buffer => crypto.createHash('sha256').update(key || process.env.ENCRYPTION_KEY!).digest();

export const Encode = (value: string, key?: string): string => {
    if (!value) return ``;
    const ENCRYPT_KEY = encryptKey(key);
    const iv = crypto.createHash('md5').update(ENCRYPT_KEY).digest('hex').substring(0, 16);
    const cipher = crypto.createCipheriv(encryptionAlgo, Buffer.from(ENCRYPT_KEY), iv);
    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return safeB64Encode(encrypted);
}

export const Decode = (value: string, key?: string): string => {
    if (!value) return ``
    try {
        const ENCRYPT_KEY = encryptKey(key);
        const iv = crypto.createHash('md5').update(ENCRYPT_KEY).digest('hex').substring(0, 16);
        const decipher = crypto.createDecipheriv(encryptionAlgo, Buffer.from(ENCRYPT_KEY), iv);
        let decrypted = decipher.update(safeB64Decode(value), 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }catch(err : any){
        Logger.error(`[DecodeFailed]`, value, key || `APP_KEY`, err)
        return ``
    }
}

export const pluralize = (word: string, count : number) => `${word}${count !== 1 ? 's' : ''}`

export const headers = (req: Request, keys?: string[]) : dynamicObject => {

    const list = {}
    keys = keys || [];

    (keys.length > 0 ? keys : Object.keys(req.headers)).map(key => {
        if ( keys.length > 0 && req.headers[key] ){
            list[_(key).camelCase()._] = req.headers[key]
        }
        else{
            list[_(key).camelCase()._] = req.headers[key]
        }
    })

    return list

}

export const numberInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const uuid = (len: number) => toHash(numberInRange(11111111111, 999999999999))

export const sendMail = (from : string, to : string, subject : string, message : string) => {

    return new Promise((resolve, reject) => {

        const sender = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        sender.sendMail(
            {
                from, to, subject, html: message
            },
            (error, info) => {
                if ( error ){
                    reject(error)
                }
                else
                    resolve(info.response)
            }
        )

    })

}

export const urldecode = (str: string) => decodeURIComponent(str.replace(/\+/g, '%20'))

export const urlencode = (str: string) => encodeURIComponent(str)

export const sendPush = async (
    token: {
        endpoint: string,
        expirationTime: string | number | null,
        keys: {
            p256dh: string,
            auth: string
        }
    },
    meta: {
        title: string,
        message: string,
        icon?: string,
        badge?: string,
        url?: string,
        tag?: string,
    }
) => {

    const { title, message, icon, badge, url, tag } = meta

    webpush.setVapidDetails(
        url || APP_URL,
        VAPID.pk,
        VAPID.sk,
    );

    webpush.sendNotification(
        token,
        JSON.stringify({
            title,
            message,
            icon: icon || "/static/icons/welcome-192.png",
            badge: icon || "/static/icons/badge-72.png",
            data: { url: url || `/` },           // opens homepage when clicked
            tag: tag || `ZAPP_${APP_VERSION}`
        })
    )
    .then((resp) => {
        // console.log(`WebPushSendSent`, resp)
    })
    .catch((err) => {
        console.log(`WebPushSendFailed`, err)
    });
}