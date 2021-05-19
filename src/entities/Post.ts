//table

//import { Entity, PrimaryKey, Column } from "@mikro-orm/core";

import { ObjectId } from "@mikro-orm/mongodb";
import { Field, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { PrimaryGeneratedColumn } from 'typeorm';
import { UpdateDateColumn } from 'typeorm';
import { CreateDateColumn,BaseEntity } from 'typeorm';
@ObjectType() // we add this to be able to expose this type to graphql
@Entity()
export class Post extends BaseEntity{
  @Field() /// @field exposes the Post mikro-orm entity to our graphql schema
  @PrimaryGeneratedColumn()
  id!:number;

  @Field(()=> String) 
  @CreateDateColumn()
  createdAt: Date;
  
  
  @Field(()=> String) 
  @UpdateDateColumn()
  updatedAt :Date;

  @Field()
  @Column()
  title!: string;

  

 

}