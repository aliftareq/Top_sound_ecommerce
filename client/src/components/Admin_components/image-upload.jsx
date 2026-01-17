/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";
import { FileIcon, UploadCloudIcon, XIcon, PlusIcon } from "lucide-react";
import axios from "axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const ProductImageUpload = ({
  // main image
  mainImageFile,
  setMainImageFile,
  imageLoadingState,
  setMainUploadedImageUrl,
  setImageLoadingState,

  // gallery images (optional)
  galleryImageFiles = [],
  setGalleryImageFiles = () => {},
  galleryUploadedUrls = [],
  setGalleryUploadedUrls = () => {},
  galleryLoadingState = false,
  setGalleryLoadingState = () => {},
  isEditMode,
  showGallery,
}) => {
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // ---------------- MAIN IMAGE ----------------
  const handleMainImageChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setMainImageFile(selectedFile);

    // ✅ allow selecting same file again
    event.target.value = "";
  };

  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainUploadedImageUrl("");
    if (mainInputRef.current) mainInputRef.current.value = "";
  };

  async function uploadMainImageToCloudinary(file) {
    setImageLoadingState(true);

    const data = new FormData();
    data.append("my_file", file);

    const response = await axios.post(
      "http://localhost:5000/api/admin/products/upload-image",
      data
    );

    if (response?.data?.success) {
      setMainUploadedImageUrl(response.data.result.url);
    }

    setImageLoadingState(false);
  }

  useEffect(() => {
    if (!mainImageFile) return;
    if (isEditMode) return; // ✅ avoid upload in edit mode
    uploadMainImageToCloudinary(mainImageFile);
  }, [mainImageFile, isEditMode]);

  // ---------------- GALLERY IMAGES ----------------
  const uploadSingleToCloudinary = async (file) => {
    const data = new FormData();
    data.append("my_file", file);

    const response = await axios.post(
      "http://localhost:5000/api/admin/products/upload-image",
      data
    );

    if (response?.data?.success) return response.data.result.url;
    return null;
  };

  const handleGalleryImagesChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // ✅ allow selecting same file again
    event.target.value = "";

    setGalleryLoadingState(true);

    // append files
    setGalleryImageFiles((prev) => [...prev, ...files]);

    // upload ONLY new files
    const newUrls = [];
    for (const file of files) {
      const url = await uploadSingleToCloudinary(file);
      if (url) newUrls.push(url);
    }

    setGalleryUploadedUrls((prev) => [...prev, ...newUrls]);
    setGalleryLoadingState(false);
  };

  const handleRemoveGalleryImage = (index) => {
    const newFiles = galleryImageFiles.filter((_, i) => i !== index);
    const newUrls = galleryUploadedUrls.filter((_, i) => i !== index);

    setGalleryImageFiles(newFiles);
    setGalleryUploadedUrls(newUrls);

    if (newFiles.length === 0 && galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleClearGallery = () => {
    setGalleryImageFiles([]);
    setGalleryUploadedUrls([]);
    setGalleryLoadingState(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* MAIN IMAGE */}
      <div>
        <Label className="text-lg font-semibold m-2 block text-center">
          Upload Main Image
        </Label>

        <div
          className={`${
            isEditMode ? "opacity-20" : ""
          } border-2 border-dashed rounded-lg p-4 mx-4`}
        >
          <Input
            id="main-image-upload"
            type="file"
            className="hidden"
            ref={mainInputRef}
            onChange={handleMainImageChange}
            disabled={isEditMode}
            accept="image/*"
          />

          {!mainImageFile ? (
            <Label
              htmlFor="main-image-upload"
              className={`${
                isEditMode ? "cursor-not-allowed" : ""
              } flex flex-col items-center justify-center h-32 cursor-pointer`}
            >
              <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
              <span>Drag & drop or click to upload main image</span>
            </Label>
          ) : imageLoadingState ? (
            <Skeleton className="h-10 bg-gray-100" />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileIcon className="w-8 text-primary mr-2 h-8" />
              </div>
              <p className="text-sm font-medium">{mainImageFile.name}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleRemoveMainImage}
                disabled={isEditMode}
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Remove File</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ GALLERY IMAGES (only if showGallery true) */}
      {showGallery && (
        <div>
          <Label className="text-lg font-semibold m-2 block text-center">
            Upload Gallery Images
          </Label>

          <div
            className={`${
              isEditMode ? "opacity-20" : ""
            } border-2 border-dashed rounded-lg p-4 mx-4`}
          >
            <Input
              id="gallery-images-upload"
              type="file"
              multiple
              className="hidden"
              ref={galleryInputRef}
              onChange={handleGalleryImagesChange}
              disabled={isEditMode}
              accept="image/*"
            />

            {galleryImageFiles?.length === 0 ? (
              <Label
                htmlFor="gallery-images-upload"
                className={`${
                  isEditMode ? "cursor-not-allowed" : ""
                } flex flex-col items-center justify-center h-32 cursor-pointer`}
              >
                <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
                <span>Click to upload multiple gallery images</span>
              </Label>
            ) : galleryLoadingState ? (
              <Skeleton className="h-10 bg-gray-100" />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isEditMode}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span className="sr-only">Add more images</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearGallery}
                    disabled={isEditMode}
                  >
                    Clear All
                  </Button>
                </div>

                {galleryImageFiles?.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileIcon className="w-8 text-primary mr-2 h-8" />
                    </div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveGalleryImage(index)}
                      disabled={isEditMode}
                    >
                      <XIcon className="w-4 h-4" />
                      <span className="sr-only">Remove File</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {galleryLoadingState ? (
            <div className="mx-4 mt-2">
              <Skeleton className="h-10 bg-gray-100" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
