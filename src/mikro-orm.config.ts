import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';



export default {
    

    entities:[Post],
    dbName:'tradingdb',
    type:'mongo', 
    debug: !_prod_,
    

}  as Parameters<typeof MikroORM.init>[0] ; // this is to make the type of this object be 'mongo'





