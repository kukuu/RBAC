//Auth Controller
//.....................

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
