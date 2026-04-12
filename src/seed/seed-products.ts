import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import categoryModel from "../module/product/model/category.model";
import productModel from "../module/product/model/product.model";
import userModel from "../module/user/model/user.model";
import { userRole } from "../module/user/user.types";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Ecommerce";

// ✅ Real images from Unsplash (public)
const images = {
  whiteTshirt: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  blackTshirt: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
  blueTshirt:  "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600",
  blackJeans:  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
  blueJeans:   "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600",
  hoodie:      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
  whiteSneak:  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await productModel.deleteMany({});
  console.log("🗑️  Cleared existing products");

  const categories = await categoryModel.find({}).lean();
  const adminUser = await userModel.findOne({ role: userRole.Admin }).lean();

  if (!categories.length || !adminUser) {
    console.error("❌ Categories or Admin user missing!");
    process.exit(1);
  }

  const getCat = (name: string) => 
    categories.find(c => c.name.toLowerCase() === name.toLowerCase())?._id.toString() || categories[0]._id.toString();

  const products = [
    {
      name: "Standard Essential Tee",
      description: "A comfortable 100% cotton t-shirt for everyday wear.",
      price: 25,
      categoryId: getCat("t-shirts"),
      colorVariants: [
        {
          color: "White",
          imageUrls: [images.whiteTshirt],
          sizes: [
            { size: "S", quantity: 50 },
            { size: "M", quantity: 80 },
            { size: "L", quantity: 40 }
          ]
        },
        {
          color: "Black",
          imageUrls: [images.blackTshirt],
          sizes: [
            { size: "M", quantity: 60 },
            { size: "L", quantity: 60 }
          ]
        }
      ]
    },
    {
      name: "Urban Denim Jeans",
      description: "Stylish slim-fit denim jeans with premium finish.",
      price: 65,
      categoryId: getCat("jeans"),
      colorVariants: [
        {
          color: "Blue",
          imageUrls: [images.blueJeans],
          sizes: [
            { size: "29", quantity: 20 },
            { size: "30", quantity: 30 },
            { size: "32", quantity: 15 }
          ]
        },
        {
          color: "Black",
          imageUrls: [images.blackJeans],
          sizes: [
            { size: "30", quantity: 25 },
            { size: "31", quantity: 25 }
          ]
        }
      ]
    }
    // ... Thêm tiếp các sản phẩm khác tương tự
  ];

  for (const p of products) {
    const totalQty = p.colorVariants.reduce((sum, cv) => 
      sum + cv.sizes.reduce((sSum, s) => sSum + s.quantity, 0), 0
    );

    await productModel.create({
      ...p,
      createBy: adminUser._id,
      quantity: totalQty,
      defaultImage: p.colorVariants[0].imageUrls[0],
      rating: 4.5,
      totalReview: 10,
      quantitySold: 0
    });
    console.log(`✅ Created: ${p.name}`);
  }

  console.log("\n🎉 Seeded products with optimized structure!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
