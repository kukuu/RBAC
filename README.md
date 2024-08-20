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
