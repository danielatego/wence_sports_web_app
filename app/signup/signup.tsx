"use client"
import { AtSymbolIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Button, FilledButton } from "../ui/filledbutton";
import { KeyIcon } from "@heroicons/react/24/outline";
import { useActionState } from "react";
import { ErrorState, SignUp } from "./actions";
import Link from "next/link";

const initialState : ErrorState = {errors:{},message:null,values:{name:"",email:"",password:"",confirmpassword:""}}

export default function SignUpForm(){

   const  [state,formAction] = useActionState(SignUp,initialState)
    return (
        <form action={formAction} className="space-y-3">
            <h1 className="text-2xl">Please log in to continue</h1>
            <div className="w-full">
                <div>
                    <label 
                    className= 'mt-5 mb-3 block text-gray-900 text-sm font-medium'
                    htmlFor="name"
                    >Name
                    </label>
                    <div className="relative">
                    <input 
                    className="peer block w-full text-sm rounded-md border border-gray-200 py-[9px] pl-10 outline-2 placeholder:text-gray-500"
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={state.values?.name}
                    placeholder="Enter your name"
                    />
                    <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"/>
                    </div>
                    <div id="name_error" aria-live='polite' aria-atomic="true">
                        {
                            state.errors?.name&&
                            state.errors.name.map((error:string)=>(
                                <p className="text-sm mt-2 text-red-500" key = {error}>
                                    {error}
                                </p>
                            ))
                        }
                    </div>  
                </div>




                <div>
                    <label 
                    className= 'mt-5 mb-3 block text-gray-900 text-sm font-medium'
                    htmlFor="email"
                    >Email
                    </label>
                    <div className="relative">
                    <input 
                    className="peer block w-full text-sm rounded-md border border-gray-200 py-[9px] pl-10 outline-2 placeholder:text-gray-500"
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={state.values?.email}
                    placeholder="Enter your email address"
                    />
                    <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"/>
                    </div> 
                    <div id="email_error" aria-live='polite' aria-atomic="true">
                        {
                            state.errors?.email&&
                            state.errors.email.map((error:string)=>(
                                <p className="text-sm mt-2 text-red-500" key = {error}>
                                    {error}
                                </p>
                            ))
                        }
                    </div>  
                </div>
                
                 
                <div className='mt-4'>
                    <label
                    className='mb-3 mt-5 block text-sm font-medium text-gray-900' 
                    htmlFor="password">
                        Password
                    </label>
                    <div className='relative'>
                        <input 
                        className='pl-10 py-[9px] w-full border rounded-md peer block border-gray-200 text-sm outline-2 placeholder:text-gray-500'
                        id="password"
                        name='password'
                        type="text" 
                        placeholder='Enter password'
                        defaultValue={state.values?.password}
                        minLength={6}
                        />
                        <KeyIcon className='h-[18px] w-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900'/>
                    </div>
                    <div id="password_error" aria-live='polite' aria-atomic="true">
                        {
                            state.errors?.password&&
                            state.errors.password.map((error:string)=>(
                                <p className="text-sm mt-2 text-red-500" key = {error}>
                                    {error}
                                </p>
                            ))
                        }
                    </div> 
                </div> 
                <div className='mt-4'>
                    <label
                    className='mb-3 mt-5 block text-sm font-medium text-gray-900' 
                    htmlFor="confirmpassword">
                        Confirm your password
                    </label>
                    <div className='relative'>
                        <input 
                        className='pl-10 py-[9px] w-full border rounded-md peer block border-gray-200 text-sm outline-2 placeholder:text-gray-500'
                        id="confirmpassword"
                        name='confirmpassword'
                        type="password" 
                        placeholder='Enter password'
                        defaultValue={state.values?.confirmpassword}
                        minLength={6}
                        />
                        <KeyIcon className='h-[18px] w-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900'/>
                    </div>
                    <div id="confirmpassword_error" aria-live='polite' aria-atomic="true">
                        {
                            state.errors?.confirmpassword&&
                            state.errors.confirmpassword.map((error:string)=>(
                                <p className="text-sm mt-2 text-red-500" key = {error}>
                                    {error}
                                </p>
                            ))
                        }
                    </div> 
                </div>          
            </div>
            <Button type="submit">
                Sign up
            </Button>
            <div id="name_error" aria-live='polite' aria-atomic="true">
                {
                    state.message&&
                        <p className="text-sm mt-2 text-red-500" key = {state.message}>
                            {state.message}
                        </p>
                }
                </div> 
            <FilledButton className="w-40" aria-disabled={false} href="/login/google">
                SignUp with Google
            </FilledButton>
            <Link href="/login">Login Instead</Link>
        </form>

    )
}