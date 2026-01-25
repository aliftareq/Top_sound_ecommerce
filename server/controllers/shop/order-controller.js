// @ts-nocheck
import Order from "#models/Order";
import Cart from "#models/Cart";
import Product from "#models/Product";
import mongoose from "mongoose";

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
    });

    await newlyCreatedOrder.save();

    // ✅ Remove only ordered items from cart
    if (cartId && cartItems?.length) {
      const cart = await Cart.findById(cartId);

      if (cart) {
        const orderedProductIds = new Set(
          cartItems.map((item) => String(item.productId)),
        );

        cart.items = cart.items.filter(
          (cartItem) => !orderedProductIds.has(String(cartItem.productId)),
        );

        // ✅ If cart is empty, delete it
        if (cart.items.length === 0) {
          await Cart.findByIdAndDelete(cartId);
        } else {
          await cart.save();
        }
      }
    }

    return res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      data: newlyCreatedOrder,
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

export { createOrder, getAllOrdersByUser, getOrderDetails };
