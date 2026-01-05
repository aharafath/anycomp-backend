import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ServiceOffering } from "./ServiceOffering";
import { User } from "./User";
import { Media } from "./Media";

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity("specialists")
export class Specialist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ default: true })
  is_draft: boolean;

  @Column({ type: "int", default: 0 })
  total_number_of_ratings: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  platform_fee: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  final_price: number;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verification_status: VerificationStatus;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: "int" })
  duration_days: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  created_by: User;

  @OneToMany(() => ServiceOffering, (offering) => offering.specialists)
  service_offerings: ServiceOffering[];

  @OneToMany(() => Media, (media) => media.specialists)
  media: Media[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
