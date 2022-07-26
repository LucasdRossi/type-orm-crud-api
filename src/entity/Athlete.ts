import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./Company";
import { Min, IsInt } from "class-validator";

@Entity()
export class Athlete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Min(12)
  @IsInt()
  age: number;

  @ManyToOne(() => Company, (company) => company.athletes)
  company: Company;
}
