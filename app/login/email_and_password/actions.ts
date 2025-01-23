import { ErrorState } from "@/app/signup/actions";
import { getUser } from "@/lib/server/useractions/action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email("invalid email"),
    password:z.string().min(6,"invalid password")
})

export async function EmailLogin(prevState:ErrorState,formData:FormData){
    const ValidatedFields = LoginSchema.safeParse({
        email:formData.get("email"),
        password:formData.get("password")
    })
    if(!ValidatedFields.success){

        const error :ErrorState = {
            errors :ValidatedFields.error.flatten().fieldErrors,
            message:"Failed to log you in",
            values:{
                email:formData.get("email")?.toString()??""
            }
        }
        return error;
    }
    try{ 
        const user = await getUser(ValidatedFields.data.email,ValidatedFields.data.password)
         if(!user.isSuccessful){
            return {message:`${user.message}`}
         }
    }
    catch{
        
        return { message:"Error finding user",values:{email:formData.get("email")?.toString()??""}}
    }
    //revalidatePath("/")
    redirect("/")
}