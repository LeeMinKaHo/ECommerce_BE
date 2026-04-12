import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import categoryModel from "../module/product/model/category.model";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Ecommerce";

const categories = [
  { name: "T-Shirts" },
  { name: "Jeans" },
  { name: "Pants" },
  { name: "Shorts" },
  { name: "Hoodies" },
  { name: "Jackets" },
  { name: "Dresses" },
  { name: "Skirts" },
  { name: "Shoes" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await categoryModel.deleteMany({});
  console.log("🗑️  Cleared existing categories");

  const created = await categoryModel.insertMany(categories);
  created.forEach((c, i) => {
    console.log(`✅ [${i + 1}/${created.length}] Created category: ${c.name} (${c._id})`);
  });

  console.log(`\n🎉 Seeded ${created.length} categories successfully!`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed categories failed:", err);
  process.exit(1);
});
