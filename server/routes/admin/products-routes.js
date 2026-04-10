import { Router } from "express";
import multer from "multer";
import {
  handleImageUpload,
  addProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "../../controllers/admin/products-controller.js";

// Set up memory storage for multer
const storage = multer.memoryStorage();

// Initialize multer with limits for file size
const upload = multer({
  storage,
  limits: {
    fileSize: 32 * 1024 * 1024, // 32MB file size limit
  },
});

const router = Router();

// Updated upload route, following the structure of the 2nd example
router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

export default router;
