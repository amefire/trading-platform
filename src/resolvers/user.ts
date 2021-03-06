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
import { getConnection } from "typeorm";
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
    //   if (req.session.userId === user.id) {
    //     return user.email;
    //   }
    //   // current user wants to see someone elses email
    //   return "";
    // }
  
    @Mutation(() => UserResponse)
    async changePassword(
      @Arg("token") token: string,
      @Arg("newPassword") newPassword: string,
      @Ctx() { redis, req }: MyContext
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
  
      const userIdNum = parseInt(userId);
      //const user = await User.findOne(userId);
     const user = await User.findOne(userIdNum)
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
  
      
      
      await User.update({id:userIdNum},
        {password: await argon2.hash(newPassword) })

      // await em.nativeUpdate({id: userId}, User,{password: await argon2.hash(newPassword)})
    
      // await User.update(
      //   { id: userId },
      //   {
      //     password: await argon2.hash(newPassword),
      //   }
      // );
  
      await redis.del(key);
  
      // log in user after change password
      req.session.userId = user.id;
  
      return { user };
    }

    
    


    @Mutation(()=> Boolean)
 async   forgotPassword(
        @Arg('email') email: string,
        @Ctx() ctx:MyContext

       
    ){
        const user = await User.findOne({where: {email}});
        
      // const user = await User.findOne({ where: { email } });
        if(!user){
            // the email is not in the db
            return true;// do nothing
        }
        const token = v4();// create unique tokens
        // a token help us to validate that we know who they are
        
       await  ctx.redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60*60*24*3)// the reset link has an expiration time of 3 days
        await sendEmail(email,`<a href="http://localhost:3000/change-password/${token}"> reset password</a>`);
    return true
    }
    @Query(()=> User,{nullable:true})
    async me(
        @Ctx() { redis, req }: MyContext
    ){

        if(!req.session.userId){
            return null // you are not logged in
        }

        return await User.findOne(req.session.userId); 
        
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

      //  let user = await User.create({email: options.email,username: options.username, password: hashedPassword}).save(); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
        //await ctx.em.persistAndFlush(user);
        let user 
        try{
         //   await ctx.em.persistAndFlush(user);
           // const result = await User.create({email: options.email,username: options.username, password: hashedPassword}).save(); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
          //user = result as any|undefined ;
          const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({
            username: options.username,
            email: options.email,
            password: hashedPassword,
          })
          .returning("*")
          .execute();
        user = result.raw[0];

          }
        
        catch(err)
        {
            //console.log("message: ", err.code);

             if(err.code ==="23505"){
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
        
         ctx.req.session.userId = user.id; // this will set a cookie on the user and keep them logged in
        
        return {user};
        
        //return 'hello';
        //ctx.em.findOne
    }


    @Mutation(()=> UserResponse) // Queries are for getting datas, 'MUTATIONS' are for updating, deleting, inserting datas.
    async login( 

        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password:string,
        @Ctx() { redis, req }: MyContext
    )   : Promise<UserResponse>
    {

      //  const hashedPassword = await argon2.hash(options.password);

        const user = await User.findOne(usernameOrEmail.includes('@') ? {where :{email: usernameOrEmail}}
        :
        {where:{username: usernameOrEmail}}); // we are not passing the password because we don't want to save a plain text password to the db, in case the db eventually gets hacked
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
        
    req.session.userId = user.id; //ben: ctx.req.session.uuserId = user.id;
        return {user,};

       //return  req.session.userId
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