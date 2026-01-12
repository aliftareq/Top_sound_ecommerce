import { Router } from "express";

import { createOrder, getAllOrdersByUser, getOrderDetails, capturePayment, sslSuccess, sslFail, sslCancel } from "../../controllers/shop/order-controller.js";

const router = Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

router.post("/ssl-success", sslSuccess);
router.post("/ssl-fail", sslFail);
router.post("/ssl-cancel", sslCancel);

export default router;