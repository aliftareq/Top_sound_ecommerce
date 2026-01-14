import ProductImageUpload from "@/components/Admin_components/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  deleteFeatureImage,
  getFeatureImages,
} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";

function AdminFeatures() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  console.log(featureImageList, "uploadedImageUrl");

  const handleUploadFeatureImage = () => {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  };

  const handleRemoveImage = (id) => {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  };

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  console.log(featureImageList, "featureImageList");
  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        // isEditMode={currentEditedId !== null}
      />
      <Button
        variant="submit"
        onClick={handleUploadFeatureImage}
        className="mt-5 w-1/4 mx-auto block"
      >
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div className="relative">
                <img
                  src={featureImgItem.image}
                  className="w-full h-[300px] object-cover rounded-t-lg"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveImage(featureImgItem._id)}
                  className="absolute top-2 right-2 z-10
               bg-black/60 text-white
               rounded-full p-1
               hover:bg-black/80 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default AdminFeatures;
