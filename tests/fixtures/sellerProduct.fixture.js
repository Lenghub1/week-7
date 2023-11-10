import { faker } from "@faker-js/faker";
import Product from "../../src/models/product.model.js";

const productUnits = Product.schema.path("unit").enumValues;
export const categories = ["waterplant", "landplant", "tools", "fruit"];

function _chooseRandomPrice(min, max) {
  const randomDecimal = Math.random();
  // Scale the random decimal to the range between min and max
  const randomInRange = randomDecimal * (max - min) + min;
  // Round the result to avoid floating-point precision issues
  const randomPrice = Math.round(randomInRange / 100) * 100;

  return randomPrice;
}

export const insertManyProducts = async (n) => {
  const products = [];
  for (let i = 0; i < n; i++) {
    products.push({
      title: faker.commerce.productName(),
      slug: faker.string.uuid(),
      description: faker.commerce.productDescription(),
      unitPrice: _chooseRandomPrice(10000, 100000),
      unit: faker.helpers.arrayElement(productUnits),
      availableStock: faker.number.int(100),
      media: [faker.airline.aircraftType()],
      categories: faker.helpers.arrayElements(categories, {
        min: 1,
        max: 3,
      }),
    });
  }
  await Product.insertMany(products);
};
