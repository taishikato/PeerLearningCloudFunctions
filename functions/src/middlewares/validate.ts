import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  if (!Number.isInteger(req.body.dayBefore)) {
    res.status(400);
    return res.json({ error: 'dayBefore should be an integer' });
  }
  return next();
};
