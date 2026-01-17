import Product from "#models/Product";
import { imageUploadUtil } from "../../helpers/cloudinary.js";

//upload images
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

// add a new product
const addProduct = async (req, res) => {
  try {
    const {
      mainImage,
      images = [], // default empty array if not sent
      title,
      description,
      category,
      brand,
      price,
      offerPrice,   
      totalStock,
      averageReview,
    } = req.body;

    const newlyCreatedProduct = new Product({
      mainImage,
      images,
      title,
      description,
      category,
      brand,
      price,
      offerPrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};


//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

// edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      mainImage,
      images,
      title,
      description,
      category,
      brand,
      price,
      offerPrice,
      totalStock,
      averageReview,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // SAME FORMAT
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.offerPrice =
      offerPrice === "" ? 0 : offerPrice || findProduct.offerPrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.averageReview =
      averageReview || findProduct.averageReview;

    // Images (safe)
    findProduct.mainImage = mainImage || findProduct.mainImage;
    findProduct.images =
      images !== undefined ? images : findProduct.images;

    await findProduct.save();

    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};


//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

export {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
