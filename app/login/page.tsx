import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { redirect } from "next/navigation";
import LoginForm from "./email_and_password/login";

export default async function LoginPage(){
    if (!globalGETRateLimit()) {
		return "Too many requests";
	}
	const { session, user } = await getCurrentSession();
	if (session !== null) {
		if (!user.emailVerified) {
			return redirect("/verify-email");
		}
		return redirect("/");
	}
    return <LoginForm/>
}