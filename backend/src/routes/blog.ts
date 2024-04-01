import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";


const blogRouter = new Hono<{
    Bindings: {
      POOL_URL: string;
      secret :string
    };  
    Variables: {
        id : string
    }
  }>();

  blogRouter.use('/*' , async( c , next)=>{
    console.log(
        "hello from middleware"
    )
    const tkn = c.req.header()['authorization'].split(' ')?.[1];
    console.log(tkn)
    if(tkn){
    const veriTkn = await verify(tkn, c.env.secret);
    if(veriTkn){
        // before using it , declare it in Variables part of Hono instance above
        c.set("id", veriTkn.id)
    }
    else{
        return c.text("unauthorized")
    }
    }
    // console.log(veriTkn);
   
    else{
        return c.text("unauthorized")
    }
    await next();

  })

blogRouter.post("/", async (c) => {  
    const body = await c.req.json();
    console.log(body)
    const prisma = new PrismaClient({
            datasourceUrl: c.env.POOL_URL
          }).$extends(withAccelerate());

          try{

                    
            const res = await  prisma.post.create({
                    data :{
                        title : body.title,
                        content : body.content,
                        authorId : c.get('id')
                    }
                });

                return c.json({ "result" : res})

            }
            catch(e){
                console.log(e);
            }



    // return c.json({ res: "success" });
  });


  blogRouter.put("/", async(c) => {
    const body = await c.req.json();
    console.log(body)
    const prisma = new PrismaClient({
            datasourceUrl: c.env.POOL_URL
          }).$extends(withAccelerate());

          try{

                    
            const res = await  prisma.post.update({
                where : {
                    id : body.id,
                } , 
                data : {
                    title : body.title,
                    content : body.content
                }
            })

                return c.json({ "result" : res})

            }
            catch(e){
                console.log(e);
            }

  });
  blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.POOL_URL
      }).$extends(withAccelerate());
      console.log("bulk called")
      const res = await prisma.post.findMany({
        where : {
            authorId : c.get('id')
        }
      })
      console.log(res)
        return c.json({res})

  });

  
  blogRouter.get("/:id", async(c) => {
    const prisma = new PrismaClient({
            datasourceUrl: c.env.POOL_URL
          }).$extends(withAccelerate());

          try{

            const { id} = c.req.param()
            console.log(id)
            const res = await  prisma.post.findFirst({
                where : {
                    id : id
                } 
            })

                return c.json({ "result" : res})

            }
            catch(e){
                console.log(e);
            }

  });

 

  export default blogRouter;