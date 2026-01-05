import { Router } from "express";
import {
  logedInUser,
  login,
  logout,
  register,
} from "../controllers/authController";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", tokenVerify, logedInUser);

export default router;
