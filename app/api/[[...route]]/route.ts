import  auth  from "./auth";
import app from "./auth";
import { handle } from "hono/vercel";

const routes = app.route("/auth",auth)
export const POST = handle(app);