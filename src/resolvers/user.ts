import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Post } from './../entities/Post';
import { User } from './../entities/User';

//import {argon2} from 'argon2';
import * as argon2 from "argon2";
import { Entity } from '@mikro-orm/core';
import { COOKIE_NAME } from "./../constants";
//import { session } from 'express-session';



@InputType()
class UsernamePasswordInput{

        @Field()
        username!: string;
        @Field()
        password!: string;
    }

    @ObjectType()
    class FieldError{ // errors messages here will be displayed in the UI
        @Field()
        field: string; // the email or password field can have error

        @Field()
        message: string; // the error message we'll display in the UI
        // @Field()
        // user?:User
    }
    //@Entity()
    @ObjectType() // we can return ObjectType from our mutations and use InputType for our @args
    class UserResponse{
        @Field(()=>[FieldError],{nullable:true}) // an error is returned if the login/register query didn't work properly
        errors?: FieldError[];

        @Field(()=> User,{nullable:true})// a user is returned if the login query worked properly
        user?: User   // '?' means undefined.
        //static user: UserResponse | PromiseLike<UserResponse>;

        
    }



@Resolver()
export class UserResolver {
    @Query(()=> User,{nullable:true})
    async me(
        @Ctx() ctx: MyContext
    ){

        if(!ctx.req.session.userId){
            return null // you are not logged in
        }

        const user = await ctx.em.findOne(User,{_id: ctx.req.session.userId}); 
        return user
    }

    

    @Mutation(()=> UserResponse) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async register( 

        @Arg('options',() => UsernamePasswordInput, {nullable: true}) options: UsernamePasswordInput,

        @Ctx() ctx: MyContext
    ) : Promise<UserResponse>
    { 
        if(options.username.length<=2){
            return {
                errors:[{
                    field: 'username',
                    message: "length must be greater than 2"
                }]
            }
        }

        if(options.password.length<=2){
            return {
                errors:[{
                    field: 'password',
                    message: "length must be greater than 2"
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password);

        const user = ctx.em.create(User, {username: options.username, password: hashedPassword}); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
        //await ctx.em.persistAndFlush(user);
        try{
            await ctx.em.persistAndFlush(user);

        }
        
        catch(err)
        {
            //console.log("message: ", err.code);

             if(err.code ===11000){
                return {
                    errors:[
                        {
                            field:"username",
                            message: "username already taken",
                        },
                    ],
                }
             }
         }
        
         ctx.req.session.userId = user._id; // this will set a cookie on the user and keep them logged in
        
        return {user};
        
        //return 'hello';
        //ctx.em.findOne
    }


    @Mutation(()=> UserResponse) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async login( 

        @Arg('options') options: UsernamePasswordInput,

        @Ctx() ctx: MyContext
    )   : Promise<UserResponse>
    {

      //  const hashedPassword = await argon2.hash(options.password);

        const user = await ctx.em.findOne(User, {username: options.username}); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
        if(!user){

            return {
                errors: [{
                    field: "username",
            message: "That username doesn't exist in our DB",},],
            };
        }

        const valid = await argon2.verify(user.password, options.password);
        
        if(!valid)
        {
            return{
                errors:[
                    {
                        field: "password",
                         message:"incorrect password"
                    }
                ]

        };
    }
        
    ctx.req.session.userId = user._id; //ben: ctx.req.session.uuserId = user._id;
        return {user,};
        // {
        //     user,
        // };
        
        //return 'hello';
        //ctx.em.findOne
    }

    @Mutation(()=>Boolean)
    logout(
        @Ctx() ctx:MyContext
    ){
      return new Promise((resolve)=> 
        ctx.req.session.destroy((err: any) =>{
        // ctx.res.clearCookie("qid");   
        if(err){
               console.log(err)
               resolve(false)
               return
           }
           ctx.res.clearCookie(COOKIE_NAME); 
           resolve(true)
       })) // will remove the session from redis

    }



}