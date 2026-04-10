/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/Common_components/star-rating";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FaWhatsapp } from "react-icons/fa";
import { trackViewContent,
  trackAddToCart,
  trackInitiateCheckout } from "@/utils/metaEvents";
import {
  addToCart,
  fetchCartItems,
  addGuestToCart,
} from "@/store/shop/cart-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import {
  fetchProductDetails,
  setProductDetails,
} from "@/store/shop/products-slice";

const ProductDetailsPage = () => {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { t } = useTranslation();

  const { user } = useSelector((state) => state.auth);
  const { cartItems, guestCart } = useSelector((state) => state.shopCart);
  const { orders } = useSelector((state) => state.shopOrder);
  const { reviews } = useSelector((state) => state.shopReview);

  // ✅ from your slice
  const { productDetails, isLoading } = useSelector(
    (state) => state.shopProducts,
  );

  // ✅ Load product details by route param
  useEffect(() => {
    if (productId) dispatch(fetchProductDetails(productId));

    // cleanup so old data doesn't flash when switching product
    return () => {
      dispatch(setProductDetails());
    };
  }, [productId]);

  // ✅ Load reviews after product loaded
  useEffect(() => {
    if (productDetails?._id) dispatch(getReviews(productDetails._id));
  }, [productDetails?._id]);

  // ✅ Track product view for Meta Pixel
  useEffect(() => {
    if (productDetails?._id) {
      trackViewContent(productDetails);
    }
  }, [productDetails?._id]);

  // ✅ Gallery images
  const galleryImages = useMemo(() => {
    const main = productDetails?.mainImage ? [productDetails.mainImage] : [];
    const extra = Array.isArray(productDetails?.images)
      ? productDetails.images
      : [];
    const all = [...main, ...extra].filter(Boolean);
    return Array.from(new Set(all));
  }, [productDetails]);

  // ✅ set main image when product changes
  useEffect(() => {
    setSelectedImage(productDetails?.mainImage || "");
  }, [productDetails]);

  const handleRatingChange = (getRating) => setRating(getRating);

  const handleAddToCart = async (
    getCurrentProductId,
    getTotalStock,
    options = { redirectToCheckout: false },
  ) => {
    const isLoggedIn = Boolean(user?.id);

    const currentCartItems = isLoggedIn
      ? cartItems?.items || []
      : guestCart?.items || [];

    const indexOfCurrentItem = currentCartItems.findIndex(
      (item) => item.productId === getCurrentProductId,
    );

    if (indexOfCurrentItem > -1) {
      const currentQty = currentCartItems[indexOfCurrentItem].quantity;
      if (currentQty + 1 > getTotalStock) {
        toast.error(`Only ${currentQty} items available in the stock`);
        return;
      }
    }

    // ✅ GUEST
    if (!isLoggedIn) {
      dispatch(addGuestToCart({ productId: getCurrentProductId, quantity: 1 }));
      trackAddToCart(productDetails);
      toast.success("Product is added to cart successfully");

      if (options?.redirectToCheckout) {
        trackInitiateCheckout(productDetails);
        navigate("/shop/checkout");
      }
      return;
    }

    // ✅ LOGGED-IN
    const result = await dispatch(
      addToCart({
        userId: user.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    );

    if (result?.payload?.success) {
      await dispatch(fetchCartItems(user.id));
      trackAddToCart(productDetails);
      toast.success("Product is added to cart successfully");

      if (options?.redirectToCheckout) {
        trackInitiateCheckout(productDetails);
        navigate("/shop/checkout");
      }
    }
  };

  const hasUserPurchasedProduct = () => {
    if (!user?.id) return false;
    if (!orders || orders.length === 0) return false;

    return orders.some((order) =>
      order?.items?.some((item) => item?.productId === productDetails?._id),
    );
  };

  const handleAddReview = () => {
    if (!user?.id) {
      toast.error("Please login to add a review");
      return;
    }

    if (!hasUserPurchasedProduct()) {
      toast.error("You can only review products you have purchased.");
      return;
    }

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

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  // ✅ WhatsApp helpers
  const getDisplayPrice = () => {
    const offer = Number(productDetails?.offerPrice || 0);
    const price = Number(productDetails?.price || 0);
    return offer > 0 ? offer : price;
  };

  const buildProductLink = () => {
    return `${window.location.origin}/shop/products/${productDetails?._id}`;
  };

  const buildWhatsAppMessage = () => {
    const title = productDetails?.title || "Product";
    const price = getDisplayPrice();
    const link = buildProductLink();
    return `Hi! I want to order:\n${title}\nPrice: ৳${price}\nLink: ${link}`;
  };

  const whatsappHref = `https://wa.me/8801632779455?text=${encodeURIComponent(
    buildWhatsAppMessage(),
  )}`;

  // ✅ Basic loading / empty states
  if (isLoading && !productDetails)
    return <div className="p-6">Loading...</div>;
  if (!productDetails) return <div className="p-6">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      {/* optional back */}
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Main image + thumbnails */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={selectedImage || productDetails?.mainImage}
              alt={productDetails?.title}
              className="aspect-square w-full object-cover"
            />

            {/* WhatsApp Floating Button */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-50
                w-14 h-14 rounded-full bg-green-500 hover:bg-green-600
                flex items-center justify-center shadow-xl
                transition-transform duration-300 hover:scale-110"
              aria-label="Order via WhatsApp"
              title="Order via WhatsApp"
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40 animate-ping"></span>
              <FaWhatsapp className="relative text-white" size={28} />
            </a>
          </div>

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
        <div>
          <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>

          <div className="text-black text-sm md:text-xl my-2 space-y-1">
            {productDetails?.description?.split(";").map((item, index) => (
              <p key={index}>{item.trim()}</p>
            ))}
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
            <StarRatingComponent rating={averageReview} />
            <span className="text-black">({averageReview.toFixed(2)})</span>
          </div>

          <div className="flex gap-5 mt-5 mb-5">
            <Button
              onClick={() =>
                handleAddToCart(
                  productDetails?._id,
                  productDetails?.totalStock,
                  {
                    redirectToCheckout: true,
                  },
                )
              }
              className="p-5 bg-green-700 hover:bg-green-600"
              variant="submit"
              disabled={productDetails?.totalStock === 0}
            >
              {t("btn.order")}
            </Button>

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
                className="p-5 bg-green-700 hover:bg-green-600"
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

          <div className="max-h-[300px] overflow-auto mt-6">
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
      </div>
    </div>
  );
};

export default ProductDetailsPage;
