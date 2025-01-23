import { createUserEmailnPassword } from '@/lib/server/useractions/action';
import { redirect } from 'next/navigation';
import { promise, z } from 'zod'

export type ErrorState = {
    errors?:{
        name?:string[];
        email?:string[];
        password?:string[];
        confirmpassword?:string[];
        otp?:string[];
    };
    message?:string | null ;
    values?:{
        name?:string;
        email?:string;
        password?:string;
        confirmpassword?:string;
        otp?:string;
    }
    isSuccessful?:boolean ;
}

export const SignUpSchema = z.object({
    name:z.string({message:"name is required"}).regex(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed").min(5,"name must be at least 5 characters"),
    email:z.string().email({message:"please enter a valid email."}),
    password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be less than 30 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmpassword:z.string()
}).refine((data) => data.password === data.confirmpassword,{
    message:"Password must match",
    path: ["confirmpassword"],
})


export async function SignUp(prevState:ErrorState,formData: FormData){
    const ValidatedFields = SignUpSchema.safeParse({
        name:formData.get("name"),
        email:formData.get('email'),
        password:formData.get('password'),
        confirmpassword:formData.get('confirmpassword'),
    })
    if(!ValidatedFields.success){
        const error: ErrorState= {
            errors:ValidatedFields.error.flatten().fieldErrors,
            message: 'Failed to sign you up',
            values:{
                name:formData.get("name")?.toString() ?? "",
                email:formData.get("email")?.toString() ?? "",
                password:formData.get("password")?.toString() ?? "",
                confirmpassword:formData.get("confirmpassword")?.toString() ?? ""
            }
        }
        return error;
    }
    try{
        await createUserEmailnPassword(
        ValidatedFields.data.name,
        ValidatedFields.data.email,
        ValidatedFields.data.password,
    )}catch{
        
        return {message:"Could not create user"} as ErrorState
    }
    
    return redirect("/")
    
}