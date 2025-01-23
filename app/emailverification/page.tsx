import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { redirect } from "next/navigation";
import {EmailVerificationForm, ResendEmailVerificationCodeForm}   from "./verifyemail";

export default async function Page(){
    if(!globalGETRateLimit()){
        return "Too many requests";
    }
    const {user} = await getCurrentSession();
    if(user === null){
        return redirect("/login")
    }if(user.emailVerified===true){
        return redirect("/")
    }
    return <>
    
    <EmailVerificationForm email={user.email}/>
    <ResendEmailVerificationCodeForm email={user.email}/>
    
    </>
    
}