import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const {GET,POST} = createRouteHandler({
    router:ourFileRouter,
    config:{
        token:'eyJhcGlLZXkiOiJza19saXZlX2FkZTAyYWI0YzI0YjVmZjVkYTk1NTA4Y2VjMDBlOGM0YTAxMGRjMDBiMDZlZjFkNzRiZmIwYTAxYWY3ZWQ3YjEiLCJhcHBJZCI6InkydHNxNWwwMmIiLCJyZWdpb25zIjpbInNlYTEiXX0='
    }
})

