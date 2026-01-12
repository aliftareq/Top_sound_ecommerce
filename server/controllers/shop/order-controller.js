// @ts-nocheck
import paypal from "../../helpers/paypal.js";
import Order from "#models/Order";
import Cart from "#models/Cart";
import Product from "#models/Product";
import mongoose from "mongoose";
import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";

dotenv.config();

const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASS;
const is_live = false;

export const sslSuccess = (req, res) => {
  // SSLCommerz sends data via POST usually, so you may need app.post
  // for now just redirect frontend
  return res.redirect("http://localhost:5173/shop/SSL-return");
};

export const sslFail = (req, res) => {
  return res.redirect("http://localhost:5173/shop/payment-failed");
};

export const sslCancel = (req, res) => {
  return res.redirect("http://localhost:5173/shop/payment-cancelled");
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
    });

    await newlyCreatedOrder.save();

    // console.log(addressInfo);

    const data = {
      total_amount: totalAmount,
      currency: "BDT",
      tran_id: new mongoose.Types.ObjectId().toString(),
      success_url: "http://localhost:5000/api/shop/order/ssl-success",
      fail_url: "http://localhost:5000/api/shop/order/ssl-fail",
      cancel_url: "http://localhost:5000/api/shop/order/ssl-cancel",
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: "Customer Name",
      cus_email: "customer@example.com",
      cus_add1: addressInfo.address || "NULL",
      cus_add2: addressInfo.address || "NULL",
      cus_city: addressInfo.city || "NULL",
      cus_state: addressInfo.city || "NULL",
      cus_postcode: addressInfo.pincode || "1000",
      cus_country: "Bangladesh",
      cus_phone: addressInfo.phone || "NULL",
      cus_fax: addressInfo.phone || "NULL",
      ship_name: "Top_Sound",
      ship_add1: "gulistan shopping complex",
      ship_add2: "gulistan shopping complex",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };
    // console.log(data);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(data);

    const GatewayPageURL = apiResponse?.GatewayPageURL;
    if (!GatewayPageURL) {
      // mark failed
      await Order.findByIdAndUpdate(newlyCreatedOrder._id, {
        orderStatus: "FAILED",
        paymentStatus: "FAILED",
        orderUpdateDate: new Date(),
      });

      return res.status(500).json({
        success: false,
        message: "No Gateway URL",
      });
    }

    return res.status(201).json({
      success: true,
      url: GatewayPageURL,
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails };
