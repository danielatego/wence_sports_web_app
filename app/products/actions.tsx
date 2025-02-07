"use server"

import { UTApi, UTFile } from "uploadthing/server";
import { ErrorState } from "../signup/actions";
import { UploadImage } from "@/lib/server/transactions/transactions";
import { insertProductSchema, products } from "@/db/schema";
import { generateId } from "lucia";
import { db } from "@/db/drizzle";

export async function AddProduct(prevState:ErrorState,formData:FormData){
    const uploadResult = await UploadImage(formData);
    const ValidatedFields = insertProductSchema.safeParse({
        id:generateId(10),
        name:formData.get("name"),
        description:formData.get("description"),
        amount:formData.get("amount"),
        categoryId:formData.get("categoryId"),
        imageUrl: uploadResult.values?.imageUrl![0]
    })
    if(!ValidatedFields.success){
        return{
            errors:ValidatedFields.error.flatten().fieldErrors,
            message:'Failed to add category',
            values:{
                name:formData.get("name")?.toString(),
                description:formData.get("description")?.toString(),
                amount:formData.get("amount")?.toString(),
                categoryId:formData.get("categoryId")?.toString(),
            },
            isSuccessful:false
        }as ErrorState;
    }
    const{id,name,description,amount,imageUrl,categoryId}= ValidatedFields.data;
    try{
        await db.insert(products).values({id,name,description,imageUrl,categoryId,amount})
        return {
            message:`Success: ${name} added to products`,
            isSuccesful:true
        } as ErrorState;
    }catch(e){
        return{
            message:`Failed: ${e}`,
            isSuccesful:false
        } as ErrorState;
    }

}