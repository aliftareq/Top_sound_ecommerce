import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

const UserCartWrapper = ({ cartItems, setOpenCartSheet }) => {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md px-6">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      {cartItems && cartItems.length > 0 ? (
        <div>
          <div className="mt-8 space-y-4">
            {cartItems && cartItems.length > 0
              ? cartItems.map((item) => (
                  <UserCartItemsContent cartItem={item} />
                ))
              : null}
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">৳{totalCartAmount}</span>
            </div>
          </div>
          <Button
            variant="submit"
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full mt-6"
          >
            Checkout
          </Button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-center font-bold">
            You have Not Added Any item Yet!
          </p>
          <Button
            variant="submit"
            onClick={() => {
              navigate("/shop/listing");
              setOpenCartSheet(false);
            }}
          >
            Add Item In your Cart
          </Button>
        </div>
      )}
    </SheetContent>
  );
};

export default UserCartWrapper;
