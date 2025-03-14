import { Users } from "@/zorm/users";
import { Request, Response } from "express"

declare module "express" {
    interface Request {
      lang?: Record<string, string>;
      user?: User | null,
      rawUser?: Users | null,
      sessionID?: number
    }
}

export type dynamicObject = { 
    [x: string] : any 
}

export type stringObject = { 
    [x: string] : string
}

export interface MulterRequest extends Request {
    file: any
}

export type UserCookies = {
    ID: string,
    Token: string,
    Data: string,
    Fingerprint: string,
    Session: string,
};

export enum UserType {
    Guest = 0,
    User = 1,
    Admin = 2
}

export enum UserStatus {
    InActive = 0,
    Active = 1,
    Banned = -1,
}

export type User = {
    ID: string,
    oid?: number,
    utp: UserType,
    name: string,
    email: string,
    cc: string,
    status: UserStatus
}