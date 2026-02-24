import "express";
import "ws";

declare global {
    namespace Express {
        interface Request {
            lang?: Record<string, string>;
        }
    }
}

export interface UserSession {
    loggedIn?: boolean;
    sid?: string;
    em?: string;
    uid?: number;
    sender?: string;
    expiry?: number;
}

declare module "express-session" {
    interface SessionData extends UserSession {}
}
declare module "ws" {
    interface WebSocket {
        session?: any;
        topics?: Set<string>;
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

export enum Events {
    TLog = "tlog",
    onPubSocket = "ON_PUB_SOCKET",
    onUserSocket = "ON_USER_SOCKET",
}

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

export interface ICacheSection<T> {
  getAll: () => T[];
  getById: (uniqueId: string) => T | null;
  update: (item: T) => void;
  add: (item: T) => void;
  addAll: (item: T[]) => void;
  remove: (uniqueId: string) => void;
  clear: () => void;
}