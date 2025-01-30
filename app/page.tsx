import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/lib/server/sessionactions/action";
import { redirect } from "next/navigation";
import { LogoutButton } from "./ui/logout";
import Link from "next/link";

export default async function Home() {


  if(!globalGETRateLimit()){
    return " Too many requests "
  }
  const {session, user} = await getCurrentSession();
  if(session === null){
    return redirect("/login")
  }
  if (!user.emailVerified) {
		return redirect("/emailverification");
	}
  return  (
    <>
    <img src={user.picture??undefined} alt="profile picture" height={48}/>
    <br />
    <p>welcome {user.name} </p>
    <Link href="/uploadImage">Upload an image</Link>
    <LogoutButton/>
    </>
   )
}
