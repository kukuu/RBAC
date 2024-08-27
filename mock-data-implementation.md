# Executive Summary

To extend the customer implementation using the customer-implementation.md framework to serve custom JSON data from three different APIs for each company (AA, BB, CC), you'll need to implement API routes that fetch and return the custom JSON data associated with each company. This data will be served to the frontend, and each company will only see its respective data.

## Backend Updates

We'll update the backend to support custom JSON data for each company.

a. Extend the Template Model
Add a data field to the Template model that will store the custom JSON data for each template.

```

// src/models/template.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from './company';

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('json')
  data: any;  // New field to store custom JSON data

  @ManyToOne(() => Company, company => company.templates)
  company: Company;
}

```
