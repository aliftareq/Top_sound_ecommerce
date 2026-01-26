import { Schema, model } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      mainImage: String,
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    fullAddress: String,
    phone: String,
    notes: String,
  },

  orderStatus: { type: String, default: "pending" },
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  steadfast: {
    invoice: { type: String },
    consignmentId: { type: Number },
    trackingCode: { type: String },
    deliveryStatus: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    lastSyncAt: { type: Date },
  },
});

const Order = model("Order", OrderSchema);
export default Order;
