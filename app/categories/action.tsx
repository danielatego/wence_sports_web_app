"use server"
import { categories, insertCategorySchema } from "@/db/schema";
import { ErrorState } from "../signup/actions";
import { generateId } from "lucia";
import { addnewCategory } from "@/lib/server/transactions/transactions";

export async function CreateCategory(prevState:ErrorState,formData:FormData){
    const ValidatedFields = insertCategorySchema.safeParse({
        id:generateId(5),
        name:formData.get("name")
    })
    if(!ValidatedFields.success){
        return{
            errors:ValidatedFields.error.flatten().fieldErrors,
            message:'Failed to add category',
            values:{
                name:formData.get("name")?.toString()
            }
        }as ErrorState
    }
    const {id,name}=ValidatedFields.data;
    return await addnewCategory(id,name);
}