import { Repository } from "typeorm";

export const generateUniqueSlug = async (
  repo: Repository<any>,
  text: string
): Promise<string> => {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  let slug = baseSlug;
  let count = 1;

  while (await repo.findOneBy({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};
