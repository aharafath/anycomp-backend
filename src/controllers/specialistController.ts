import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Specialist, VerificationStatus } from "../entity/Specialist";
import { ServiceOffering } from "../entity/ServiceOffering";
import { ServiceOfferingsMasterList } from "../entity/ServiceOfferingsMasterList";
import { Media, MediaType } from "../entity/Media";
import { generateUniqueSlug } from "../utils/slugify";
import { PlatformFee } from "../entity/PlatformFee";
import path from "path";
import fs from "fs/promises";
type UploadedFields = {
  file_1?: Express.Multer.File[];
  file_2?: Express.Multer.File[];
  file_3?: Express.Multer.File[];
};

/**
 * CREATE SPECIALIST
 */
export const createSpecialist = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      base_price,
      duration_days,
      service_offering_master_list_ids = [],
      media_type,
    } = req.body;

    const price = Number(base_price);
    const duration = Number(duration_days);

    const masterListIds = Array.isArray(service_offering_master_list_ids)
      ? service_offering_master_list_ids
      : service_offering_master_list_ids
      ? [service_offering_master_list_ids]
      : [];

    if (!title || !description || !price || !duration) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const specialistRepo = AppDataSource.getRepository(Specialist);
    const masterListRepo = AppDataSource.getRepository(
      ServiceOfferingsMasterList
    );
    const offeringRepo = AppDataSource.getRepository(ServiceOffering);
    const mediaRepo = AppDataSource.getRepository(Media);
    const platformFeeRepo = AppDataSource.getRepository(PlatformFee);

    const slug = await generateUniqueSlug(
      specialistRepo,
      req.body.slug || title
    );

    // Calculate platform fee (unchanged)
    const platformFees = await platformFeeRepo.find();
    const tier = platformFees.find(
      (pf) => price >= pf.min_value && price <= pf.max_value
    );

    const platform_fee = tier
      ? parseFloat(
          ((price * Number(tier.platform_fee_percentage)) / 100).toFixed(2)
        )
      : 0;

    const final_price = price + platform_fee;

    const specialist = specialistRepo.create({
      title,
      slug,
      description,
      base_price: price,
      platform_fee,
      final_price,
      duration_days: duration,
      verification_status: VerificationStatus.PENDING,
      is_draft: true,
      created_by: req.me,
    });

    const saved = await specialistRepo.save(specialist);

    if (masterListIds.length) {
      const masterListItems = await masterListRepo.findBy({
        id: In(masterListIds),
      });

      for (const masterItem of masterListItems) {
        await offeringRepo.save(
          offeringRepo.create({
            specialists: saved,
            service_offerings_master_list: masterItem,
          })
        );
      }
    }

    const files = (req.files || {}) as UploadedFields;

    const candidates = [
      { file: files.file_1?.[0], order: 0 },
      { file: files.file_2?.[0], order: 1 },
      { file: files.file_3?.[0], order: 2 },
    ].filter((x) => x.file);

    for (const item of candidates) {
      const f = item.file!;
      const media = mediaRepo.create({
        file_name: f.filename,
        file_size: f.size,
        mime_type: f.mimetype,
        media_type: (media_type as Media["media_type"]) || MediaType.THUMBNAIL,
        uploaded_at: new Date(),
        specialists: saved,
        display_order: item.order,
      });
      await mediaRepo.save(media);
    }

    res.status(201).json({
      message: "Specialist created successfully",
      data: saved,
    });
  }
);

/**
 * UPDATE SPECIALIST
 */
export const updateSpecialist = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      base_price,
      duration_days,
      service_offering_master_list_ids,
      media_type,
    } = req.body;

    const specialistRepo = AppDataSource.getRepository(Specialist);
    const masterListRepo = AppDataSource.getRepository(
      ServiceOfferingsMasterList
    );
    const offeringRepo = AppDataSource.getRepository(ServiceOffering);
    const mediaRepo = AppDataSource.getRepository(Media);
    const platformFeeRepo = AppDataSource.getRepository(PlatformFee);

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .where("specialist.id = :id", { id: req.params.id });

    const isAdmin =
      req.me?.role?.name === "Admin" || req.me?.role?.name === "Super Admin";
    if (!isAdmin && req.me) {
      qb.andWhere("specialist.created_by = :userId", { userId: req.me.id });
    }

    const specialist = await qb.getOne();
    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    // basic update (unchanged)
    if (title) specialist.title = title;
    if (description) specialist.description = description;

    if (base_price !== undefined) {
      const price = Number(base_price);
      specialist.base_price = price;

      const platformFees = await platformFeeRepo.find();
      const tier = platformFees.find(
        (pf) => price >= pf.min_value && price <= pf.max_value
      );

      specialist.platform_fee = tier
        ? parseFloat(
            ((price * Number(tier.platform_fee_percentage)) / 100).toFixed(2)
          )
        : 0;

      specialist.final_price = price + specialist.platform_fee;
    }

    if (duration_days) specialist.duration_days = Number(duration_days);

    await specialistRepo.save(specialist);

    // service offerings update (unchanged)
    const masterListIds = Array.isArray(service_offering_master_list_ids)
      ? service_offering_master_list_ids
      : service_offering_master_list_ids
      ? [service_offering_master_list_ids]
      : undefined;

    if (masterListIds !== undefined) {
      await offeringRepo
        .createQueryBuilder()
        .delete()
        .where("specialists = :specialistId", { specialistId: specialist.id })
        .execute();

      if (masterListIds.length) {
        const masterListItems = await masterListRepo.findBy({
          id: In(masterListIds),
        });

        for (const masterItem of masterListItems) {
          await offeringRepo.save(
            offeringRepo.create({
              specialists: specialist,
              service_offerings_master_list: masterItem,
            })
          );
        }
      }
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    const files = (req.files || {}) as UploadedFields;

    const incomingSlots: Array<{ file: Express.Multer.File; order: number }> = [
      { file: files.file_1?.[0] as any, order: 0 },
      { file: files.file_2?.[0] as any, order: 1 },
      { file: files.file_3?.[0] as any, order: 2 },
    ].filter((x) => !!x.file);

    if (incomingSlots.length) {
      for (const item of incomingSlots) {
        const f = item.file;

        const existing = await mediaRepo
          .createQueryBuilder("media")
          .where("media.specialists = :sid", { sid: specialist.id })
          .andWhere("media.display_order = :order", { order: item.order })
          .getOne();

        if (existing) {
          const oldFileName = existing.file_name;

          existing.file_name = f.filename;
          existing.file_size = f.size;
          existing.mime_type = f.mimetype;
          existing.media_type =
            (media_type as Media["media_type"]) || existing.media_type;
          existing.uploaded_at = new Date();

          await mediaRepo.save(existing);

          if (oldFileName && oldFileName !== f.filename) {
            const oldPath = path.join(uploadDir, oldFileName);
            await fs.unlink(oldPath).catch((e: any) => {
              console.warn(
                "Failed to delete old media file:",
                oldFileName,
                e?.code || e?.message || "UNKNOWN"
              );
            });
          }
        } else {
          const media = mediaRepo.create({
            file_name: f.filename,
            file_size: f.size,
            mime_type: f.mimetype,
            media_type:
              (media_type as Media["media_type"]) || MediaType.THUMBNAIL,
            uploaded_at: new Date(),
            specialists: specialist,
            display_order: item.order,
          });

          await mediaRepo.save(media);
        }
      }
    }

    res.json({ message: "Specialist updated successfully" });
  }
);

/**
 * GET ALL SPECIALISTS WITH PLATFORM FEE
 */
export const getAllSpecialists = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);

    const {
      is_draft,
      search,
      page = "1",
      limit = "10",
    } = req.query as {
      is_draft?: "DRAFT" | "PUBLISHED";
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Number(limit), 10);
    const skip = (pageNumber - 1) * pageSize;

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .leftJoinAndSelect("specialist.created_by", "created_by")
      .orderBy("specialist.created_at", "DESC");

    // User filtering: non-admin users can only see their own specialists
    const isAdmin =
      req.me?.role?.name === "Admin" || req.me?.role?.name === "Super Admin";
    if (!isAdmin && req.me) {
      qb.andWhere("specialist.created_by = :userId", { userId: req.me.id });
    }

    // draft filterpecialist.created_by
    if (is_draft === "DRAFT") {
      qb.andWhere("specialist.is_draft = true");
    }

    if (is_draft === "PUBLISHED") {
      qb.andWhere("specialist.is_draft = false");
    }

    // search filter
    if (search) {
      qb.andWhere("LOWER(specialist.title) LIKE :search", {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [specialists, total] = await qb
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    if (!specialists.length) {
      res.json({
        data: [],
        meta: { total, page: pageNumber, limit: pageSize },
      });
      return;
    }

    res.json({
      data: specialists,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }
);

/**
 * GET SINGLE SPECIALIST WITH PLATFORM FEE
 */
export const getSpecialistById = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);
    const mediaRepo = AppDataSource.getRepository(Media);
    const platformFeeRepo = AppDataSource.getRepository(PlatformFee);

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .leftJoinAndSelect("specialist.service_offerings", "service_offerings")
      .leftJoinAndSelect(
        "service_offerings.service_offerings_master_list",
        "master_list"
      )
      .leftJoinAndSelect("specialist.created_by", "created_by")
      .leftJoinAndSelect("specialist.media", "media")
      .where("specialist.id = :id", { id: req.params.id });

    // User filtering: non-admin users can only see their own specialists
    const isAdmin =
      req.me?.role?.name === "Admin" || req.me?.role?.name === "Super Admin";
    if (!isAdmin && req.me) {
      qb.andWhere("specialist.created_by = :userId", { userId: req.me.id });
    }

    const specialist = await qb.getOne();

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    const platformFees = await platformFeeRepo.find();
    const tier = platformFees.find(
      (pf) =>
        specialist.base_price >= pf.min_value &&
        specialist.base_price <= pf.max_value
    );
    const platform_fee_amount = tier
      ? parseFloat(
          (
            (specialist.base_price * Number(tier.platform_fee_percentage)) /
            100
          ).toFixed(2)
        )
      : specialist.platform_fee || 0;

    res.json({
      ...specialist,

      platform_fee: platform_fee_amount,
    });
  }
);

/**
 * GET SPECIALIST BY SLUG
 */
export const getSpecialistBySlug = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);

    const platformFeeRepo = AppDataSource.getRepository(PlatformFee);

    const specialist = await specialistRepo.findOne({
      where: { slug: req.params.slug },
      relations: [
        "service_offerings",
        "service_offerings.service_offerings_master_list",
        "created_by",
        "media",
      ],
    });

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    const platformFees = await platformFeeRepo.find();
    const tier = platformFees.find(
      (pf) =>
        specialist.base_price >= pf.min_value &&
        specialist.base_price <= pf.max_value
    );
    const platform_fee_amount = tier
      ? parseFloat(
          (
            (specialist.base_price * Number(tier.platform_fee_percentage)) /
            100
          ).toFixed(2)
        )
      : specialist.platform_fee || 0;

    res.json({
      ...specialist,
      platform_fee: platform_fee_amount,
    });
  }
);

/**
 * GET ONLY PUBLISHED SPECIALISTS (for public view)
 */
export const getPublishedSpecialists = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);
    const mediaRepo = AppDataSource.getRepository(Media);
    const platformFeeRepo = AppDataSource.getRepository(PlatformFee);

    const {
      page = "1",
      limit = "10",
      sort_by = "created_at",
      sort_order = "DESC",
      min_price,
      max_price,
    } = req.query as {
      page?: string;
      limit?: string;
      sort_by?: string;
      sort_order?: string;
      min_price?: string;
      max_price?: string;
    };

    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Number(limit), 10);
    const skip = (pageNumber - 1) * pageSize;

    const sortColumnMap: Record<string, string> = {
      created_at: "specialist.created_at",
      price: "specialist.base_price",
      title: "specialist.title",
    };

    const sortColumn = sortColumnMap[sort_by] ?? sortColumnMap.created_at;
    const sortDirection = sort_order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .leftJoinAndSelect("specialist.media", "media")
      .where("specialist.verification_status = :status", {
        status: VerificationStatus.APPROVED,
      })
      .andWhere("specialist.is_draft = false")
      .orderBy(sortColumn, sortDirection)
      .addOrderBy("media.display_order", "ASC");

    const minPriceNumber =
      min_price !== undefined ? Number(min_price) : undefined;
    const maxPriceNumber =
      max_price !== undefined ? Number(max_price) : undefined;

    if (minPriceNumber !== undefined && !Number.isNaN(minPriceNumber)) {
      qb.andWhere("specialist.base_price >= :minPrice", {
        minPrice: minPriceNumber,
      });
    }

    if (maxPriceNumber !== undefined && !Number.isNaN(maxPriceNumber)) {
      qb.andWhere("specialist.base_price <= :maxPrice", {
        maxPrice: maxPriceNumber,
      });
    }

    const [specialists, total] = await qb
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    if (!specialists.length) {
      res.json({
        data: [],
        meta: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
      return;
    }

    const platformFees = await platformFeeRepo.find();

    const result = specialists.map((s) => {
      const tier = platformFees.find(
        (pf) => s.base_price >= pf.min_value && s.base_price <= pf.max_value
      );

      const platform_fee = tier
        ? Number(
            (
              (s.base_price * Number(tier.platform_fee_percentage)) /
              100
            ).toFixed(2)
          )
        : s.platform_fee || 0;

      return {
        ...s,

        platform_fee,
      };
    });

    res.json({
      data: result,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }
);

/**
 * UPDATE SPECIALIST DRAFT STATUS (Publish/Unpublish)
 */
export const updateSpecialistDraftStatus = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { is_draft } = req.body;

    if (typeof is_draft !== "boolean") {
      res.status(400).json({
        message: "is_draft must be a boolean value",
      });
      return;
    }

    const specialistRepo = AppDataSource.getRepository(Specialist);

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .where("specialist.id = :id", { id: req.params.id });

    // User filtering: non-admin users can only update their own specialists
    const isAdmin =
      req.me?.role?.name === "Admin" || req.me?.role?.name === "Super Admin";
    if (!isAdmin && req.me) {
      qb.andWhere("specialist.created_by = :userId", { userId: req.me.id });
    }

    const specialist = await qb.getOne();

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    specialist.is_draft = is_draft;

    await specialistRepo.save(specialist);

    res.json({
      message: "Draft status updated successfully",
      data: {
        id: specialist.id,
        is_draft: specialist.is_draft,
      },
    });
  }
);

/**
 * UPDATE SPECIALIST VERIFICATION STATUS (Admin only - Approve/Reject)
 */
export const updateSpecialistVerificationStatus = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { verification_status, is_verified } = req.body;

    if (
      verification_status &&
      !Object.values(VerificationStatus).includes(verification_status)
    ) {
      res.status(400).json({
        message: "Invalid verification_status",
      });
      return;
    }

    if (is_verified !== undefined && typeof is_verified !== "boolean") {
      res.status(400).json({
        message: "is_verified must be a boolean value",
      });
      return;
    }

    const specialistRepo = AppDataSource.getRepository(Specialist);

    const specialist = await specialistRepo.findOneBy({
      id: req.params.id,
    });

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    if (verification_status) {
      specialist.verification_status = verification_status;
    }

    if (is_verified !== undefined) {
      specialist.is_verified = is_verified;
    }

    await specialistRepo.save(specialist);

    res.json({
      message: "Verification status updated successfully",
      data: {
        id: specialist.id,
        verification_status: specialist.verification_status,
        is_verified: specialist.is_verified,
      },
    });
  }
);

/**
 * APPROVE SPECIALIST (Admin only)
 */
export const approveSpecialist = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);

    const specialist = await specialistRepo.findOneBy({
      id: req.params.id,
    });

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    specialist.verification_status = VerificationStatus.APPROVED;
    specialist.is_verified = true;

    await specialistRepo.save(specialist);

    res.json({
      message: "Specialist approved successfully",
      data: {
        id: specialist.id,
        verification_status: specialist.verification_status,
        is_verified: specialist.is_verified,
      },
    });
  }
);

/**
 * REJECT SPECIALIST (Admin only)
 */
export const rejectSpecialist = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);

    const specialist = await specialistRepo.findOneBy({
      id: req.params.id,
    });

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    specialist.verification_status = VerificationStatus.REJECTED;
    specialist.is_verified = false;

    await specialistRepo.save(specialist);

    res.json({
      message: "Specialist rejected successfully",
      data: {
        id: specialist.id,
        verification_status: specialist.verification_status,
        is_verified: specialist.is_verified,
      },
    });
  }
);

/**
 * DELETE SPECIALIST
 */
export const deleteSpecialist = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const specialistRepo = AppDataSource.getRepository(Specialist);
    const mediaRepo = AppDataSource.getRepository(Media);

    const qb = specialistRepo
      .createQueryBuilder("specialist")
      .where("specialist.id = :id", { id: req.params.id });

    const isAdmin =
      req.me?.role?.name === "Admin" || req.me?.role?.name === "Super Admin";

    if (!isAdmin && req.me) {
      qb.andWhere("specialist.created_by = :userId", { userId: req.me.id });
    }

    const specialist = await qb.getOne();

    if (!specialist) {
      res.status(404).json({ message: "Specialist not found" });
      return;
    }

    const mediaList = await mediaRepo.find({
      where: { specialists: { id: specialist.id } },
      select: ["id", "file_name"],
    });

    await specialistRepo.delete(specialist.id);

    const uploadDir = path.join(process.cwd(), "uploads");

    const failedDeletes: { file_name: string; reason: string }[] = [];

    await Promise.all(
      mediaList.map(async (m) => {
        const filePath = path.join(uploadDir, m.file_name);

        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          failedDeletes.push({
            file_name: m.file_name,
            reason: err?.code || "UNKNOWN",
          });
        }
      })
    );

    res.json({
      message: "Specialist deleted successfully",
      deleted_files: mediaList.map((m) => m.file_name),
      failed_file_deletes: failedDeletes,
    });
  }
);
