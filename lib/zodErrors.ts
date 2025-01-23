import { z } from 'zod'

export const zodErrorHandler = (error: z.ZodError<any>)=>{
    const errorMessages = error.errors.map((issues: any)=>{
        return  `${issues.path.join(".")} is ${issues.message}`;
    })
    return {error:"Invalid data",messages:errorMessages}
}