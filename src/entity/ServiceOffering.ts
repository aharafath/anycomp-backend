import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Specialist } from "./Specialist";
import { ServiceOfferingsMasterList } from "./ServiceOfferingsMasterList";

@Entity("service_offerings")
export class ServiceOffering {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Specialist, (specialist) => specialist.service_offerings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "specialists" })
  specialists: Specialist;

  @ManyToOne(
    () => ServiceOfferingsMasterList,
    (master) => master.service_offerings,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "service_offerings_master_list_id" })
  service_offerings_master_list: ServiceOfferingsMasterList;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
