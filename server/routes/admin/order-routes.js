import { Router } from "express";
import {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus, // ✅ import
} from "../../controllers/admin/order-controller.js";

const router = Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);
router.put("/update-payment/:id", updatePaymentStatus);

export default router;
