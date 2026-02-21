import { Router } from "express";
import {
  getFilteredProducts,
  getProductDetails,
  getProductsByIds,
} from "../../controllers/shop/products-controller.js";

const router = Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.post("/get-by-ids", getProductsByIds);

export default router;
