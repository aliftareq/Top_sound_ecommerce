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
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainUploadedImageUrl, setMainUploadedImageUrl] = useState("");
  const [mainimageLoadingState, setMainImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  console.log(featureImageList, "uploadedImageUrl");

  const handleUploadFeatureImage = () => {
    dispatch(addFeatureImage(mainUploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setMainImageFile(null);
        setMainUploadedImageUrl("");
      }
    });
  };

  const handleRemoveImage = (id) => {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setMainImageFile(null);
        setMainUploadedImageUrl("");
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
        mainImageFile={mainImageFile}
        setMainImageFile={setMainImageFile}
        mainUploadedImageUrl={mainUploadedImageUrl}
        setMainUploadedImageUrl={setMainUploadedImageUrl}
        imageLoadingState={mainimageLoadingState}
        setImageLoadingState={setMainImageLoadingState}
        isCustomStyling={true}
        showGallery={false}
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
