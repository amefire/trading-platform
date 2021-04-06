//table

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class Post {

  @PrimaryKey()
  _id: ObjectId;


  @Property()
  createdAt= new Date();
  
//   @Property({onUpdate:()=> new Date()})
//   updatedAt= new Date();

  @Property()
  title: string;

  

 

}