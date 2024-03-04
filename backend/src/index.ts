import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign, verify } from "hono/jwt";
import { userRouter } from './routes/user';
import { BookRouter } from './routes/blog';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
    alg?:string,
    header:string
  }
}>()
app.use("/app/v1/blog/*",async(c,next)=>{
  const header = c.req.header("authorization") ||"";
  const token = header.split(" ")[1];
  const response = await verify(token,c.env.JWT_SECRET);
  if(response.id){
    next()
  }
  else{
    c.status(403);
    return c.json({err:"Unauthorized"})
  }
})
app.get('/', (c) => {
  return c.text('Hello HonoHonod!')
});

app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",BookRouter);

export default app;
