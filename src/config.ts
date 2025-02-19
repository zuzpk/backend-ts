export const APP_PORT : number = 3001;
export const API_KEY : string = `@`;
export const APP_VERSION : string = `2.1.1`;
export const APP_NAME : string = "ZApp";
export const APP_URL : string  = "https://cloud.zuz.com.pk/";
export const API_URL : string  = "https://cloud.zuz.com.pk/@/";
export const ADMIN_EMAIL : string = `hello@zuz.com.pk`;
export const SESS_KEYS : string[] = ['ui','ut','fp','si'];
export const SESS_PREFIX : string = `__`;
export const SESS_DURATION : number = 15 * (24 * 60 * 60 * 1000) //15 days
export const DEFAULT_LANG = "en"; // for english

export const ALLOWED_ORIGINS : string[] = [
    `http://localhost:3000`,
    APP_URL
]