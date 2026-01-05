import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AppDataSource } from "../data-source";
import { ServiceOfferingsMasterList } from "../entity/ServiceOfferingsMasterList";

/**
 * GET ALL SERVICE OFFERINGS MASTER LIST
 */
export const getAllServiceOfferingsMasterList = expressAsyncHandler(
  async (_req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(ServiceOfferingsMasterList);
    const data = await repo.find({
      order: { created_at: "DESC" },
    });

    res.json(data);
  }
);

/**
 * GET SINGLE SERVICE OFFERING MASTER LIST
 */
export const getServiceOfferingMasterListById = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(ServiceOfferingsMasterList);
    const item = await repo.findOneBy({ id: req.params.id });

    if (!item) {
      res
        .status(404)
        .json({ message: "Service offering master list item not found" });
      return;
    }

    res.json(item);
  }
);

/**
 * CREATE SERVICE OFFERING MASTER LIST (Admin only)
 */
export const createServiceOfferingMasterList = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const file = (req.file as Express.Multer.File | undefined) || undefined;
    const { title, description, s3_key, bucket_name } = req.body;
    const finalBucket = bucket_name || "uploads";

    if (!title || !description) {
      res
        .status(400)
        .json({ message: "title and description are required" });
      return;
    }

    const repo = AppDataSource.getRepository(ServiceOfferingsMasterList);
    const item = await repo.save(
      repo.create({
        title,
        description,
        s3_key: file?.filename || s3_key || null,
        bucket_name: finalBucket,
      })
    );

    res.status(201).json({
      message: "Service offering master list item created successfully",
      data: item,
    });
  }
);

/**
 * UPDATE SERVICE OFFERING MASTER LIST (Admin only)
 */
export const updateServiceOfferingMasterList = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const file = (req.file as Express.Multer.File | undefined) || undefined;
    const { title, description, s3_key, bucket_name } = req.body;

    const repo = AppDataSource.getRepository(ServiceOfferingsMasterList);
    const item = await repo.findOneBy({ id: req.params.id });

    if (!item) {
      res
        .status(404)
        .json({ message: "Service offering master list item not found" });
      return;
    }

    if (title) item.title = title;
    if (description) item.description = description;
    if (file) {
      item.s3_key = file.filename;
      item.bucket_name = bucket_name || item.bucket_name || "uploads";
    } else if (s3_key !== undefined) {
      item.s3_key = s3_key;
    }
    if (bucket_name) item.bucket_name = bucket_name;

    await repo.save(item);

    res.json({
      message: "Service offering master list item updated successfully",
      data: item,
    });
  }
);

/**
 * DELETE SERVICE OFFERING MASTER LIST (Admin only)
 */
export const deleteServiceOfferingMasterList = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(ServiceOfferingsMasterList);
    const item = await repo.findOneBy({ id: req.params.id });

    if (!item) {
      res
        .status(404)
        .json({ message: "Service offering master list item not found" });
      return;
    }

    await repo.delete(item.id);

    res.json({
      message: "Service offering master list item deleted successfully",
    });
  }
);
