import { Router } from "express";
import {
  getAllServiceOfferingsMasterList,
  getServiceOfferingMasterListById,
  createServiceOfferingMasterList,
  updateServiceOfferingMasterList,
  deleteServiceOfferingMasterList,
} from "../controllers/serviceOfferingsMasterListController";
import { tokenVerify } from "../middlewares/tokenVerify";
import { adminVerify } from "../middlewares/adminVerify";
import { upload } from "../config/multer";

const router = Router();

// Public routes
router.get("/", getAllServiceOfferingsMasterList);
router.get("/:id", getServiceOfferingMasterListById);

// Admin only routes
router.post(
  "/",
  tokenVerify,
  adminVerify,
  upload.single("file"),
  createServiceOfferingMasterList
);
router.put(
  "/:id",
  tokenVerify,
  adminVerify,
  upload.single("file"),
  updateServiceOfferingMasterList
);
router.delete(
  "/:id",
  tokenVerify,
  adminVerify,
  deleteServiceOfferingMasterList
);

export default router;
