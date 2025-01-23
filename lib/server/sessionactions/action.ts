"use server"
import { db } from "@/db/drizzle";
import { Session, sessions, User, users } from "@/db/schema";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import {sha256} from "@oslojs/crypto/sha2"
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { strict } from "assert";

export async function generateSessionToken(): Promise<string>{
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLocaleLowerCase();
    return token;
}

export async function deleteSessionTokenCookie(): Promise<void> {
    (await cookies()).set("sesion","",{
        httpOnly:true,
        path:"/",
        secure:process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
    });
}
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	(await cookies()).set("session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}
export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(sessions)
  .where(eq(sessions.userId, userId));
}
export async function invalidateSessions(sessionId: string): Promise<void> {
	await db.delete(sessions)
  .where(eq(sessions.id,sessionId));
}
export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const token = (await cookies()).get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = validateSessionToken(token);
	return result;
});

export async function validateSessionToken(token:string) : Promise<SessionValidationResult>{
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const sessionUser =await db.select({
        s_id:sessions.id,
        s_userId:sessions.userId,
        s_expiry:sessions.expiresAt,
        u_id:users.id,
        u_name:users.name,
        u_email:users.email,
        u_emailVerified:users.emailVerified,
        u_googleId:users.googleId,
        u_blocked:users.isBlocked,
        u_deleted:users.isDeleted,
        u_role:users.role,
        u_pic:users.picture
    }).from(sessions).innerJoin(users,eq(sessions.userId,users.id)).where(eq(sessions.id,sessionId))

    if(sessionUser.length === 0){
        return {session:null,user:null}
    }else{
        const session: Session = {
            id: sessionUser[0].s_id,
            userId: sessionUser[0].s_userId,
            expiresAt: sessionUser[0].s_expiry
        };
        const user: User = {
            id:sessionUser[0].u_id,
            name:sessionUser[0].u_name,
            email:sessionUser[0].u_email,
            emailVerified:sessionUser[0].u_emailVerified ?? false,
            googleId: sessionUser[0].u_googleId,
            isBlocked:sessionUser[0].u_blocked?? false,
            isDeleted:sessionUser[0].u_deleted ?? false,
            role: sessionUser[0].u_role,
            picture: sessionUser[0].u_pic
        };
        if (Date.now() >= session.expiresAt.getTime()){
            await db.delete(sessions).where(eq(sessions.id,session.id));
            return {session:null,user:null};
        }
        if (Date.now()>=session.expiresAt.getTime()-1000*60*60*24*15){
            session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 *30)
            await db.update(sessions).set({expiresAt: session.expiresAt}).where(eq(sessions.id,session.id))
        }
        return {session, user};
    }
    
    
}
export async function createSession(token: string,userId: string): Promise<Session>{
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId:userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
    await db.insert(sessions).values({id:session.id,userId: session.userId,expiresAt:session.expiresAt,})
    return session;
}
export async function deleteSession(userId:string){
    await db.delete(sessions).where(eq(sessions.userId,userId))
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
