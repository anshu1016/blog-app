import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();



userRouter.post('/signup', async (c) => {
    try{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
  
    const user = await prisma.user.create({
      data: {
        name:body.name,
        email: body.email,
        password: body.password,
  
      },
    });
  
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  
  
    return c.json({
      // jwt: token,
      abcd:token,
      user:user.id,
      name:user.name,
      email:user.email,
      password:user.password
  
    })
  }
  catch(err){
    
    console.log(err)
    return c.json({message:"Getting error"});
  }
  })
  
  userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    const user = await prisma.user.findUnique({
        where: {
            email: body.email,
            password: body.password
        }
    });
  
    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }
  
    const jwtToken = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwtToken });
  })
  