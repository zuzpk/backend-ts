import { Users } from "@/zorm/users";
import "express";

declare global {
    namespace Express {
        interface Request {
        lang?: Record<string, string>;
        user?: User | null,
        sender?: Users | null,
        sessionID?: number
        }
    }
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
    cc: string | undefined,
    status: UserStatus
}