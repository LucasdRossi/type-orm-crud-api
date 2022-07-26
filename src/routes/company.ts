import { Handler, Response, Router } from "express";
import { Request } from "./types";
import { Company } from "../entity/Company";
import { companyRepository, athleteRepository } from "../data-source";
import {
  messageResponse,
  payloadResponse,
  validationResponse,
} from "../utils/response";
import { validate, isNumberString, isNumber, isEmpty } from "class-validator";
import { In } from "typeorm";

interface CreateBody {
  name?: string;
  description?: string;
}

export async function create(request: Request<CreateBody>, response: Response) {
  const { name, description } = request.body;

  if (isEmpty(name) || isEmpty(description)) {
    response.send(
      messageResponse({
        message: "Name and description are required",
        error: true,
      })
    );
    return;
  }

  const company = new Company();
  company.name = name;
  company.description = description;
  company.athletes = [];

  const errors = await validate(company);

  if (errors.length > 0) {
    response.send(validationResponse({ message: "Invalid company", errors }));
    return;
  }

  await companyRepository.save(company);

  return response.json(
    payloadResponse({ data: company, message: "Company created" })
  );
}

export async function getAll(request: Request, response: Response) {
  const companies = await companyRepository.find();

  return response.json(
    payloadResponse({ data: companies, message: "List of companies" })
  );
}

export async function getOne(request: Request, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send(
      messageResponse({
        message: "Id is required",
        error: true,
      })
    );
    return;
  }

  const id = Number(paramsId);

  const company = await companyRepository.findOne({
    where: { id },
    relations: ["athletes"],
  });

  if (!company) {
    response.send(
      messageResponse({
        message: `Company ${id} not found`,
        error: true,
      })
    );
    return;
  }

  return response.json(
    payloadResponse({ data: company, message: `Company ${id}` })
  );
}

interface UpdateBody extends CreateBody {
  athletes?: number[];
}

export async function update(request: Request<UpdateBody>, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send(
      messageResponse({
        message: "Id is required",
        error: true,
      })
    );
    return;
  }

  const id = Number(paramsId);

  const { name, description, athletes } = request.body;

  if (isEmpty(name) || isEmpty(description)) {
    response.send(
      messageResponse({
        message: "Name and description are required",
        error: true,
      })
    );
    return;
  }

  const company = await companyRepository.findOneBy({ id: Number(id) });

  if (!company) {
    response.send(
      messageResponse({
        message: `Company ${id} not found`,
        error: true,
      })
    );
    return;
  }

  company.name = name;
  company.description = description;
  if (athletes) {
    company.athletes = await athleteRepository.findBy({
      id: In(athletes),
    });
  }

  const errors = await validate(company);

  if (errors.length > 0) {
    response.send(validationResponse({ message: "Invalid company", errors }));
    return;
  }

  await companyRepository.save(company);

  return response.json(
    payloadResponse({ data: company, message: "Company updated" })
  );
}

export async function remove(request: Request, response: Response) {
  const { id: paramsId } = request.params;

  if (!isNumberString(paramsId)) {
    response.send(
      messageResponse({
        message: "Id is required",
        error: true,
      })
    );
    return;
  }

  const id = Number(paramsId);

  const company = await companyRepository.findOneBy({ id: Number(id) });

  if (!company) {
    response.send(
      messageResponse({
        message: `Company ${id} not found`,
        error: true,
      })
    );
    return;
  }

  await companyRepository.delete({ id });

  return response.json(
    payloadResponse({ data: company, message: "Company removed" })
  );
}

export default (basePath: string, privateHandler: Handler) =>
  Router()
    .post(basePath, privateHandler, create)
    .get(basePath, getAll)
    .get(`${basePath}/:id`, getOne)
    .put(`${basePath}/:id`, privateHandler, update)
    .delete(`${basePath}/:id`, privateHandler, remove);
