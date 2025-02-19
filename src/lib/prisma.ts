import { PrismaClient } from "@prisma/client";
import de from "dotenv"

de.config()

const prisma = new PrismaClient()

export default prisma
