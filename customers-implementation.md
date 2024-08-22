# Implementation
Implementing a full end-to-end Role-Based Access Control (RBAC) system with custom APIs for three different companies (AA, BB, and CC) using Node.js, TypeScript, React, and PostgreSQL is a significant task. Below, I will outline the structure and provide implementation details, including the necessary code snippets.

## Project Structure
Here’s a high-level structure of the project:

```
/backend
  ├── src
  │   ├── controllers
  │   │   └── authController.ts
  │   │   └── templateController.ts
  │   ├── middleware
  │   │   └── authMiddleware.ts
  │   ├── models
  │   │   └── user.ts
  │   │   └── company.ts
  │   │   └── role.ts
  │   │   └── template.ts
  │   ├── routes
  │   │   └── authRoutes.ts
  │   │   └── templateRoutes.ts
  │   ├── services
  │   │   └── authService.ts
  │   │   └── templateService.ts
  │   ├── utils
  │   │   └── jwt.ts
  │   ├── tests
  │   │   └── auth.test.ts
  │   │   └── template.test.ts
  │   ├── app.ts
  │   ├── server.ts
  ├── package.json
  ├── tsconfig.json
  ├── ormconfig.json
/frontend
  ├── src
  │   ├── components
  │   │   └── AuthComponent.tsx
  │   │   └── Dashboard.tsx
  │   ├── context
  │   │   └── AuthContext.tsx
  │   ├── services
  │   │   └── authService.ts
  │   │   └── templateService.ts
  │   ├── App.tsx
  ├── package.json
  ├── tsconfig.json
  ├── public
      └── index.html

```
## Backend Implementation

a. Install Required Dependencies
First, let's set up the project and install the necessary dependencies:

```
mkdir backend
cd backend
npm init -y

- npm install express pg typeorm reflect-metadata bcryptjs jsonwebtoken dotenv
- npm install -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcryptjs jest ts-jest @types/jest supertest @types/supertest

```
b. Create Database Models

- User Model

```
// src/models/user.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from './company';
import { Role } from './role';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Company, company => company.users)
  company: Company;

  @ManyToOne(() => Role, role => role.users)
  role: Role;
}

```
## Company Model

```
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

```

## Role Model

```
// src/models/role.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('json')
  permissions: string[];

  @OneToMany(() => User, user => user.role)
  users: User[];
}
```

## Template Model

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
  data: any;

  @ManyToOne(() => Company, company => company.templates)
  company: Company;
}

```
