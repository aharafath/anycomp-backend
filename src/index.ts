import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./data-source";
import serviceOfferingsMasterListRoutes from "./routes/serviceOfferingsMasterListRoutes";
import platformFeeRoutes from "./routes/platformFeeRoutes";
import specialistRoutes from "./routes/specialistRoutes";
import authRoutes from "./routes/authRoutes";
import { ensureDefaultRoles } from "./utils/ensureDefaultRoles";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use(
  "/api/v1/service-offerings-master-list",
  serviceOfferingsMasterListRoutes
);
app.use("/api/v1/platform-fee", platformFeeRoutes);
app.use("/api/v1/specialist", specialistRoutes);

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected successfully!");

    await ensureDefaultRoles();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
