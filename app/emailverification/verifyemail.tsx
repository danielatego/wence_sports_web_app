"use client";
import { useActionState } from "react"
import { resendOtpAction, verifyEmailAction } from "./action";
import { Button, FilledButton } from "../ui/filledbutton";
import { ResendOtp } from "@/lib/server/useractions/action";


export  function EmailVerificationForm({email}:{email:string}){

const verifyEmailActionWithEmail = verifyEmailAction.bind(null,email)
const [state,formAction,wait] = useActionState(verifyEmailActionWithEmail,{})
return (
    <form action={formAction} className="space y-3">
        <h1 className="text-2xl font-semibold">Verify Your Email Address</h1>
            <p className="text-gray-600">
                We’ve sent a verification code to <span className="font-medium">{email}</span>. Please enter the code below to verify your email address.
            </p>
            <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    One-Time Password (OTP)
                </label>
                <input
                    type="text"
                    defaultValue={state.values?.otp??""}
                    name="otp"
                    id="otp"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your OTP"
                />
                <div id="name_error" aria-live='polite' aria-atomic="true">
                    {state.errors?.otp&&
                    state.errors.otp.map((error:string)=>
                        <p className="text-sm mt-2 text-red-500" key = {error}>
                            {error}
                        </p>
                    )}
                </div> 
                
            </div>
            <Button type="submit" aria-disabled = {wait}>
                Verify Email
            </Button>
            <div id="name_error" aria-live='polite' aria-atomic="true">
                {
                    state.message&&
                        <p className="text-sm mt-2 text-red-500" key = {state.message}>
                            {state.message}
                        </p>
                }
            </div> 
            <p className="text-gray-600">
                Didn't receive email ? Resend otp
            </p>
            
    </form>
)
    

}
export function ResendEmailVerificationCodeForm({email}:{email:string}) {

    const resendEmailVerificationCodeAction = resendOtpAction.bind(null,email)
	const [state, action,wait] = useActionState(resendEmailVerificationCodeAction, {});
	return (
		<form action={action}>
			<Button type="submit" aria-disabled={wait}>Resend otp</Button>
			<p>{state.message}</p>
		</form>
	);
}

