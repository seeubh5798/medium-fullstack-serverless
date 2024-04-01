import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";

const app = new Hono<{
  Bindings: {
    POOL_URL: string;
    secret :string
  };
}>();


// middleware

// app.use("/*" , async(c , next)=>{
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env.POOL_URL
//   }).$extends(withAccelerate());
//   console.log("middleware called")
//   await next();
// })


app.route("/api/v1/user", userRouter);

app.route("/api/v1/blog",blogRouter);


app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
