import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";

const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden p-0">
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={product?.mainImage}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-500">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.OfferPrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
              On Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-black">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-black">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.offerPrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ৳{product?.price}
            </span>
            {product?.offerPrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                ৳{product?.offerPrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button
            variant="submit"
            className="w-full opacity-60 cursor-not-allowed mb-4"
          >
            Out Of Stock
          </Button>
        ) : (
          <Button
            variant="submit"
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full mb-4"
          >
            {t("btn.addToCart")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ShoppingProductTile;
