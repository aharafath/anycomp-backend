import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";

const DEFAULT_ROLES = ["Super Admin", "Admin", "User"];

export const ensureDefaultRoles = async (): Promise<void> => {
  const roleRepo = AppDataSource.getRepository(Role);

  for (const name of DEFAULT_ROLES) {
    const existing = await roleRepo.findOne({ where: { name } });

    if (!existing) {
      const role = roleRepo.create({ name, status: true });
      await roleRepo.save(role);
    }
  }
};
