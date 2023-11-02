/**
 * @fileoverview Use this file to create dummy data for development/testing purposes
 */

import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Product from "../../src/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI_DEV).then(() => {
  console.log("DB connection open for seeding...");
});

function generateSeedProducts(n) {
  const productUnits = Product.schema.path("unit").enumValues;
  let products = [];

  function chooseRandomUnit() {
    const randomIndex = Math.floor(Math.random() * productUnits.length);
    const randomProductUnit = productUnits[randomIndex];
    return randomProductUnit;
  }

  function chooseRandomPrice(min, max) {
    const randomDecimal = Math.random();
    // Scale the random decimal to the range between min and max
    const randomInRange = randomDecimal * (max - min) + min;
    // Round the result to avoid floating-point precision issues
    const randomPrice = Math.round(randomInRange / 100) * 100;

    return randomPrice;
  }

  for (let i = 0; i < n; i++) {
    const product = new Product({
      title: faker.animal.cow(),
      description: faker.lorem.paragraphs(),
      unit: chooseRandomUnit(),
      unitPrice: chooseRandomPrice(1000, 1000000),
    });
    products.push(product);
  }

  return products;
}

async function seedDB() {
  try {
    const seedProducts = generateSeedProducts(10000);
    await Product.deleteMany();
    await Product.insertMany(seedProducts);
  } catch (error) {
    console.log("Error:..... ", error);
  }
}

seedDB()
  .then(() => {
    return mongoose.connection.close();
  })
  .then(() => {
    console.log("DB seeding done. Closed DB connection...");
  });
