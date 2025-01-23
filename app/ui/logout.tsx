"use client";
import { Logout } from "@/lib/server/useractions/action";
import { useActionState } from "react";
import { Button } from "./filledbutton";

const initialState = {
    message: null
};

export function LogoutButton(){
    const [errorMessage, action,wait] = useActionState(Logout,initialState)
    return(
        <form action={action} >
            <Button className=" rounded-lg bg-red-500 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600" aria-disabled={wait}>
                Logout
            </Button>
            {
                errorMessage&&
                <>
                <p className='text-sm text-red-500 '>{errorMessage.message}</p>
                </>
            }
        </form>
    )
}