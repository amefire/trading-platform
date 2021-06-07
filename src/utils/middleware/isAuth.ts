import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({context}, next) =>{// runs before our resolvers

    if(!context.req.session.userId){
        throw new Error("Not authenticated(not logged in)")
    }

    return next();
}