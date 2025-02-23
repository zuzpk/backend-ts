import { Settings } from "@/zorm/settings";
import { Users } from "@/zorm/users";
import { UsersSess } from "@/zorm/users_sess";
import Zorm from "@zuzjs/orm";
import de from "dotenv"

de.config()

const zorm = Zorm.get(process.env.DATABASE_URL!);
zorm.connect([Users, UsersSess, Settings])

export default zorm