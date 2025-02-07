import { ErrorState } from "@/app/signup/actions";
import { db } from "@/db/drizzle";
import { categories, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSharp } from "next/dist/server/image-optimizer";
import { UTApi, UTFile } from "uploadthing/server";
import sharp from "sharp"


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
        isSuccessful:false,
        values:({name:categoryName}),
        message:"Error: That category already exists"
    } as ErrorState;
}

export async function FetchCategories():Promise<Product[]>{
    const products:Product[] = await db.select().from(categories)
    return products;
}


export async function UploadImage(formData:FormData):Promise<ErrorState>{
    try {
        // Get the file from the formData object and assert it's a File
        const file = formData.get("imageUrl") as File;
    
        // Ensure the file is valid
        if (!file) {
            return {
                isSuccessful:false,
                errors: { imageUrl: ["No file selected"] }
            } as ErrorState;
        }
        // Convert the resulting compressed image (Blob) to a buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const compressed = await sharp(buffer).resize({width:720}).toBuffer();
        
    
        // Initialize the upload file with the buffer and the name
        const utapi = new UTApi();
        const uploadThingFile = new UTFile([compressed], file.name);
    
        // Upload the file
        const response = await utapi.uploadFiles([uploadThingFile]);
    
        // Check for errors in the response
        if (response[0]?.error) {
            return {
                isSuccessful:false,
                errors: { imageUrl: ["Could not upload file to cloud"] }
            } as ErrorState;
        }
    
        // If successful, return a success message
        return {
            values:{imageUrl:[response[0].data.url]},
            message: "File uploaded successfully",
            isSuccessful: true
        } as ErrorState;
    
    } catch (e) {
        // Generic error catch with more details
        return {
            
            message: `${e}:Failed to upload product image`,
            isSuccessful: false
        } as ErrorState;
    }
}
export type Product = {
    id:string,
    name:string
}


