import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";


const userRouter = new Hono<{
    Bindings: {
      POOL_URL: string;
      secret :string
    };
  }>();
  
  
  
  userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.POOL_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try{
    const res = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    
  
    const token = await sign({id :res.id}, c.env.secret)
    return c.json({ res: res , token:token});
    }
    catch(err){
      c.json({ err})
    }
  
  });
  
  userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.POOL_URL
    }).$extends(withAccelerate());
  
    const {email , password} = await c.req.json();
  
    const res = await prisma.user.findUnique({
      where : {
        email: email,
        password: password
      }
    });
    if(res){
      const token = await sign({id :res.id}, c.env.secret);
      console.log(token)
      return c.json({ res , token });
    }
    c.status(403)
    return c.json("not signed in with this email");
    
  });

  export default userRouter;