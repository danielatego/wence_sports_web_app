import { ErrorState } from "@/app/signup/actions";
import { db } from "@/db/drizzle";
import { categories, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addnewCategory (categoryId:string,categoryName:string) : Promise<ErrorState>{
    const existingCategory = await db.query.categories.findFirst({
        where:eq(categories.name,categoryName)
    })
    if(existingCategory===undefined){
        try{
            await db.insert(categories).values({id:categoryId,name:categoryName})
            return{
                isSuccessful: true,
                message:`Success: ${categoryName} added to categories`
            }
        }catch(error){
            return{
                isSuccessful:false,
                values:({name:categoryName}),
                message:"Error: Failed to create category"
            }
        }

    }
    return {
        values:({name:categoryName}),
        message:"Error: That category already exists"
    } as ErrorState;
}