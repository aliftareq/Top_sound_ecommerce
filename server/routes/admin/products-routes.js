import { Router } from "express";

import { handleImageUpload } from "../../controllers/admin/products-controller.js";

import { upload } from "../../helpers/cloudinary.js";


const router = Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);


export default router;  