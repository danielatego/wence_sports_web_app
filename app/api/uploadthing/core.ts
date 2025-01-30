import { metadata } from "@/app/layout";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import {createUploadthing, type FileRouter} from "uploadthing/next";
import {UploadThingError} from "uploadthing/server";

const uploadthing = createUploadthing();



export const ourFileRouter = {

    profilePicture: uploadthing({
        image:{maxFileSize:"1024KB",maxFileCount:1,minFileCount:1}
    })
    .middleware(async ()=>{
       const  {user,session} =  await getCurrentSession();
       if(!user) throw new UploadThingError("unauthorized");
       return {userId:user.id}
    })
    .onUploadComplete(async ({metadata,file}) => {
        return {uploadedBy:metadata.userId,fileUrl:file.url}
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;