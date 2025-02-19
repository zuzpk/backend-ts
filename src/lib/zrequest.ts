import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs"
import { DEFAULT_LANG } from "../config";

declare module "express" {
    interface Request {
      lang?: Record<string, string>;
    }
}

// Load all language files once at startup
const LANGS_DIR = path.join(__dirname, "..", "app", "langs");
const languages: Record<string, Record<string, string>> = {};

// Preload languages into memory
fs.readdirSync(LANGS_DIR).forEach((file) => {
  if (file.endsWith(".js")) {
    const langCode = path.basename(file, path.extname(file));
    languages[langCode] = require(path.join(LANGS_DIR, file)).default;
  }
});

export const withZuzRequest = (req: Request, res: Response, next: NextFunction) => {

    const langCode = req.signedCookies.lng || DEFAULT_LANG;
    req.lang = languages[langCode] || languages[DEFAULT_LANG];

    


    next()
        
}