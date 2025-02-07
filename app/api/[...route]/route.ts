import  auth  from "./auth";
import shop from "./shop"
import {Hono} from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath('/api')

app.route("/auth",auth);
app.route("/shop",shop)
export const POST = handle(app);
export const GET = handle(app);
export const PUT = handle(app);
