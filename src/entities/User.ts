//table

//import { Entity, Index, PrimaryKey, Property, Unique } from "@mikro-orm/core";
//import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from 'typeorm';


@ObjectType() // we add this to be able to expose this type 'User' to graphql
 @Entity()
export class User extends BaseEntity {
  
  @Field() /// @field exposes the Post mikro-orm entity to our graphql schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(()=> String) 
  @CreateDateColumn()
  createdAt: Date;

  //updatedAt = new Date();
  
  @Field(()=> String)
   @UpdateDateColumn()
   updatedAt:Date;



  @Field()
  // @Unique()
  // @Index()
  @Column({unique: true})
  username!: string;

  @Field()
  // @Unique()
  // @Index()
  @Column({ unique: true})
  email!: string;

//@Field() //we re not exposing the password field to graphql, because we don't wanna allow the client to select the password
  @Column() // we are only creating password as a database column
  password!: string;
    //id: any;

  

 

}