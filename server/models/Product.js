import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    mainImage: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],

    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    offerPrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true },
);

const Product = model("Product", ProductSchema);
export default Product;
