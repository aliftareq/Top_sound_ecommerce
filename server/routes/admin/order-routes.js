import { Router } from "express";
import {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderPrice,
  createSteadfastParcelForOrder,
  syncSteadfastStatusForOrder,
  deleteOrderForAdmin, // 👈 add this
} from "../../controllers/admin/order-controller.js";

const router = Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);

// Order updates
router.put("/update/:id", updateOrderStatus);
router.put("/update-payment/:id", updatePaymentStatus);
router.put("/update-price/:id", updateOrderPrice);

// 🗑️ Delete order
router.delete("/delete/:id", deleteOrderForAdmin);

// ✅ Steadfast integration
router.post("/steadfast/create/:id", createSteadfastParcelForOrder);
router.post("/steadfast/sync/:id", syncSteadfastStatusForOrder);

export default router;
