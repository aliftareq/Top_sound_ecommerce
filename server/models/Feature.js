import { Schema, model } from "mongoose";

const FeatureSchema = new Schema(
  {
    image: String,
  },
  { timestamps: true }
);

const Feature = model("Feature", FeatureSchema);
export default Feature;
