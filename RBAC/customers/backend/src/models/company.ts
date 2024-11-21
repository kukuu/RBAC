//Company Model
// src/models/company.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user';
import { Template } from './template';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => User, user => user.company)
  users: User[];

  @OneToMany(() => Template, template => template.company)
  templates: Template[];
}