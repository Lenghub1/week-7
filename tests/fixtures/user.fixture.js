import { faker } from "@faker-js/faker";
import User from "../../src/models/user.model";
import request from "supertest";
import app from "../../src/app";

export const login = async ({ email, password }) => {
  const res = await request(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

  return res.body.data.accessToken;
};

export const insertOneUser = async () => {
  return await User.create({
    firstName: faker.person.firstName().replace(/\W/g, ""),
    lastName: faker.person.lastName().replace(/\W/g, ""),
    email: faker.person.firstName() + faker.string.nanoid() + "@test.com",
    password: "Password@123",
    slug: faker.string.uuid(),
    role: "user",
  });
};
