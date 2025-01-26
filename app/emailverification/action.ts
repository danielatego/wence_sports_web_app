"use server"
import {z} from "zod"
import { ErrorState } from "../signup/actions"
import { OtpResult, ResendOtp, verifyUserEmail } from "@/lib/server/useractions/action";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const otpSchema = z.object({
    otp:z.string().length(6,"The otp is not valid"),
    email:z.string().email('The email is invalid')
})

export async  function verifyEmailAction(email:string,prevState:ErrorState,formData:FormData){
    const ValidatedFields = otpSchema.safeParse({
        otp:formData.get("otp"),
        email:email,
    });
    if(!ValidatedFields.success){
       return{
        errors: ValidatedFields.error.flatten().fieldErrors,
        message: 'Failed to Verify Email',
        values:{
            otp:formData.get("otp")?.toString()
        }
       } as ErrorState
    }
    try{
        const verificationResult: OtpResult = await verifyUserEmail(ValidatedFields.data.email,ValidatedFields.data.otp)
        if(verificationResult.error){
        return {message:verificationResult.msg}
        }
    }catch{
        return {message:"Error verifying user email"}
    }
    redirect("/")
    
}
export async  function resendOtpAction(email:string,prevState:ErrorState): Promise<ErrorState>{
   
    const verificationResult: OtpResult = await ResendOtp(email);
    return{
        message:verificationResult.msg
    }
}