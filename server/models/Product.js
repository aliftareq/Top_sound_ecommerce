import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    OfferPrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

const Product = model("Product", ProductSchema);
export default Product;
