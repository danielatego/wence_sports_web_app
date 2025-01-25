import  auth  from "./auth";
import {Hono} from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath('/api')

app.route("/auth",auth);
export const POST = handle(app);
export const GET = handle(app);
export const PUT = handle(app);
