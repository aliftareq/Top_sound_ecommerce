import Order from "#models/Order";
import {
  steadfastCreateOrder,
  steadfastStatusByInvoice,
} from "../../helpers/steadfast_service.js";

/**
 * GET /admin/orders/get
 */
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

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

/**
 * GET /admin/orders/details/:id
 */
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("userId");

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

/**
 * PUT /admin/orders/update/:id
 * body: { orderStatus }
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    await Order.findByIdAndUpdate(id, {
      orderStatus,
      orderUpdateDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

/**
 * PUT /admin/orders/update-payment/:id
 * body: { paymentStatus }
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    await Order.findByIdAndUpdate(id, {
      paymentStatus,
      orderUpdateDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Payment status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

/**
 * POST /admin/orders/steadfast/create/:id
 * body: { recipient_name? , delivery_type? }
 *
 * Rules:
 * - order must be confirmed (you will set orderStatus="confirmed" using update route)
 * - only create once
 */
const createSteadfastParcelForOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipient_name, delivery_type } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    if (order.orderStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Order must be confirmed before sending to Steadfast.",
      });
    }

    if (order?.steadfast?.trackingCode) {
      return res.status(400).json({
        success: false,
        message: "This order is already sent to Steadfast.",
      });
    }

    // ✅ invoice must be unique
    const invoice = order._id.toString();

    // ✅ recipient name
    const finalRecipientName = (recipient_name || "Customer").trim();

    // ✅ sanitize phone for steadfast (only digits, 11 digits, starts with 01)
    let phone = (order.addressInfo?.phone || "").trim();
    phone = phone.replace(/\D/g, ""); // remove -, space, +, etc.

    // if user typed +88 / 88 country code (8801XXXXXXXXX)
    if (phone.startsWith("88") && phone.length === 13) {
      phone = phone.slice(2);
    }

    if (phone.length !== 11 || !phone.startsWith("01")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Use 11 digits like 01XXXXXXXXX",
        data: {
          original: order.addressInfo?.phone,
          sanitized: phone,
        },
      });
    }

    // ✅ address validation (steadfast needs it)
    const address = (order.addressInfo?.fullAddress || "").trim();
    if (!address || address.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Recipient address is required.",
      });
    }

    // ✅ COD logic (recommended)
    // If already PAID, send cod_amount = 0
    const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";
    const isCOD = (order.paymentMethod || "").toLowerCase().includes("cash");
    const codAmount = !isPaid && isCOD ? Number(order.totalAmount || 0) : 0;

    const payload = {
      invoice,
      recipient_name: finalRecipientName,
      recipient_phone: phone, // ✅ fixed
      recipient_address: address,
      cod_amount: codAmount, // ✅ fixed (number is ok)
      note: (order.addressInfo?.notes || "").trim(),
      item_description: (order.cartItems || [])
        .map((i) => `${i.title} x${i.quantity}`)
        .join(", "),
      delivery_type: typeof delivery_type === "number" ? delivery_type : 0,
    };

    const result = await steadfastCreateOrder(payload);

    if (result?.status !== 200) {
      return res.status(400).json({
        success: false,
        message: "Steadfast create_order failed!",
        data: result,
      });
    }

    const c = result.consignment;

    order.steadfast = {
      invoice: c.invoice,
      consignmentId: c.consignment_id,
      trackingCode: c.tracking_code,
      deliveryStatus: c.status, // typically "in_review"
      createdAt: c.created_at ? new Date(c.created_at) : new Date(),
      updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
      lastSyncAt: new Date(),
    };

    // your internal status change after handing over to courier
    order.orderStatus = "shipped";
    order.orderUpdateDate = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Steadfast parcel created successfully!",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: e.message || "Some error occured!" });
  }
};


/**
 * POST /admin/orders/steadfast/sync/:id
 * Sync latest delivery_status into DB
 */
const syncSteadfastStatusForOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    if (!order?.steadfast?.invoice) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This order has no Steadfast invoice yet.",
        });
    }

    const statusRes = await steadfastStatusByInvoice(order.steadfast.invoice);

    if (statusRes?.status !== 200) {
      return res.status(400).json({
        success: false,
        message: "Steadfast status fetch failed!",
        data: statusRes,
      });
    }

    const deliveryStatus = statusRes.delivery_status;

    order.steadfast.deliveryStatus = deliveryStatus;
    order.steadfast.lastSyncAt = new Date();
    order.orderUpdateDate = new Date();

    // Optional mapping courier status -> your orderStatus
    if (deliveryStatus === "delivered") order.orderStatus = "delivered";
    if (deliveryStatus === "cancelled") order.orderStatus = "cancelled";
    if (deliveryStatus === "hold") order.orderStatus = "hold";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Steadfast status synced!",
      data: {
        orderId: order._id,
        deliveryStatus,
        orderStatus: order.orderStatus,
        steadfast: order.steadfast,
      },
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ success: false, message: e.message || "Some error occured!" });
  }
};

export {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus,

  // ✅ new
  createSteadfastParcelForOrder,
  syncSteadfastStatusForOrder,
};
