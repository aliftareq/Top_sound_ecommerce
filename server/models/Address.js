import { Schema, model } from "mongoose";

const AddressSchema = new Schema(
  {
    userId: String,
    fullAddress: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

const Address =  model("Address", AddressSchema);
export default Address;