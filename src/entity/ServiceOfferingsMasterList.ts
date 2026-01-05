import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ServiceOffering } from "./ServiceOffering";

@Entity("service_offerings_master_list")
export class ServiceOfferingsMasterList {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", nullable: true })
  s3_key: string | null;

  @Column()
  bucket_name: string;

  @OneToMany(
    () => ServiceOffering,
    (offering) => offering.service_offerings_master_list
  )
  service_offerings: ServiceOffering[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
