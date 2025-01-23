import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { redirect } from "next/navigation";
import SignUpForm from "./signup";

export default async function Page(){

    if(!globalGETRateLimit()){
        return "Too many requests";
    }
    const { user,session } = await getCurrentSession();
	if (session !== null) {
        if (!user.emailVerified) {
			return redirect("/emailverification");
		}
	}
    return <SignUpForm/>
}