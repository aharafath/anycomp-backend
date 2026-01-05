import "reflect-metadata";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import { ensureDefaultRoles } from "../utils/ensureDefaultRoles";

dotenv.config();

const run = async () => {
  await AppDataSource.initialize();
  console.log("Database connected. Seeding default admin...");

  await ensureDefaultRoles();

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@anycomp.com";
  const adminPassword =
    process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123456789";
  const adminName = process.env.DEFAULT_ADMIN_NAME || "Super Admin";

  const existing = await userRepo.findOne({
    where: { email: adminEmail.toLowerCase() },
  });

  if (existing) {
    console.log(`Admin already exists with email: ${adminEmail}`);
    return;
  }

  const role =
    (await roleRepo.findOne({ where: { name: "Super Admin" } })) ||
    (await roleRepo.findOne({ where: { name: "Admin" } }));

  if (!role) {
    throw new Error("Admin role not found. Seed roles first.");
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = userRepo.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role,
    isVerified: true,
    status: true,
  });

  await userRepo.save(admin);

  console.log(`Default admin created: ${adminEmail}`);
};

run()
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    void AppDataSource.destroy();
  });
