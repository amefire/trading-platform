import { MyContext } from "src/types";
import { isAuth } from "src/utils/middleware/isAuth";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { useContainer } from "typeorm";
import { Post } from './../entities/Post';
//import { isAuth } from './../utils/middleware/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

// @ObjectType()
// class PaginatedPosts {
//   @Field(() => [Post])
//   posts: Post[];
//   @Field()
//   hasMore: boolean;
// }

@Resolver()
export class PostResolver {

    @Query(()=> [Post]) // we specified the type of objects the query is returning ie 'Posts'
    posts() : Promise<Post[]>
    {
        return Post.find({});
        //return 'hello';
    }



    @Query(()=> Post, {nullable:true}) // we specified the type of objects the query is returning ie 'Posts'
    post(

        @Arg("id",() => String) id: string,

       
    ) : Promise<Post | undefined>
    {
        return Post.findOne(id);
        
    }


    @Mutation(()=> Post) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    @UseMiddleware(isAuth) // check if the user is logged in before proceeding to the mutation CreatePost. A middleware always runs before our resolvers
    async createPost(

        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext

    ) : Promise<Post>
    {
        // if(!req.session.userId){
        //     throw new Error("Not authenticated(not logged in)")
        // }  // replaced by  @UseMiddleware(isAuth)
        
        return Post.create({...input, 
            //points, // points is 0 by default so no need to add that
             creatorId: req.session.userId // the creatorId is from the session so we know who user created the post
            }).save()
      
    }


    @Mutation(()=> Post,{nullable:true}) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async updatePost(

        @Arg("id",() => String) id: number,
        @Arg("title",() => String, {nullable: true}) title: string,

        
    ) : Promise<Post | null>
    {
        const post = await Post.findOne(id);
        if(!post){
            return null;


        }

        if(typeof title !== 'undefined'){
            
            Post.update({id},{title}); //update the title of a specific ID
        }
        Post.update({id},{title})
        
        return post;
        //return 'hello';
       // ctx.em.findOne
    }



    @Mutation(()=> Boolean) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async deletePost(

        @Arg("id",() => String) id: string,
       
    ) : Promise<boolean>
    {
       await Post.delete(id);
        return true;
       
    }

}