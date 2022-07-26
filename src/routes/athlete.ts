import { Response, Router, Handler } from "express";
import { Request } from "./types";
import { Athlete } from "../entity/Athlete";
import { athleteRepository, companyRepository } from "../data-source";
import {
  messageResponse,
  payloadResponse,
  validationResponse,
} from "../utils/response";
import { validate, isNumberString, isNumber, isEmpty } from "class-validator";

interface CreateBody {
  firstName?: string;
  lastName?: string;
  age?: number;
}

export async function create(request: Request<CreateBody>, response: Response) {
  const { age, firstName, lastName } = request.body;

  if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(age)) {
    response.send(
      messageResponse({
        message: "First name, last name and age are required",
        error: true,
      })
    );
    return;
  }

  const athlete = new Athlete();
  athlete.firstName = firstName;
  athlete.lastName = lastName;
  athlete.age = age;

  const errors = await validate(athlete);

  if (errors.length > 0) {
    response.send(validationResponse({ message: "Invalid athlete", errors }));
    return;
  }

  await athleteRepository.save(athlete);

  return response.json(
    payloadResponse({ data: athlete, message: "Athlete created" })
  );
}

export async function getAll(request: Request, response: Response) {
  const athletes = await athleteRepository.find();

  return response.json(
    payloadResponse({ data: athletes, message: "List of athletes" })
  );
}

export async function getOne(request: Request, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send(messageResponse({ message: "Id is required", error: true }));
    return;
  }

  const id = Number(paramsId);

  const athlete = await athleteRepository.findOne({
    where: { id },
    relations: ["company"],
  });

  if (!athlete) {
    response.send(
      messageResponse({ message: "Athlete not found", error: true })
    );
    return;
  }

  return response.json(
    payloadResponse({ data: athlete, message: `Athlete ${id}` })
  );
}

interface UpdateBody extends CreateBody {
  companyId?: number;
}

export async function update(request: Request<UpdateBody>, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send("Id is required");
    return;
  }

  const id = Number(paramsId);

  const { firstName, lastName, age, companyId } = request.body;

  const athlete = await athleteRepository.findOneBy({
    id,
  });

  if (!athlete) {
    response.send(
      messageResponse({ message: "Athlete not found", error: true })
    );
    return;
  }

  if (companyId && !isNumber(companyId)) {
    response.send(
      messageResponse({ message: "Company id is invalid", error: true })
    );
    return;
  }

  const company =
    companyId !== athlete.company?.id
      ? await companyRepository.findOneBy({ id: companyId })
      : athlete.company;

  if (companyId && !isNaN(companyId) && !company) {
    response.send(
      messageResponse({ message: "Company not found", error: true })
    );
    return;
  }

  athlete.firstName = firstName ?? athlete.firstName;
  athlete.lastName = lastName ?? athlete.lastName;
  athlete.age = age ?? athlete.age;
  athlete.company = company;

  const errors = await validate(athlete);

  if (errors.length > 0) {
    response.send(validationResponse({ message: "Invalid athlete", errors }));
    return;
  }

  await athleteRepository.update({ id }, athlete);

  return response.json(
    payloadResponse({ data: athlete, message: "Athlete updated" })
  );
}

export async function remove(request: Request, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send(messageResponse({ message: "Id is required", error: true }));
    return;
  }

  const id = Number(paramsId);

  const athlete = await athleteRepository.findOneBy({ id });

  if (!athlete) {
    response.send(
      messageResponse({ message: "Athlete not found", error: true })
    );
    return;
  }

  await athleteRepository.delete({ id });

  return response.json(
    messageResponse({ message: `Athlete ${id} removed`, error: false })
  );
}

export default (basePath: string, privateHandler: Handler) =>
  Router()
    .post(basePath, privateHandler, create)
    .get(basePath, getAll)
    .get(`${basePath}/:id`, getOne)
    .put(`${basePath}/:id`, privateHandler, update)
    .delete(`${basePath}/:id`, privateHandler, remove);
