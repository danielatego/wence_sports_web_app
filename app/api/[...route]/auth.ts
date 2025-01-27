import { Hono } from "hono"
import {z } from "zod"
import {zValidator} from "@hono/zod-validator"
import { LoginSchema } from "@/app/login/email_and_password/actions"
import {zodErrorHandler} from "@/lib/zodErrors"
import { db } from "@/db/drizzle"
import { insertUserSchema, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from 'bcrypt'
import { createSession, deleteSession, generateSessionToken } from "@/lib/server/sessionactions/action"
import { SignUpSchema } from "@/app/signup/actions"
import { getUser, googleUserExists, userExists } from "@/lib/server/useractions/action"
import { generateId } from "lucia"
import { sendWelcomeEmail } from "@/lib/mail"
import { decodeIdToken } from "arctic"
import { ObjectParser } from "@pilcrowjs/object-parser"

const otpSchema = z.object(
    {
        otp:z.string().length(6,"The otp is not valid"),
        email:z.string().email('The email is invalid')
    }
)




const app = new Hono()
.post(
    "/emaillogin",zValidator("json",LoginSchema,(result,c) =>{
        if(!result.success){
            const errorMessages = zodErrorHandler(result.error);
            return c.json({...errorMessages},400)
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
    const values = c.req.valid("json");
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
        return c.json(
            { 
                error:false,
                msg:"New user created", 
                user:{
                    name:newUser.name,
                    email:newUser.email,
                    picture:newUser.picture,
                    emailVerified:newUser.emailVerified
                }
            },200)
    }
    catch(error){
        console.table(error);
        return c.json({error:true,msg:`Sign up failed`},500)
    }
}
)
.post("verifyEmail",zValidator("json",otpSchema,(result,c)=>{
    if(!result.success){
        const errorMessages = zodErrorHandler(result.error)
        return c.json({...errorMessages},400)
    }
}),
async(c) =>{
    const values = c.req.valid("json");
    try{
        const [user] = await db.select().from(users).where(eq(users.email,values.email));
        if (!user || user.isDeleted) {
        return c.json({ error: true, msg: "User not found" }, 404);
        }
        if (user.isBlocked) {
        return c.json({ error: true, msg: "User is blocked" }, 400);
        }
        if (!user.otp || !user.otpExpiresAt) {
        return c.json({ error: true, msg: "No OTP generated" }, 400);
        }
        if (new Date() > user.otpExpiresAt) {
        return c.json({ error: true, msg: "OTP expired" }, 400);
        }
        if (user.otp !== values.otp) {
        return c.json({ error: true, msg: "Invalid OTP" }, 400);
        }

        const [updatedUser]=await db.update(users).set({otp:null,otpExpiresAt:null,emailVerified:true}).where(eq(users.id,user.id)).returning()
        await deleteSession(user.id);
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken,user.id);
        const expires = new Date(Date.now() + 60*60*24*30 * 1000).toUTCString(); 
        const cookie = `sessionId=${session.id}; HttpOnly; Secure; Path=/; Expires=${expires}`;
        c.header(
            "Set-Cookie",cookie,
            {
                append:true
            }
        );
        c.header("Location","/",{append:true});
        return c.json({
            error:false,
            msg:"Account verified successfully",
            user:{
                name:updatedUser.name,
                email:updatedUser.email,
                picture:updatedUser.picture,
                emailVerified:updatedUser.emailVerified
            }
        },200)
    }catch(error){
        return c.json({error:true,msg:"Failed to verify OTP"},500)
    }
    
}   
)
.post("resendOtp",zValidator("json",otpSchema.omit({otp:true}),(result,c)=>{
    if(!result.success){
        const errorMessages = zodErrorHandler(result.error);
        return c.json({...errorMessages},400)
    }
}),
async(c)=>{
    const values = c.req.valid("json");
    try{    
        const [user] = await db.select().from(users).where(eq(users.email,values.email));
        if (!user || user.isDeleted) {
        return c.json({ error: true, msg: "User not found" }, 404);
        }
        if (user.isBlocked) {
        return c.json({ error: true, msg: "User is blocked" }, 400);
        }
        await deleteSession(user.id)
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken,user.id);
        const expires = new Date(Date.now() + 60*60*24*30 * 1000).toUTCString(); 
        const cookie = `sessionId=${session.id}; HttpOnly; Secure; Path=/; Expires=${expires}`;
        c.header( "Set-Cookie",cookie, { append:true },);
        c.header("Location","/",{append:true})
        const otp = Math.floor(100000+Math.random()* 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10*60*1000);
        await db.update(users).set({otp:otp,otpExpiresAt:otpExpiresAt}).where(eq(users.id,user.id));
        await sendWelcomeEmail(user.email,otp)

        return c.json({
            error:false,
            msg:"Otp resent successfully",
        },200)
    }
    catch{
        return c.json({
            error:true,
            msg:"Failed to Resend Otp"
        },400)
    
    }
}

)
.post("googleSignIn",zValidator("json",insertUserSchema,(result,c)=>{
    if(!result.success){
        const errorMessages = zodErrorHandler(result.error);
        return c.json({...errorMessages},400)
    }
}),
async (c) =>{
    const values = c.req.valid("json");
    try{
        const googleId = values.googleId!
        const name = values.name
        const picture = values.picture
        const email = values.email

        if(await userExists(email)){
            if(await googleUserExists(googleId)){
                const [user] = await db.select().from(users).where(eq(users.email,email));
                await deleteSession(user.id);
                const sessionToken = await generateSessionToken();
                const session = await createSession(sessionToken,user.id);
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
                    msg:"Account verified successfully",
                    user:{
                        name:user.name,
                        email:user.email,
                        picture:user.picture,
                        emailVerified:user.emailVerified
                    }
                },200);

            }else{
                const [updatedUser] = await db.update(users).set({googleId:googleId,picture:picture,emailVerified:true}).where(eq(users.email,email)).returning();
                await deleteSession(updatedUser.id);
                const sessionToken = await generateSessionToken();
                const session = await createSession(sessionToken,updatedUser.id);
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
                    msg:"Account updated successfully",
                    user:{
                        name:updatedUser.name,
                        email:updatedUser.email,
                        picture:updatedUser.picture,
                        emailVerified:updatedUser.emailVerified
                    }
                },200);
            }
        }
        const [createdUser] = await db.insert(users).values({
            id:generateId(15),
            name:name,
            email:email,
            picture:picture,
            googleId:googleId,
            emailVerified:true,

        }).returning();
        const sessionToken = await generateSessionToken();
                const session = await createSession(sessionToken,createdUser.id);
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
                    msg:"Account created successfully",
                    user:{
                        name:createdUser.name,
                        email:createdUser.email,
                        picture:createdUser.picture,
                        emailVerified:createdUser.emailVerified
                    }
                },200);


    }catch{
        return c.json({
            error:true,
            msg:"failed to verify user"
        },400)
    }
}
)
export default app;