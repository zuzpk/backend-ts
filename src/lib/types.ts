import { RowDataPacket } from "mysql2/promise"
import { Request, Response } from "express"

export type dynamicObject = { 
    [x: string] : any 
}

export type stringObject = { 
    [x: string] : string
}

export type DBResult = {
    hasRows: boolean,
    count: number,
    row: RowDataPacket | null,
    rows: RowDataPacket[]
}

export interface MulterRequest extends Request {
    file: any
}

declare global {
    interface Object { 
        isTypeof( v: any ): boolean
        equals( v: any ): boolean
        isNull(): boolean
        isString(): boolean
        isFunction(): boolean
        isNumber(): boolean
        isObject(): boolean
        isArray(): boolean
        isEmpty(): boolean
        isNotEmpty( v: any ): boolean
        toLowerCase(): string
    }
    
    interface String {
        isUrl( v: any ): boolean
        isIPv4( v: any ): boolean
        isEmail( v: any ): boolean;
        ucfirst(): string;
        camelCase(): string;
    }
}

export {}