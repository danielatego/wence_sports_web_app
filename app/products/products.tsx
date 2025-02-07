"use client"

import { Product } from "@/lib/server/transactions/transactions"
import { useActionState, useState } from "react"
import { ErrorState } from "../signup/actions"
import { Button } from "../ui/filledbutton"
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { AddProduct } from "./actions"

export function ProductsForm({products}:{products:Product[]}){
    const [description, setDescription] = useState('');
    const [state,formAction,wait] = useActionState(AddProduct,{}as ErrorState)
    return(
        <form action={formAction}className="p-4 space-y-4">
            <h1 className="text-2xl font-semibold">Product form</h1>
            <p className="text-gray-600 pt-4 pb-2">
                Enter the products to be sold
            </p>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product name
                </label>
                <input
                    type="text"
                    defaultValue={state.values?.name??""}
                    name="name"
                    id="name"
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
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                </label>
                <input
                    type="number"
                    defaultValue={state.values?.amount??""}
                    name="amount"
                    id="price"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter price of product"
                />
                <div id="amount_error" aria-live='polite' aria-atomic="true">
                    {state.errors?.amount&&
                    state.errors.amount.map((error:string)=>
                        <p className="text-sm mt-2 text-red-500" key = {error}>
                            {error}
                        </p>
                    )}
                </div> 
            </div>
            <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Choose category
                </label>
                <div className="relative">
                    <select
                    id="category"
                    name="categoryId"
                    className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                    defaultValue={state.values?.categoryId??""}
                    aria-describedby='category-error'
                    >
                    <option value="" disabled>
                        Select a category
                    </option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                        {product.name}
                        </option>
                    ))}
                    </select>
                    <ShoppingCartIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                </div>
                <div id="product-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.categoryId &&
                    state.errors.categoryId.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                        </p>
                    ))
                    }
                </div>
            </div>
            <div >
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
                <textarea
                    id="descrioption"
                    name="description"
                    placeholder="Enter your description here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-full mt-1"
                    rows={4}
                />
                <p className="mt-2 text-sm text-gray-500">Character count: {description.length}</p>
                <div id="description_error" aria-live='polite' aria-atomic="true">
                    {state.errors?.description&&
                    state.errors.description.map((error:string)=>
                        <p className="text-sm mt-2 text-red-500" key = {error}>
                            {error}
                        </p>
                    )}
                </div> 
            </div>
            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image
                </label>
                <input
                    type="file"
                    accept="image/png,image/jpeg"
                    name="imageUrl"
                    id="image"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div id="name_error" aria-live='polite' aria-atomic="true">
                    {state.errors?.imageUrl&&
                    state.errors.imageUrl.map((error:string)=>
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