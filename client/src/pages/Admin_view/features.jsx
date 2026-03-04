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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function AdminFeatures() {
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainUploadedImageUrl, setMainUploadedImageUrl] = useState("");
  const [mainimageLoadingState, setMainImageLoadingState] = useState(false);

  // delete confirm dialog (same pattern as your orders page)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, image? }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const handleUploadFeatureImage = () => {
    if (!mainUploadedImageUrl) return;

    dispatch(addFeatureImage(mainUploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setMainImageFile(null);
        setMainUploadedImageUrl("");
      }
    });
  };

  // open confirm dialog
  const handleAskDelete = (featureImgItem) => {
    setDeleteTarget({ id: featureImgItem?._id, image: featureImgItem?.image });
    setOpenDeleteDialog(true);
  };

  // confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleteLoading(true);

      const data = await dispatch(deleteFeatureImage(deleteTarget.id));
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setMainImageFile(null);
        setMainUploadedImageUrl("");
      }

      setOpenDeleteDialog(false);
      setDeleteTarget(null);
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

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
        className="mt-5 w-full sm:w-1/2 lg:w-1/4 mx-auto block"
        disabled={!mainUploadedImageUrl || mainimageLoadingState}
      >
        Upload
      </Button>

      {/* 2 images per row on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        {featureImageList?.length
          ? featureImageList.map((featureImgItem) => (
              <div
                key={featureImgItem._id}
                className="rounded-lg border bg-background p-3"
              >
                {/* Wrapper fits image so X can sit on the image corner */}
                <div className="relative w-fit mx-auto">
                  <img
                    src={featureImgItem.image}
                    alt="feature"
                    className="h-[260px] sm:h-[300px] w-auto max-w-full object-contain rounded-md"
                  />

                  {/* X in the corner of the image */}
                  <button
                    type="button"
                    onClick={() => handleAskDelete(featureImgItem)}
                    className="absolute -top-2 -right-2 z-10
                      bg-black/70 text-white
                      rounded-full p-1.5
                      hover:bg-black/90 transition shadow"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          : null}
      </div>

      {/* Delete confirmation dialog (same style/pattern as orders code) */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          setOpenDeleteDialog(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this?
            </DialogDescription>
          </DialogHeader>

          {deleteTarget?.image ? (
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs text-muted-foreground mb-2">
                Preview
              </div>
              <img
                src={deleteTarget.image}
                alt="delete-preview"
                className="h-40 w-full object-contain rounded-md bg-white"
              />
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setDeleteTarget(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>

            <Button
              variant="submit"
              className="bg-red-600"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminFeatures;
