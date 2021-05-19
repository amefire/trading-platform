import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Post } from './../entities/Post';

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
    async createPost(

        @Arg("title",() => String) title: string,

    ) : Promise<Post>
    {
        // 
        return Post.create({title}).save()
      
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