/// <reference path="../types/express.d.ts" />
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import jwt from "jsonwebtoken";

export const tokenVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;

  let token = cookieToken;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decode: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    const userRepo = AppDataSource.getRepository(User);

    const me = await userRepo.findOne({
      where: { email: decode.email },
    });

    if (!me) {
      return res.status(401).json({ message: "User not found" });
    }

    req.me = me;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
