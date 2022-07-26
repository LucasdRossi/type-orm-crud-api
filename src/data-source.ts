import "reflect-metadata";
import { DataSource } from "typeorm";
import { Athlete } from "./entity/Athlete";
import { Company } from "./entity/Company";
import { User } from "./entity/User";

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [User, Company, Athlete],
  migrations: [],
  subscribers: [],
});

export const userRepository = AppDataSource.getRepository(User);

export const companyRepository = AppDataSource.getRepository(Company);

export const athleteRepository = AppDataSource.getRepository(Athlete);

export default AppDataSource;
