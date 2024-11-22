//Template Controller
//.....................

// src/controllers/templateController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Template } from '../models/template';

export const getTemplates = async (req: Request, res: Response) => {
  const templateRepo = getRepository(Template);
  const templates = await templateRepo.find({ where: { company: req.user.company_id } });
  res.json(templates);
};