import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Athlete } from "./Athlete";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Athlete, (athlete) => athlete.company)
  athletes: Athlete[];
}
