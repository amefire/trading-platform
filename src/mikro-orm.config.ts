import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';

//import path from "path";

export default {
    
    // migrations:{
    // path: path.join(__dirname,"./migrations"), 
    // pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    // },
    entities:[Post],
    dbName:'tradingdb',
    type:'mongo', 
    debug: !_prod_,
    

}  as Parameters<typeof MikroORM.init>[0] ; // this is to make the type of this object be 'mongo'





