"use server";

import { db } from "@/db/drizzle";
import { insertUserSchema, users,User } from "@/db/schema";
import { globalGETRateLimit } from "@/lib/request";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import bcrypt from 'bcrypt';
import { createSession, deleteSessionTokenCookie, generateSessionToken, getCurrentSession, invalidateSessions, setSessionTokenCookie } from "../sessionactions/action";
import { redirect } from "next/navigation";
import { ErrorState } from "@/app/signup/actions";
import { sendWelcomeEmail } from "@/lib/mail";

export async function createUserfromGoogleSignIn(google_Id:string,userEmail:string,userName:string,userPicture:string | null):Promise<User | null>{

    const validatedFields = insertUserSchema.safeParse({
        id: generateId(15),
        name:userName,
        email:userEmail,
        emailVerified:true,
        googleId:google_Id,
        picture:userPicture,
    });
    if(!validatedFields.success){
        // return {
        //     errors:validatedFields.error.flatten().fieldErrors,
        //     message: "Missing Fields. Failed to Create Invoice"
        // }
        console.log(validatedFields.error.flatten().fieldErrors);
        return null;
    }
    const {id,name,email,emailVerified,googleId,picture}= validatedFields.data;
    try{
        
        if(!await userExists(email)){
            const newUser = await db.insert(users).values({
                id:id,
                name:name,
                email:email,
                emailVerified:emailVerified,
                googleId:googleId,
                picture:picture
    
            }).returning()
            return {
                id:newUser[0].id,
                name:newUser[0].name,
                email:newUser[0].email,
                emailVerified:newUser[0].emailVerified??true,
                googleId: newUser[0].googleId,
                isBlocked:newUser[0].isBlocked??false,
                isDeleted:newUser[0].isDeleted??false,
                role:newUser[0].role,
                picture: newUser[0].picture,
            }
        }
        const updateUser = await db.update(users).set({
            
            emailVerified:emailVerified,
            googleId:googleId,
            picture:picture

        }).where(eq(users.email,email)).returning()
        return {
            id:updateUser[0].id,
            name:updateUser[0].name,
            email:updateUser[0].email,
            emailVerified:updateUser[0].emailVerified??true,
            googleId: updateUser[0].googleId,
            isBlocked:updateUser[0].isBlocked??false,
            isDeleted:updateUser[0].isDeleted??false,
            role:updateUser[0].role,
            picture: updateUser[0].picture,

        }
        
    } catch {
        console.log("Database Error: Failed to add a google signed in user");
        return null;
    }
}

export async function createUserEmailnPassword(name:string,email:string,password:string): Promise<ErrorState> {
    const validatedFields = insertUserSchema.safeParse({
        id: generateId(15),
        name:name,
        email:email,
        emailVerified:false,
        role:'user',
        hashedpassword:await bcrypt.hash(password,10)        
    });
    if(!validatedFields.success){
        return{
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice'
          }
    }
    if(await userExists(email)){ 
        return{
            message: "User already Exists"
        }
    }

    try{
        const newUser = await db.insert(users).values({
            id:validatedFields.data.id,
            name:validatedFields.data.name,
            email:validatedFields.data.email,
            hashedpassword:validatedFields.data.hashedpassword,
        }).returning()
        const sessionToken = await generateSessionToken();
        const session = await createSession(sessionToken, newUser[0].id);
        const otp = Math.floor(100000+Math.random()* 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10*60*1000);
        await db.update(users).set({otp:otp,otpExpiresAt:otpExpiresAt}).where(eq(users.id,newUser[0].id));
        await sendWelcomeEmail(newUser[0].email,otp)
        await setSessionTokenCookie(sessionToken, session.expiresAt);
        
        return{ errors:{}, message:"user successfully created"}
    }catch(e){
        return { errors:{}, message:`CreateUserError:${e}`,values:{name:name,email:email,password:password,confirmpassword:password}}
    }
}

export async function getUserfromGoogleSignIn(googleId: string,email:string): Promise<User | null>{

    const existingUser = await db.query.users.findFirst({
        where:eq(users.googleId,googleId)
    })
    const existingEmailUser = await db.query.users.findFirst({
        where:eq(users.email,email)
    })
    if(existingUser===undefined) {
        return null;
    }
    const user: User = {
        id:existingUser!.id,
        name:existingUser!.name,
        email:existingUser!.email,
        emailVerified:existingUser!.emailVerified ?? false,
        googleId:existingUser!.googleId,
        isBlocked:existingUser!.isBlocked ?? false,
        isDeleted:existingUser!.isDeleted ?? false,
        role:existingUser!.role,
        picture:existingUser!.picture
    }


    return user;

}

export async function verifyUserEmail(email:string,otp:string):Promise<OtpResult>{
    const [user] = await db.select().from(users).where(eq(users.email,email))
    if (!user || user.isDeleted) {
        return { error: true, msg: "User not found",code:404 };
    }
    if (user.isBlocked) {
    return { error: true, msg: "User is blocked",code:400 };
    }
    if (!user.otp || !user.otpExpiresAt) {
    return { error: true, msg: "No OTP generated",code:400 };
    }
    if (new Date() > user.otpExpiresAt) {
    return { error: true, msg: "OTP expired",code:400};
    }
    if (user.otp !== otp) {
    return { error: true, msg: "Invalid OTP",code:400 };
    }

    await db.update(users).set({otp:null,otpExpiresAt:null,emailVerified:true}).where(eq(users.id,user.id));
    return{error:false,msg: "Email verified successfully",code:200}

}

export async function Logout(): Promise<LogoutMessageResult>{

    
    if(!globalGETRateLimit()){
        return {
            message:"Too many requests"
        }
    }
    const { session } = await getCurrentSession()
    if (session === null){
        return {
            message: "Not authenticated"
        }
    }
    invalidateSessions(session.id);
    deleteSessionTokenCookie();
    return redirect('/login')
}

export async function ResendOtp(email:string): Promise<OtpResult>{
    
    if(await userExists(email)){ 
        try{
            const otp = Math.floor(100000+Math.random()* 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 10*60*1000);
            await db.update(users).set({otp:otp,otpExpiresAt:otpExpiresAt}).where(eq(users.email,email));
            await sendWelcomeEmail(email,otp)
            return{error:true,msg:"otp resent successfully",code:200}
        }
        catch(_){
            return{error:true,msg:"Could not resend otp",code:400}
        }
    }
    return{error:true,msg:"User does not exist",code:404}   
}


interface LogoutMessageResult{
    message: string | null
}
export interface OtpResult{
    error?:boolean,
    msg?:string
    code?:number
}

export async function userExists (email:string) : Promise<boolean>{
    const existingUser = await db.query.users.findFirst({
        where:eq(users.email,email)
    })
    if(existingUser===undefined){
        return false
    }
    return true;
}
export async function googleUserExists (googleId:string) : Promise<boolean>{
    const existingUser = await db.query.users.findFirst({
        where:eq(users.googleId,googleId)
    })
    if(existingUser===undefined){
        return false
    }
    return true;
}
export async function getUser (email:string,password:string) : Promise<ErrorState>{

    const [existingUser] = await db.select().from(users).where(eq(users.email, email))
    if (!existingUser) {
    return {  message: "User not found",values:{email:email},isSuccessful:false };
    }
    if (!existingUser || existingUser.isDeleted) {
    return {  message: "User does not exist",values:{email:email},isSuccessful:false }
    }
    if (existingUser.isBlocked) {
    return {  message: "User is blocked",values:{email:email},isSuccessful:false }
    }
    if (!existingUser.hashedpassword) {
    return{  message: "Invalid credentials",values:{email:email},isSuccessful:false };
    }
    const validPassword = await bcrypt.compare(password,existingUser.hashedpassword)
    if(!validPassword){
        return{message:"Incorrect credentials",values:{email:email},isSuccessful:false}
    }
    const sessionToken = await generateSessionToken();
	const session = await createSession(sessionToken, existingUser.id);
	await setSessionTokenCookie(sessionToken, session.expiresAt);
    return {
        message:"User Verified successfully",isSuccessful:true
    };
}