import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {

    @Query(()=> String)
    hello()
    {
        return 'hello bye d world'
    }

}