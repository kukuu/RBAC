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

b. Seed Database with Custom JSON Data

Let's seed the database with some custom JSON data for each company.

```
// src/seed.ts
import { createConnection } from 'typeorm';
import { Company } from './models/company';
import { Template } from './models/template';

createConnection().then(async connection => {
    const companyRepo = connection.getRepository(Company);
    const templateRepo = connection.getRepository(Template);

    // Create companies
    const companyAA = companyRepo.create({ name: 'AA' });
    const companyBB = companyRepo.create({ name: 'BB' });
    const companyCC = companyRepo.create({ name: 'CC' });

    await companyRepo.save([companyAA, companyBB, companyCC]);

    // Create templates with custom JSON data
    const templateAA = templateRepo.create({
        name: 'Template AA',
        data: { message: 'Welcome to AA', items: [1, 2, 3] },
        company: companyAA,
    });

    const templateBB = templateRepo.create({
        name: 'Template BB',
        data: { message: 'Welcome to BB', items: [4, 5, 6] },
        company: companyBB,
    });

    const templateCC = templateRepo.create({
        name: 'Template CC',
        data: { message: 'Welcome to CC', items: [7, 8, 9] },
        company: companyCC,
    });

    await templateRepo.save([templateAA, templateBB, templateCC]);

    console.log('Database seeded');
    process.exit(0);
}).catch(error => console.log(error));

```

Run the seeding script after implementing it

```
ts-node src/seed.ts

```

c. Update the Template Controller
Update the getTemplates controller to return the custom JSON data for the templates.

```
// src/controllers/templateController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Template } from '../models/template';

export const getTemplates = async (req: Request, res: Response) => {
  const templateRepo = getRepository(Template);
  const templates = await templateRepo.find({ where: { company: req.user.company_id } });
  
  // Map to return only name and data
  const response = templates.map(template => ({
    name: template.name,
    data: template.data,
  }));

  res.json(response);

```

## 2. Frontend Updates
We'll now update the frontend to consume and display the custom JSON data from the backend.

a. Template Service
Create a service to fetch the templates data from the API.

```
// src/services/templateService.ts
import axios from 'axios';

export const fetchTemplates = async () => {
  const response = await axios.get('/api/templates');
  return response.data;
};

``` 
b. Update Dashboard Component
Update the Dashboard component to display the custom JSON data.

```
// src/components/Dashboard.tsx
import React, { useContext, useEffect, useState } from 'react';
import { fetchTemplates } from '../services/templateService';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTemplates();
      setTemplates(data);
    };

    fetchData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <h2>Your Templates</h2>
      <ul>
        {templates.map((template, index) => (
          <li key={index}>
            <h3>{template.name}</h3>
            <pre>{JSON.stringify(template.data, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

```

## Running the Updated Application
Start the backend:

Ensure your PostgreSQL server is running.

- Start the backend with the following command:

```
npm run dev

```
- Seed the database:

If you haven’t already, run the seeding script to populate the database with the custom JSON data:

```
ts-node src/seed.ts

```

- Start the frontend:

Make sure you have the correct proxy setup in the frontend’s package.json to point to the backend API.
Start the frontend:

```
npm start

```
## Test the application

- Log in with a user belonging to one of the companies (AA, BB, or CC).

- Navigate to the dashboard to view the custom JSON data associated with that company.

- Testing the Application
To ensure that each company sees only its respective data, you can log in with different users belonging to AA, BB, and CC, and check that the templates displayed match the custom JSON data seeded for each company.

## Conclusion
This implementation provides a robust setup where each company can have its own isolated set of templates with custom JSON data. The role-based access control (RBAC) system ensures that only users belonging to a particular company can access the data related to their company, maintaining strict data isolation and security.
