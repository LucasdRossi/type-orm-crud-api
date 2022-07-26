import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { MinLength, IsEmail } from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @MinLength(5)
  password: string;
}
