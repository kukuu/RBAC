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
- Auth Middleware

```
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded: any = verifyToken(token.split(' ')[1]);
      req.user = decoded;
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

```

- Auth Controller

```
// src/controllers/authController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ where: { email }, relations: ['company', 'role'] });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  return res.json({ token });
};

```
- Template Controller

```
// src/controllers/templateController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Template } from '../models/template';

export const getTemplates = async (req: Request, res: Response) => {
  const templateRepo = getRepository(Template);
  const templates = await templateRepo.find({ where: { company: req.user.company_id } });
  res.json(templates);
};

```
e. Routes

- Auth Routes
```

// src/routes/authRoutes.ts
import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

router.post('/login', login);

export default router;

```

- Template Routes

```
// src/routes/templateRoutes.ts
import { Router } from 'express';
import { getTemplates } from '../controllers/templateController';
import { authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authorize(['user', 'admin']), getTemplates);

export default router;

```
f. Unit Tests

- Testing Setup
  
Install testing libraries:

```
npm install -D jest supertest @types/supertest

```

- Auth Test

```
// src/tests/auth.test.ts
import request from 'supertest';
import { createConnection } from 'typeorm';
import { User } from '../models/user';
import app from '../app';

describe('Auth API', () => {
  beforeAll(async () => {
    await createConnection();
  });

  it('should login user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@aa.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

```

## Frontend Implementation
a. Install Required Dependencies

Set up the React project:

```
npx create-react-app frontend --template typescript
cd frontend
npm install axios react-router-dom @types/react-router-dom

```

b. Auth Context
- Auth Context Setup

```
// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(atob(token.split('.')[1])));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(JSON.parse(atob(token.split('.')[1])));
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

```

- Auth Component

```
// src/components/AuthComponent.tsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthComponent: React.FC = () => {
  const { login } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default AuthComponent;


```
