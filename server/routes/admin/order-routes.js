import { Router } from "express";
import {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  createSteadfastParcelForOrder,
  syncSteadfastStatusForOrder,
} from "../../controllers/admin/order-controller.js";

const router = Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);

router.put("/update/:id", updateOrderStatus);
router.put("/update-payment/:id", updatePaymentStatus);

// ✅ Steadfast integration
router.post("/steadfast/create/:id", createSteadfastParcelForOrder);
router.post("/steadfast/sync/:id", syncSteadfastStatusForOrder);

export default router;

