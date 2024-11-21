//Authentication and Authorization
//JWT Utility
//..........
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
