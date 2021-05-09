import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { Post } from './../entities/Post';
import { User } from './../entities/User';

//import {argon2} from 'argon2';
import * as argon2 from "argon2";
import { Entity } from '@mikro-orm/core';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "./../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from './../utils/validateRegister';
import { sendEmail } from "./../utils/sendEmail";

import {v4} from 'uuid';
//import { errors } from './../../../frontend/.next/static/chunks/main';
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



    //@ObjectType()
    @Resolver()
export class UserResolver {

    // @FieldResolver(() => String)
    // email(@Root() user: User, @Ctx() { req }: MyContext) {
    //   // this is the current user and its ok to show them their own email
    //   if (req.session.userId === user._id) {
    //     return user.email;
    //   }
    //   // current user wants to see someone elses email
    //   return "";
    // }
  
    @Mutation(() => UserResponse)
    async changePassword(
      @Arg("token") token: string,
      @Arg("newPassword") newPassword: string,
      @Ctx() { redis, req,em }: MyContext
    ): Promise<UserResponse> {
      if (newPassword.length <= 2) {
        return {
          errors: [
            {
              field: "newPassword",
              message: "length must be greater than 2",
            },
          ],
        };
      }
  
      const key = FORGET_PASSWORD_PREFIX + token;
      const userId = await redis.get(key);
      if (!userId) {
        return {
          errors: [
            {
              field: "token",
              message: "token expired",
            },
          ],
        };
      }
  
      //const userIdNum = parseInt(userId);
      //const user = await User.findOne(userId);
     const user = await em.findOne(User,{_id: userId})
      if (!user) {
        return {
          errors: [
            {
              field: "token",
              message: "user no longer exists",
            },
          ],
        };
      }
  
      user.password = await argon2.hash(newPassword)
      await em.persistAndFlush(user);

      // await em.nativeUpdate({id: userId}, User,{password: await argon2.hash(newPassword)})
    
      // await User.update(
      //   { id: userId },
      //   {
      //     password: await argon2.hash(newPassword),
      //   }
      // );
  
      await redis.del(key);
  
      // log in user after change password
      req.session.userId = user._id;
  
      return { user };
    }

    


    @Mutation(()=> Boolean)
 async   forgotPassword(
        @Arg('email') email: string,

        @Ctx() ctx: MyContext
    ){
        const user = await ctx.em.findOne(User, {email:email});
      // const user = await User.findOne({ where: { email } });
        if(!user){
            // the email is not in the db
            return true;// do nothing
        }
        const token = v4();// create unique tokens
        // a token help us to validate that we know who they are
        
       await  ctx.redis.set(FORGET_PASSWORD_PREFIX + token, user._id, 'ex', 1000 * 60*60*24*3)// the reset link has an expiration time of 3 days
        await sendEmail(email,`<a href="http://localhost:3000/change-password/${token}"> reset password</a>`);
    return true
    }
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
        const errors = validateRegister(options);

        if(errors)
        { return {errors};
        }
        

        const hashedPassword = await argon2.hash(options.password);

        const user = ctx.em.create(User, {email: options.email,username: options.username, password: hashedPassword}); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
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

        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password:string,
        @Ctx() ctx: MyContext
    )   : Promise<UserResponse>
    {

      //  const hashedPassword = await argon2.hash(options.password);

        const user = await ctx.em.findOne(User, usernameOrEmail.includes('@') ? {email: usernameOrEmail}
        :
        {username: usernameOrEmail}); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
        if(!user){

            return {
                errors: [{
                    field: "usernameOrEmail",
            message: "That username doesn't exist in our DB",},],
            };
        }

        const valid = await argon2.verify(user.password, password);
        
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