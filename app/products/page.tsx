import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { redirect } from "next/navigation";
import { ProductsForm } from "./products";
import { FetchCategories } from "@/lib/server/transactions/transactions";

export default async function Page() {
    if (!globalGETRateLimit()){
        return "Too many requests"
    }
    const {user}= await getCurrentSession();
    if(user === null){
        return redirect("/login");
    }if(user.emailVerified==false){
        return redirect("/emailverification")
    }
    const products = await FetchCategories();
    return <ProductsForm products={products}/>
}