import { NextFunction, Request, Response } from "express";
import { tokenVerify } from "./tokenVerify";

export const adminVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await tokenVerify(req, res, async () => {
    const roleName = req.me?.role?.name;

    if (roleName !== "Admin" && roleName !== "Super Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    next();
  });
};
