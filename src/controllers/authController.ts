import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * LOGIN USER
 */
export const login = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Wrong password" });
      return;
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const accessTokenExpireEnv = process.env.ACCESS_TOKEN_EXPIRE_IN;

    const expiresIn =
      accessTokenExpireEnv && accessTokenExpireEnv.trim().length > 0
        ? (accessTokenExpireEnv as jwt.SignOptions["expiresIn"])
        : "7d";

    if (!accessTokenSecret) {
      res
        .status(500)
        .json({ message: "Missing ACCESS_TOKEN_SECRET configuration" });
      return;
    }

    const token = jwt.sign({ email: user.email }, accessTokenSecret, {
      expiresIn,
    });

    const isProd = process.env.APP_ENV !== "Development";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // password remove
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      token,
      user: safeUser,
      message: "User Login Successful",
    });
  }
);

/**
 * LOGOUT USER
 */
export const logout = expressAsyncHandler(
  async (_req: Request, res: Response) => {
    const isProd = process.env.APP_ENV !== "Development";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.status(200).json({ message: "Logout successful" });
  }
);

/**
 * REGISTER USER
 */
export const register = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const existingUser = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await roleRepo.findOne({
      where: { name: "User" },
    });

    if (!defaultRole) {
      res.status(500).json({ message: "Default role not found" });
      return;
    }

    const newUser = userRepo.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: defaultRole,
      isVerified: false,
      status: true,
    });

    const savedUser = await userRepo.save(newUser);

    const { password: _, ...safeUser } = savedUser;

    res.status(201).json({
      user: safeUser,
      message: "User created successfully",
    });
  }
);

/**
 * LOGED IN USER
 */
export const logedInUser = expressAsyncHandler(
  (req: Request, res: Response) => {
    res.status(200).json({ user: req.me });
  }
);
