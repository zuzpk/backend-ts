import { dynamicObject } from "@zuzjs/orm";
import { UserCookies } from "./lib/types";
import { CookieOptions } from "express";

export const APP_PORT : number = 3001;
export const API_KEY : string = `@`;
export const APP_VERSION : string = `2.1.1`;
export const APP_NAME : string = "ZApp";
export const APP_URL : string  = "https://cloud.zuz.com.pk/";
export const API_URL : string  = "https://cloud.zuz.com.pk/@/";
export const ADMIN_EMAIL : string = `hello@zuz.com.pk`;
export const SESS_KEYS : UserCookies = {
    ID: `ui`,
    Token: `ut`,
    Data: `ud`,
    Fingerprint: `fp`,
    Session: `si`
};
export const SESS_PREFIX : string = `__`;
export const SESS_DURATION : number = 15 //15 days

export const _COOKIE_SETTING : CookieOptions = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: (24 * 60 * 60 * 1000) * SESS_DURATION
}
export const SESS_COOKIE_SETTING : CookieOptions = {
    httpOnly: false,
    ..._COOKIE_SETTING
}
export const SESS_COOKIE_SETTING_HTTP : CookieOptions = {
    httpOnly: true,
    ..._COOKIE_SETTING
}
export const DEFAULT_LANG = "en"; // for english



export const ALLOWED_ORIGINS : string[] = [
    `http://localhost:3000`,
    APP_URL
]