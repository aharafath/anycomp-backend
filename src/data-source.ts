import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Specialist } from "./entity/Specialist";
import { ServiceOffering } from "./entity/ServiceOffering";
import { ServiceOfferingsMasterList } from "./entity/ServiceOfferingsMasterList";
import { Media } from "./entity/Media";
import { PlatformFee } from "./entity/PlatformFee";
import { User } from "./entity/User";
import { Role } from "./entity/Role";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "anycomp_db",
  synchronize: process.env.SYNCHRONIZE === "true",

  //SSL For Neon Db
  ssl: process.env.DB_SSL === "true",
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  logging: false,
  entities: [
    Specialist,
    ServiceOffering,
    ServiceOfferingsMasterList,
    Media,
    PlatformFee,
    User,
    Role,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
