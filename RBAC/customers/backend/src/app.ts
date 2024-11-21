//Database Connection
//.................
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