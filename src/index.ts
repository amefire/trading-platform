import 'reflect-metadata';
import {MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, _prod_ } from "./constants";

//import { Post } from './entities/Post';
import microConfig from "./mikro-orm.config";

import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

//

import Redis from 'ioredis';
import session  from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from 'src/types';
import cors from "cors";

import {createConnection} from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';





//







const main = async ()=>{

    //sendEmail('pepmefire@gmail.com','hidd');

    const conn = await createConnection({
        type: "postgres",

        username: "postgres",
    password: "test123",
      
     database:'tradingdbtypeorm',
    //database:'tradingdb',
    logging: true,
         synchronize: true,// will create the tables automatically and you won't need to create migrations
      //  migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User],
      });
   ////// const orm = await MikroORM.init(microConfig);
  // await orm.em.nativeDelete(User, {});
    
    // const post = orm.em.create(Post, {title: 'areas'});
    // await orm.em.persistAndFlush(post);

    const app = express();

    const RedisStore = connectRedis(session)
//const redisClient = Redis()
const redis = new Redis()
app.use(cors({origin: "http://localhost:3000",
credentials:true,
}));

app.use(
  session({
      name:COOKIE_NAME,
    store: new RedisStore({ client: redis,
    disableTouch: true,
   // disableTTL: true
    
}),
cookie:{
    maxAge: 1000 * 60*60*365*10, //10 years
    httpOnly: true,// good for security reasons. In the JS code in your frontend you won't be allowed to access the cookie, so it's good for security.
    sameSite: "lax", // csrf
    secure:  _prod_  // so if it's 'true', the cookies will only work in HTTPS. But in localhost we are not using https, so we're gonna make it a environment variable
},
     saveUninitialized:false, // it will create a session by default even if we don't store any data in it
    
    secret: '12ww',
    resave: false,
    
  })
)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[HelloResolver,PostResolver, UserResolver],
            validate: false
        }),  // await the graphql schema

        context: ({req,res}) =>({ req, res, redis})

        // context: ({req,res}): MyContext =>({ em: orm.em,req, res, redis}) // context is a special object accessible by all our resolvers// so here all our resolvers will share the micro-orm connection to our db before executing a query or mutation
    });// we can access our session in our resolvers by passing in the req and res objects

    apolloServer.applyMiddleware({ app,cors:false  }); // we are applying the apollo server middleware on the express 'app'
    // app.get('/', (_,res) =>{

    //     res.send('hello world');
    // })
    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

};

main();
