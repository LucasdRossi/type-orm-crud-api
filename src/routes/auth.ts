import { Response, Router } from "express";
import { User } from "../entity/User";
import { userRepository } from "../data-source";
import jwt from "jsonwebtoken";
import { Request } from "./types";
import {
  authResponse,
  messageResponse,
  validationResponse,
} from "../utils/response";
import { validate, isEmpty } from "class-validator";

interface AuthBody {
  email: string;
  password: string;
}

export async function register(request: Request<AuthBody>, response: Response) {
  const { email, password } = request.body;

  if (isEmpty(email) || isEmpty(password)) {
    response.send(
      messageResponse({
        error: true,
        message: "Email and password are required",
      })
    );
    return;
  }

  const user = new User();
  user.email = email;
  user.password = password;

  const errors = await validate(user);

  if (errors.length > 0) {
    response.send(validationResponse({ message: "Invalid user", errors }));
    return;
  }

  await userRepository.save(user);

  return response.json(
    messageResponse({ error: false, message: "User created" })
  );
}

export async function login(request: Request<AuthBody>, response: Response) {
  const { email, password } = request.body;

  if (isEmpty(email) || isEmpty(password)) {
    response.send(
      messageResponse({
        error: true,
        message: "Email and password are required",
      })
    );
    return;
  }

  const user = await userRepository.findOneBy({ email });

  if (!user) {
    response.json(authResponse({ auth: false, message: "Invalid login" }));
    return;
  }

  if (user.password !== password) {
    response.json(authResponse({ auth: false, message: "Invalid login" }));
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "60s",
  });

  return response.json(
    authResponse({ auth: true, token, message: "Login success" })
  );
}

export function verifyToken(
  request: Request,
  response: Response,
  next: Function
) {
  const token = request.headers["x-access-token"];

  if (!token) {
    response.send(authResponse({ message: "No token provided", auth: false }));
    return;
  }

  jwt.verify(
    String(token),
    process.env.JWT_SECRET,
    (err, decoded: { id: number }) => {
      if (err) {
        response.send(authResponse({ message: "Invalid token", auth: false }));
        return;
      }

      userRepository.findOneBy({ id: decoded.id }).then((user) => {
        request.user = user;
        next();
      });
    }
  );
}

export default (basePath: string) =>
  Router()
    .post(`${basePath}/register`, register)
    .post(`${basePath}/login`, login);
