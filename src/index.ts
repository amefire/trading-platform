import 'reflect-metadata';
import {MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";

//import { Post } from './entities/Post';
import microConfig from "./mikro-orm.config";

import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';



const main = async ()=>{
    const orm = await MikroORM.init(microConfig);
   
    
    // const post = orm.em.create(Post, {title: 'areas'});
    // await orm.em.persistAndFlush(post);

    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[HelloResolver,PostResolver, UserResolver],
            validate: false
        }),  // await the graphql schema

        context: ()=>({ em: orm.em}) // context is a special object accessible by all our resolvers// so here all our resolvers will share the micro-orm connection to our db before executing a query or mutation
    });

    apolloServer.applyMiddleware({ app });
    // app.get('/', (_,res) =>{

    //     res.send('hello world');
    // })
    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

};

main();
