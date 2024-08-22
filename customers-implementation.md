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
c. Configure TypeORM and Database Connection

- TypeORM Configuration
``` 
// ormconfig.json
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "rbac_demo",
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/models/**/*.ts"
  ]
}
```
- Database Connection

```
// src/app.ts
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import authRoutes from './routes/authRoutes';
import templateRoutes from './routes/templateRoutes';
import dotenv from 'dotenv';

dotenv.config();

createConnection().then(async connection => {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/templates', templateRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => console.log(error));


```
d. Authentication and Authorization

- JWT Utility

```
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, company_id: user.company.id, role_id: user.role.id },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};


```
