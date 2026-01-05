import { Router } from "express";
import {
  createPlatformFee,
  getAllPlatformFees,
  getPlatformFeeById,
  updatePlatformFee,
  deletePlatformFee,
} from "../controllers/platformFeeController";

const router = Router();

router.post("/", createPlatformFee);
router.get("/", getAllPlatformFees);
router.get("/:id", getPlatformFeeById);
router.put("/:id", updatePlatformFee);
router.delete("/:id", deletePlatformFee);

export default router;
