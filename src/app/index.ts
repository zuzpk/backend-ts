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

const uploader = multer({ storage })