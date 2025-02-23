import zorm from "@/lib/zorm"
import { Settings } from "@/zorm/settings"
import de from "dotenv"
import multer from "multer"
import path from "path"
import { v4 as uuidv4 } from "uuid"

de.config()

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, `../../storage/cache`))
    },
    filename: function(req, file, cb){
        const ext = path.extname(file.originlname).toLowerCase()
        cb(null, `${Date.now()}-${uuidv4()}${ext}`)
    }
})

export const Cog = async (okey: string, defaultValue?: boolean | string | number | {}) => {
    const get = await zorm.find(Settings).select([`value`]).where({ okey })
    if ( get.hasRows ){
        return [`1`, `0`].includes(get.row.value) ? (get.row.value == `1`) : get.row.value
    }
    else if ( defaultValue ){
        await zorm.create(Settings).with({
            okey,
            value: `boolean` === typeof defaultValue ? String(defaultValue == true ? 1 : 0) : String(defaultValue)
        })
        return defaultValue
    }
}

const uploader = multer({ storage })