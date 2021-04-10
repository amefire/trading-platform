import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';
import { User } from "./entities/User";



export default {
    

    entities:[Post, User],
    dbName:'tradingdb',
    type:'mongo', 
    debug: !_prod_,
   // ensureIndexes: true, // defaults to false
    

}  as Parameters<typeof MikroORM.init>[0] ; // this is to make the type of this object be 'mongo'





