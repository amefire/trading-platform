//table

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ObjectType } from "type-graphql";
@ObjectType() // we add this to be able to expose this type to graphql
@Entity()
export class Post {
  @Field() /// @field exposes the Post mikro-orm entity to our graphql schema
  @PrimaryKey()
  _id:string;

  @Field(()=> String) 
  @Property({type: "date"})
  createdAt= new Date();
  
  @Property({onUpdate:()=> new Date()})
  updatedAt= new Date();
  @Field()
  @Property({type:"text"})
  title: string;

  

 

}