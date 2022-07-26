import { Request as ExRequest } from "express";
import { User } from "../entity/User";

type Params = {
  [key: string]: string | number | string[];
};

export interface Request<B = {}, P = Params> extends ExRequest<P, any, B> {
  user?: Omit<User, "password">;
}
