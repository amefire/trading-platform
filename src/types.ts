import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import {Request, Response, Express} from "express";
//import { session } from 'express-session';

import { Redis } from 'ioredis';
export type MyContext{
    // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request & {session: Express.session};
    redis: Redis;

    res: Response;
}