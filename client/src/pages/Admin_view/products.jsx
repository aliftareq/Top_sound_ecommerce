import CommonForm from "@/components/Common_components/Form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ProductImageUpload from "../../components/Admin_components/image-upload.jsx";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice/index.js";
import { toast } from "sonner";
import AdminProductTile from "@/components/Admin_components/product-tile.jsx";

const initialFormData = {
  mainImage: "",
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  offerPrice: "",
  totalStock: "",
  averageReview: 0,
};

const AdminProducts = () => {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainUploadedImageUrl, setMainUploadedImageUrl] = useState("");
  const [mainimageLoadingState, setMainImageLoadingState] = useState(false);

  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryUploadedUrls, setGalleryUploadedUrls] = useState([]);
  const [galleryLoadingState, setGalleryLoadingState] = useState(false);

  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();

  const onSubmit = (event) => {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          }),
        ).then((data) => {
          console.log(data, "edit");

          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            mainImage: mainUploadedImageUrl,
            images: galleryUploadedUrls,
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            // reset everything
            setMainImageFile(null);
            setMainUploadedImageUrl("");
            setGalleryImageFiles([]);
            setGalleryUploadedUrls([]);
            setFormData(initialFormData);

            toast.success("Product added successfully");
          }
        });
  };

  const handleDelete = (getCurrentProductId) => {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast.success("Product deleted successfully");
      }
    });
  };

  const isFormValid = () => {
    // main image required ONLY when adding new product
    if (currentEditedId === null && !mainUploadedImageUrl) return false;

    return Object.keys(formData)
      .filter((key) => !["averageReview", "mainImage", "images"].includes(key))
      .map((key) => formData[key] !== "")
      .every(Boolean);
  };

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  console.log(formData, "prodlist");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button
          onClick={() => setOpenCreateProductsDialog(true)}
          className="mt-2 bg-slate-800 text-white"
        >
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);

          setMainImageFile(null);
          setMainUploadedImageUrl("");
          setGalleryImageFiles([]);
          setGalleryUploadedUrls([]);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            // main image
            mainImageFile={mainImageFile}
            setMainImageFile={setMainImageFile}
            mainUploadedImageUrl={mainUploadedImageUrl}
            setMainUploadedImageUrl={setMainUploadedImageUrl}
            imageLoadingState={mainimageLoadingState}
            setImageLoadingState={setMainImageLoadingState}
            // gallery images
            galleryImageFiles={galleryImageFiles}
            setGalleryImageFiles={setGalleryImageFiles}
            galleryUploadedUrls={galleryUploadedUrls}
            setGalleryUploadedUrls={setGalleryUploadedUrls}
            galleryLoadingState={galleryLoadingState}
            setGalleryLoadingState={setGalleryLoadingState}
            isEditMode={currentEditedId !== null}
            showGallery={true}
          />
          <div className="px-4 py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
};

export default AdminProducts;
