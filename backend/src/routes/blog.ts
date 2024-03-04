import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const BookRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string,
        JWT_SECRET:string
        },
        Variables:{
            title:string,
            content:string,
            userId:string
        },
        data:{
            title:string,
            content:string
        }
}>();

BookRouter.use(async(c,next)=>{
    const jwtToken = c.req.header("Authorization");
    if(!jwtToken){
        c.status(401);
        return c.json({error:"Unauthorized Access"});
    }
    const token = jwtToken.split(" ")[1];
    const payload = await verify(token,c.env.JWT_SECRET);
    if(!payload){
        c.status(401);
        return c.json({error:"Unauthorized Payload"});
    }
    c.set("userId",payload.id);
    await next();
})


BookRouter.post("/",async (c,next)=>{
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl:c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = c.req.json();
    
    const post = await prisma.post.create({
        data:{
            //@ts-ignore
            title:body.title ,
            //@ts-ignore
            content:body.content,
            authorId:userId
        }
    });
    return c.json({id:post.id})
})

//update the post
BookRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});


BookRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})