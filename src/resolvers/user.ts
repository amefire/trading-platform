import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Post } from './../entities/Post';
import { User } from './../entities/User';

//import {argon2} from 'argon2';
import * as argon2 from "argon2";
import { Entity } from '@mikro-orm/core';



@InputType()
class UsernamePasswordInput{

        @Field()
        username: string;
        @Field()
        password: string;
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

    

    @Mutation(()=> UserResponse) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async register( 

        @Arg('options') options: UsernamePasswordInput,

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

        if(options.username.length<=2){
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
        
        return {user,};
        // {
        //     user,
        // };
        
        //return 'hello';
        //ctx.em.findOne
    }



}