import { Router } from "express";
import {
  createSpecialist,
  getAllSpecialists,
  getSpecialistById,
  getSpecialistBySlug,
  updateSpecialist,
  deleteSpecialist,
  getPublishedSpecialists,
  updateSpecialistVerificationStatus,
  updateSpecialistDraftStatus,
  approveSpecialist,
  rejectSpecialist,
} from "../controllers/specialistController";
import { tokenVerify } from "../middlewares/tokenVerify";
import { adminVerify } from "../middlewares/adminVerify";
import { upload } from "../config/multer";

const router = Router();

// Public routes
router.get("/published/specialists", getPublishedSpecialists);
router.get("/slug/:slug", getSpecialistBySlug);

// Protected routes (require authentication)
router.post(
  "/",
  tokenVerify,
  upload.fields([
    { name: "file_1", maxCount: 1 },
    { name: "file_2", maxCount: 1 },
    { name: "file_3", maxCount: 1 },
  ]),
  createSpecialist
);
router.get("/", tokenVerify, getAllSpecialists);
router.get("/:id", tokenVerify, getSpecialistById);
router.put(
  "/:id",
  tokenVerify,
  upload.fields([
    { name: "file_1", maxCount: 1 },
    { name: "file_2", maxCount: 1 },
    { name: "file_3", maxCount: 1 },
  ]),
  updateSpecialist
);
router.delete("/:id", tokenVerify, deleteSpecialist);
router.patch("/:id/draft", tokenVerify, updateSpecialistDraftStatus);

// Admin only routes
router.patch(
  "/:id/verification",
  tokenVerify,
  adminVerify,
  updateSpecialistVerificationStatus
);
router.patch("/:id/approve", tokenVerify, adminVerify, approveSpecialist);
router.patch("/:id/reject", tokenVerify, adminVerify, rejectSpecialist);

export default router;
