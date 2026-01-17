/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../Common_components/star-rating";
import { useEffect, useMemo, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProductDetailsDialog = ({ open, setOpen, productDetails }) => {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);

  // ✅ selected image shown as main (default: mainImage)
  const [selectedImage, setSelectedImage] = useState("");

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Build a safe gallery list: mainImage first + images array (no duplicates)
  const galleryImages = useMemo(() => {
    const main = productDetails?.mainImage ? [productDetails.mainImage] : [];
    const extra = Array.isArray(productDetails?.images)
      ? productDetails.images
      : [];
    // remove duplicates + falsy
    const all = [...main, ...extra].filter(Boolean);
    return Array.from(new Set(all));
  }, [productDetails]);

  // when product changes, reset selected image to main image
  useEffect(() => {
    setSelectedImage(productDetails?.mainImage || "");
  }, [productDetails]);

  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  const handleAddToCart = (getCurrentProductId, getTotalStock) => {
    let getCartItems = cartItems.items || [];

    if (!user) {
      toast.error("You must login first to add this item!!!");
      navigate("/auth/login");
      return;
    }

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId,
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast.error(`Only ${getQuantity} items available in the stock`);
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success("Product is added to cart successfully");
      }
    });
  };

  const handleDialogClose = () => {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedImage(""); // reset
  };

  const handleAddReview = () => {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      }),
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast.success("Review added successfully!");
      } else {
        toast.error(data.payload.message);
      }
    });
  };

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
     <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        {/* LEFT: Main image + gallery thumbnails */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={selectedImage || productDetails?.mainImage}
              alt={productDetails?.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* ✅ Gallery thumbnails under main image */}
          {galleryImages.length > 1 ? (
            <div className="flex gap-2 flex-wrap">
              {galleryImages.map((imgUrl, idx) => {
                const isActive =
                  (selectedImage || productDetails?.mainImage) === imgUrl;

                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`h-16 w-16 rounded-md overflow-hidden border transition ${
                      isActive ? "border-black" : "border-transparent"
                    }`}
                    title="View image"
                  >
                    <img
                      src={imgUrl}
                      alt={`gallery-${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* RIGHT: Details */}
        <div className="">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <div className="text-black text-xl my-2 space-y-1">
              {productDetails?.description?.split(";").map((item, index) => (
                <p key={index}>{item.trim()}</p>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.offerPrice > 0 ? "line-through" : ""
              }`}
            >
              ৳{productDetails?.price}
            </p>
            {productDetails?.offerPrice > 0 ? (
              <p className="text-2xl font-bold text-black">
                ৳{productDetails?.offerPrice}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-black">({averageReview.toFixed(2)})</span>
          </div>

          <div className="mt-5 mb-5">
            {productDetails?.totalStock === 0 ? (
              <Button
                variant="submit"
                className="w-full opacity-60 cursor-not-allowed"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="submit"
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock,
                  )
                }
              >
                {t("btn.addToCart")}
              </Button>
            )}
          </div>

          <Separator />

          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>

            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem, idx) => (
                  <div key={idx} className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName?.[0]?.toUpperCase?.() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>

                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>This Product has No Reviews yet!!!</h1>
              )}
            </div>

            <div className="mt-10 flex-col flex gap-2">
              <Label>{t("review.text")}</Label>

              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>

              <Textarea
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder={t("review.text")}
              />

              <Button
                variant="submit"
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === ""}
              >
                {t("btn.submit")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
