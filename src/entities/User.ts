//table

import { Entity, Index, PrimaryKey, Property, Unique } from "@mikro-orm/core";
//import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ObjectType } from "type-graphql";


@ObjectType() // we add this to be able to expose this type 'User' to graphql
 @Entity()
export class User {
  static findOne(userId: string) {
      throw new Error("Method not implemented.");
  }
  static update(arg0: { id: any; }, arg1: { password: string; }) {
      throw new Error("Method not implemented.");
  }
  @Field() /// @field exposes the Post mikro-orm entity to our graphql schema
  @PrimaryKey()
  _id: string;

  @Field(()=> String) 
  @Property({type: "date"})
  createdAt= new Date();

  //updatedAt = new Date();
  
  @Field(()=> String)
   @Property({type:"date",onUpdate:()=> new Date()})
   updatedAt= new Date();



  @Field()
  @Unique()
  @Index()
  @Property({type:"text", unique: true})
  username!: string;

  @Field()
  @Unique()
  @Index()
  @Property({type:"text", unique: true})
  email!: string;

//@Field() //we re not exposing the password field to graphql, because we don't wanna allow the client to select the password
  @Property({type:"text", unique: true}) // we are only creating password as a database column
  password!: string;
    //id: any;

  

 

}