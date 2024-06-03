import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    interface RequestWithUser extends Request {
        user: any; // Replace `any` with the actual type of `user`
    }
      
    const user = (req as RequestWithUser).user;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
