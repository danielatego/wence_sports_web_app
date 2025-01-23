import { Hono } from "hono"
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


const app = new Hono()
.post(
    "/emaillogin",zValidator("json",LoginSchema,(result,c) =>{
        if(!result.success){
            const errorMessages = zodErrorHandler(result.error);
            return c.json({...errorMessages})
        }
    }),
    async (c) =>{
        const values = c.req.valid("json");
        const [existingUser] = await db.select().from(users).where(eq(users.email,values.email));
        if (!existingUser) {
            return c.json({ error: true, msg: "User not found" }, 404);
        }
        if (!existingUser || existingUser.isDeleted) {
        return c.json({ error: true, msg: "User does not exist" }, 400);
        }
        if (existingUser.isBlocked) {
        return c.json({ error: true, msg: "User is blocked" }, 400);
        }
        if (!existingUser.hashedpassword) {
        return c.json({ error: true, msg: "Invalid credentials" }, 400);
        }
        const validPassword = await bcrypt.compare(
            values.password,
            existingUser.hashedpassword
        )
        if(!validPassword){
            return c.json({error:true,msg:"Incorrect credentials"},401)
        }
        await deleteSession(existingUser.id);
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken,existingUser.id);
        const expires = new Date(Date.now() + 60*60*24*30 * 1000).toUTCString(); 
        const cookie = `sessionId=${session.id}; HttpOnly; Secure; Path=/; Expires=${expires}`;
        c.header(
            "Set-Cookie",cookie,
            {
                append:true
            }
        );
        return c.json({
            error:false,
            msg:"Login Successfull",
            user:{
                name:existingUser.name,
                email:existingUser.email,
                picture:existingUser.picture,
                emailVerified:existingUser.emailVerified
            }
        },200)
    }
)
.post("/emailSignUp",zValidator("json",SignUpSchema,(result,c)=>{
    if(!result.success){
        const errorMessages = zodErrorHandler(result.error);
        return c.json({...errorMessages},400)
    }
}),
async (c) =>{
    const values = await c.req.valid("json");
    try{
        const userAvailable = await userExists(values.email);
        if(userAvailable){
            return c.json({error:true,msg:"User already exists"},400)
        }
        const userId = generateId(15)
        const [newUser] = await db.insert(users).values({
            id:userId,
            name:values.name,
            email:values.email,
            hashedpassword: await bcrypt.hash(values.password,10)
        }).returning()
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken,newUser.id);
        const expires = new Date(Date.now() + 60*60*24*30 * 1000).toUTCString(); 
        const cookie = `sessionId=${session.id}; HttpOnly; Secure; Path=/; Expires=${expires}`;
        c.header( "Set-Cookie",cookie, { append:true },);
        c.header("Location","/",{append:true})
        const otp = Math.floor(100000+Math.random()* 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10*60*1000);
        await db.update(users).set({otp:otp,otpExpiresAt:otpExpiresAt}).where(eq(users.id,newUser.id));
        await sendWelcomeEmail(newUser.email,otp)
        return c.json({ error:false, email:newUser.email })
    }
    catch(error){
        console.table(error);
        return c.json({error:true,msg:`Sign up failed`},500)
    }
}

)
export default app;