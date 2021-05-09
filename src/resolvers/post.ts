import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Post } from './../entities/Post';

@Resolver()
export class PostResolver {

    @Query(()=> [Post]) // we specified the type of objects the query is returning ie 'Posts'
    posts(

        @Ctx() ctx: MyContext
    ) : Promise<Post[]>
    {
        return ctx.em.find(Post,{});
        //return 'hello';
    }



    @Query(()=> Post, {nullable:true}) // we specified the type of objects the query is returning ie 'Posts'
    post(

        @Arg("id",() => String) _id: string,

        @Ctx() ctx: MyContext
    ) : Promise<Post | null>
    {
        return ctx.em.findOne(Post,  {_id});
        //return 'hello';
        ctx.em.findOne
    }


    @Mutation(()=> Post) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async createPost(

        @Arg("title",() => String) title: string,

        @Ctx() ctx: MyContext
    ) : Promise<Post>
    {
        const post = ctx.em.create(Post, {title});
        await ctx.em.persistAndFlush(post)
        return post;
        //return 'hello';
        ctx.em.findOne
    }


    @Mutation(()=> Post,{nullable:true}) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async updatePost(

        @Arg("id",() => String) _id: string,
        @Arg("title",() => String, {nullable: true}) title: string,

        @Ctx() ctx: MyContext
    ) : Promise<Post | null>
    {
        const post = await ctx.em.findOne(Post, {_id});
        if(!post){
            return null;


        }

        if(typeof title !== 'undefined'){
            post.title = title;
            await ctx.em.persistAndFlush(post)
        }
        await ctx.em.persistAndFlush(post)
        return post;
        //return 'hello';
        ctx.em.findOne
    }



    @Mutation(()=> Boolean) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async deletePost(

        @Arg("id",() => String) _id: string,
       
        @Ctx() ctx: MyContext
    ) : Promise<boolean>
    {
       await ctx.em.nativeDelete(Post, {_id});
        return true;
        //return 'hello';
        ctx.em.findOne
    }

}