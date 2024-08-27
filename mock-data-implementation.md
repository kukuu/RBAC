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
