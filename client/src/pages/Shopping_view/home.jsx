/* eslint-disable react-hooks/set-state-in-effect */
import { Button } from "@/components/ui/button";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Headset,
  Images,
  Keyboard,
  Laptop,
  Speaker,
  Watch,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";
import { toast } from "sonner";
import ShoppingProductTile from "@/components/Shopping_components/product-tile";
import { useTranslation } from "react-i18next";
import Slider from "./Slider";

const categoriesWithIcon = [
  { id: "soundbox", labelKey: "nav.soundbox", icon: Speaker },
  { id: "headphone", labelKey: "nav.headphone", icon: Headset },
  { id: "smartwatch", labelKey: "nav.smartwatch", icon: Watch },
  { id: "keyboard", labelKey: "nav.keyboard", icon: Keyboard },
  { id: "accessories", labelKey: "nav.accessories", icon: Laptop },
];

const brandsWithIcon = [
  { id: "kbroad", label: "Kbroad", icon: Speaker },
  { id: "oraimo", label: "Oraimo", icon: Headset },
  { id: "logitech", label: "Logitech", icon: Keyboard },
  { id: "apple", label: "Apple", icon: Airplay },
  { id: "xiaomi", label: "Xiaomi", icon: Watch },
  { id: "others", label: "Others", icon: Laptop },
];
const ShoppingHome = () => {
  const { productList } = useSelector(
    (state) => state.shopProducts,
  );

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleNavigateToListingPage = (getCurrentItem, section) => {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  };

  const handleGetProductDetails = (getCurrentProductId) => {
    dispatch(fetchProductDetails(getCurrentProductId));
  };

  const handleAddtoCart = (getCurrentProductId) => {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success("Product is added to cart");
      }
    });
  };

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      }),
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <Slider />
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("category.text")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold"> {t(categoryItem.labelKey)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("brand.text")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{t(brandItem.label)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("feature.text")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList
                  .slice(0, 4)
                  .map((productItem) => (
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                    />
                  ))
              : null}
          </div>
          <div className="py-5">
            <Button
              variant="submit"
              className="w-1/2 lg:w-1/4 mx-auto block"
              onClick={() => navigate("/shop/listing")}
            >
              {t("btn.seeAll")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShoppingHome;
