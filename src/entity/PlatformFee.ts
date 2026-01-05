import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum TierName {
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

@Entity("platform_fee")
export class PlatformFee {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: TierName,
  })
  tier_name: TierName;

  @Column({ type: "int" })
  min_value: number;

  @Column({ type: "int" })
  max_value: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  platform_fee_percentage: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
