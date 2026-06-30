import type { Request, Response, NextFunction } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ success: false, message: "Not authorized" });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ success: false, message: "Admin access only" });
    return;
  }

  next();
}