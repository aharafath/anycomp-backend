import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Specialist } from "./Specialist";

export enum MediaType {
  THUMBNAIL = "THUMBNAIL",
  BANNER = "BANNER",
  GALLERY = "GALLERY",
  ICON = "ICON",
  AVATAR = "AVATAR",
}

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Specialist, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "specialists" })
  specialists: Specialist | null;

  @Column()
  file_name: string;

  @Column()
  file_size: number;

  @Column({ default: 0 })
  display_order: number;

  @Column()
  mime_type: string;

  @Column({ type: "enum", enum: MediaType })
  media_type: MediaType;

  @Column()
  uploaded_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
