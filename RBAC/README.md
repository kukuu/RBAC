# Folder Structure

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
