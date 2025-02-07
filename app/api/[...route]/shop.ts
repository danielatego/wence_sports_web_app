import { db } from "@/db/drizzle";
import { categories, products } from "@/db/schema";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { Hono,Context } from "hono";
import {eq} from "drizzle-orm";

interface CustomContext extends Context {
    Variables: {
      userId: string;
    };
  }
  
const authMiddleware = async (c: any,next: any)=>{
    try {
        const {user,session} = await getCurrentSession();
        if(!user){
            throw new Error("Unauthorized request")
        }
        // Attach user info to the context for later use
        c.set("userId",user.id);
        await next();
    } catch (error){
        return c.json({error:`${error}` || "Unauthorized"},401)
    }
}


const app = new Hono<CustomContext>()
.use('/',authMiddleware)
.get('/', (c) => {
    const userId = c.get('userId'); // Access user ID from context
    return c.json({ message: `Welcome, user ${userId}!` });
  })  
.get("/products",async (c) =>{
    const productList = await db.select({
        id:products.id,
        name:products.name,
        description:products.description,
        price:products.amount,
        imageUrl:products.imageUrl,
        category:categories.name
    }).from(products).innerJoin(categories,eq(products.categoryId,categories.id))
    return c.json({
        data:productList
    })
})
export default app;