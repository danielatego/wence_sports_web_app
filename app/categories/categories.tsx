"use client"
import { useActionState } from "react";
import { Button } from "../ui/filledbutton";
import { CreateCategory } from "./action";

export function CategoriesForm(){

    const [state,formAction,wait] = useActionState(CreateCategory,{})
    return (
        <form action={formAction}>
            <h1 className="text-2xl font-semibold">Categories form</h1>
                        <p className="text-gray-600">
                            Enter the categories of the products to be sold
                        </p>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <input
                                type="text"
                                defaultValue={state.values?.name??""}
                                name="name"
                                id="category"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter category name"
                            />
                            <div id="name_error" aria-live='polite' aria-atomic="true">
                                {state.errors?.name&&
                                state.errors.name.map((error:string)=>
                                    <p className="text-sm mt-2 text-red-500" key = {error}>
                                        {error}
                                    </p>
                                )}
                            </div> 
                            
                        </div>
                        <Button type="submit" aria-disabled = {wait}>
                            Add Category
                        </Button>
                        <div id="message_error" aria-live='polite' aria-atomic="true">
                            {
                                state.message&&
                                    <p className={`text-sm mt-2 ${state.isSuccessful?"text-blue-500":"text-red-500"}`} key = {state.message}>
                                        {state.message}
                                    </p>
                            }
                        </div> 
                        
        </form>
    )
}