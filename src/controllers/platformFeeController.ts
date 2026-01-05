import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { AppDataSource } from "../data-source";
import { PlatformFee, TierName } from "../entity/PlatformFee";

/**
 * CREATE PLATFORM FEE
 */
export const createPlatformFee = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { tier_name, min_value, max_value, platform_fee_percentage } =
      req.body;

    if (
      !tier_name ||
      min_value === undefined ||
      max_value === undefined ||
      platform_fee_percentage === undefined
    ) {
      res.status(400).json({
        message:
          "tier_name, min_value, max_value and platform_fee_percentage are required",
      });
      return;
    }

    const repo = AppDataSource.getRepository(PlatformFee);

    // optional: same tier duplicate prevent
    const exists = await repo.findOneBy({ tier_name });
    if (exists) {
      res
        .status(409)
        .json({ message: "Platform fee for this tier already exists" });
      return;
    }

    const fee = repo.create({
      tier_name: tier_name as TierName,
      min_value,
      max_value,
      platform_fee_percentage,
    });

    await repo.save(fee);

    res.status(201).json({
      message: "Platform fee created successfully",
      data: fee,
    });
  }
);

/**
 * GET ALL PLATFORM FEES
 */
export const getAllPlatformFees = expressAsyncHandler(
  async (_req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(PlatformFee);

    const data = await repo.find({
      order: { created_at: "DESC" },
    });

    res.json(data);
  }
);

/**
 * GET SINGLE PLATFORM FEE
 */
export const getPlatformFeeById = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(PlatformFee);

    const fee = await repo.findOneBy({ id: req.params.id });

    if (!fee) {
      res.status(404).json({ message: "Platform fee not found" });
      return;
    }

    res.json(fee);
  }
);

/**
 * UPDATE PLATFORM FEE
 */
export const updatePlatformFee = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { tier_name, min_value, max_value, platform_fee_percentage } =
      req.body;

    const repo = AppDataSource.getRepository(PlatformFee);

    const fee = await repo.findOneBy({ id: req.params.id });

    if (!fee) {
      res.status(404).json({ message: "Platform fee not found" });
      return;
    }

    if (tier_name) fee.tier_name = tier_name as TierName;
    if (min_value !== undefined) fee.min_value = min_value;
    if (max_value !== undefined) fee.max_value = max_value;
    if (platform_fee_percentage !== undefined)
      fee.platform_fee_percentage = platform_fee_percentage;

    await repo.save(fee);

    res.json({
      message: "Platform fee updated successfully",
      data: fee,
    });
  }
);

/**
 * DELETE PLATFORM FEE
 */
export const deletePlatformFee = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(PlatformFee);

    const fee = await repo.findOneBy({ id: req.params.id });

    if (!fee) {
      res.status(404).json({ message: "Platform fee not found" });
      return;
    }

    await repo.remove(fee);

    res.json({ message: "Platform fee deleted successfully" });
  }
);
