import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  const pattern = /^([1-9]\d*|0)$/;
  if (!pattern.test(req.body.dayBefore)) {
    res.status(400);
    return res.json({ error: 'dayBefore should be an integer' });
  }
  return next();
};
