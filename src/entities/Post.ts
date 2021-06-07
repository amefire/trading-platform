//table

//import { Entity, PrimaryKey, Column } from "@mikro-orm/core";

import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { PrimaryGeneratedColumn } from 'typeorm';
import { UpdateDateColumn } from 'typeorm';
import { CreateDateColumn,BaseEntity } from 'typeorm';
import { User } from "./User";
@ObjectType() // we add this to be able to expose this type to graphql
@Entity()
export class Post extends BaseEntity{
  @Field() /// @field exposes the Post mikro-orm entity to our graphql schema
  @PrimaryGeneratedColumn()
  id!:number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type:"int", default: 0})
  points!: number; // upvotes and downvotes

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(()=> String) 
  @CreateDateColumn()
  createdAt: Date;
  
  
  @Field(()=> String) 
  @UpdateDateColumn()
  updatedAt :Date;

  

  

 

}