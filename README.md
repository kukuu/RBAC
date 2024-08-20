# Using Role Based Aceesss Control

## Task:
How to implement a Role Based Access Control in NodeJS, TypeScript and REACT for 3 different stakeholder -  using similar AI templates and API engine for Frontend and back end. None of the stakeholders must see data sources of one another. 

The architecture should cover:
- Database Design
- Authentication
- Authorization
- Integration of Company Data
-  Isolation using APIs
- Frontend Integration
-  Best Practices and Security.

Below is a comprehensive guide covering database design, authentication, authorization, integration of company data isolation, frontend integration, best practices, and security.


Implementing Role-Based Access Control (RBAC) in a Node.js application using TypeScript and React for three different companies with shared AI templates and API engines, while ensuring strict data isolation, is a complex yet achievable task. Below is a comprehensive guide covering database design, authentication, authorization, integration of company data isolation, frontend integration, best practices, and security.


## Database Design
### a. Tables/Collections Design:

#### Users Table:

id: Unique identifier.
username: Unique username.
email: Email of the user.
password: Hashed password.
company_id: Foreign key referencing the company the user belongs to.
role_id: Foreign key referencing the role of the user.

#### Companies Table:

id: Unique identifier.
name: Name of the company.
api_key: Unique API key for the company.
Roles Table:

id: Unique identifier.
name: Name of the role (e.g., admin, user, etc.).
permissions: JSON array of permissions associated with the role.

#### Templates Table:

id: Unique identifier.
name: Name of the template.
company_id: Foreign key referencing the company that owns the template.
data: JSON or other appropriate format storing the AI template data.

#### APIs Table:

id: Unique identifier.
name: Name of the API.
company_id: Foreign key referencing the company that owns the API.
endpoint: URL or endpoint of the API.
data: JSON or other format storing API-related data.

#### b. Relations:
 ##### One-to-Many:
Companies to Users (one company can have many users).
Companies to Templates (one company can have many templates).
Companies to APIs (one company can have many APIs).
Roles to Users (one role can be assigned to many users)

## Authentication
### JWT Authentication:

Upon login, generate a JSON Web Token (JWT) that encodes the user_id, company_id, and role_id.
Store the JWT in the user's session or local storage.

#### Password Hashing:

Use bcrypt or Argon2 for hashing passwords before storing them in the database.

#### Login Flow:

- Verify the user's credentials.
- Check if the user is associated with the correct company_id.
- Generate a JWT with the user_id, company_id, and role_id.
- Return the JWT to the client.

## Authorization
### Middleware for RBAC:
- Implement a middleware that extracts the role_id and company_id from the JWT.
- Use the role_id to check if the user has the necessary permissions for the requested operation.
- Use the company_id to ensure the user can only access data belonging to their company.

```
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { Role } from './entities/Role';

export const authorize = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            const roleRepo = getRepository(Role);
            const userRole = await roleRepo.findOne({ where: { id: decoded.role_id } });

            if (!userRole || !permissions.includes(userRole.name)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
};

```
### Role-Based Permissions:
- Define roles with specific permissions, e.g., admin can create/edit/delete, while users can only view.
- Store these permissions in the Roles table and enforce them via middleware.


## Integration of Company Data Isolation using APIs

### API Gateway:

- Implement an API gateway to manage incoming requests and route them to the appropriate backend services.
- The API gateway can use the company_id from the JWT to direct requests to the correct data source.

### Company Isolation:

- Ensure that every API request includes the company_id as part of the query parameters or in the JWT.
- Filter database queries based on the company_id to ensure data isolation.

```
// Example of fetching templates for a specific company
app.get('/templates', authorize(['user', 'admin']), async (req: Request, res: Response) => {
    const companyId = req.user.company_id;
    const templates = await templateRepo.find({ where: { company_id: companyId } });
    res.json(templates);
});

```
### Multi-Tenancy Database Strategy:

- Single Database, Shared Schema: All companies share the same database, but queries are scoped by company_id.
- Separate Databases per Company: Each company has its own database, and the connection is dynamically selected based on the company_id.

## Frontend Integration
### Role-Based UI:

- Use React Context or Redux to manage the state of the authenticated user, including their role and company_id.
- Conditionally render UI components based on the user's role and permissions.

```
const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    
    if (user.role === 'admin') {
        return <AdminDashboard />;
    }
    return <UserDashboard />;
};


```
## API Calls with Company Context:

- Ensure all API calls from the frontend include the JWT token in the authorization header.
- Extract company_id from the token and append it to API requests if needed.
