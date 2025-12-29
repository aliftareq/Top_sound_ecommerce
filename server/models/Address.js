import { Schema, model } from "mongoose";

const AddressSchema = new Schema(
  {
    userId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

const Address =  model("Address", AddressSchema);
export default Address;