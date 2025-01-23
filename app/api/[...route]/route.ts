import  auth  from "./auth";
import {Hono} from "hono";
import { handle } from "hono/vercel";
import {zValidator} from "@hono/zod-validator"
import { LoginSchema } from "@/app/login/email_and_password/actions"
import {zodErrorHandler} from "@/lib/zodErrors"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from 'bcrypt'
import { createSession, deleteSession, generateSessionToken } from "@/lib/server/sessionactions/action"
import { SignUpSchema } from "@/app/signup/actions"
import { getUser, userExists } from "@/lib/server/useractions/action"
import { generateId } from "lucia"
import { sendWelcomeEmail } from "@/lib/mail"


const app = new Hono().basePath('/api')

app.route("/auth",auth)
export const POST = handle(app);