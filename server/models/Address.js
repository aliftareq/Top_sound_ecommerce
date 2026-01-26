import { Schema, model } from "mongoose";

const AddressSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    thana: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Address = model("Address", AddressSchema);
export default Address;
