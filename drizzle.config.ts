import {defineConfig} from "drizzle-kit"
import { config } from "dotenv"

config();

export default defineConfig({
    schema:"./db/schema.ts",
    dialect: "postgresql",
    out: "./drizzle",
    dbCredentials: {url: process.env.DATABASE_URL!},
    verbose:true,
    strict:true
})