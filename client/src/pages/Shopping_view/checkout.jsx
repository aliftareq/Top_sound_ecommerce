import Address from "@/components/Shopping_components/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/Shopping_components/cart-items-content";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DELIVERY_OPTIONS = [
  { id: "inside_dhaka", label: "Inside Dhaka", charge: 120 },
  { id: "outside_dhaka", label: "Out of Dhaka", charge: 150 },
];

const ShoppingCheckout = () => {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { orderDetails } = useSelector((state) => state.shopOrder);

  console.log(orderDetails);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isOrderStart, setIsOrderStart] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState(
    DELIVERY_OPTIONS[0].id,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const itemsTotal = useMemo(() => {
    return cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.offerPrice > 0
              ? currentItem?.offerPrice
              : currentItem?.price) *
              currentItem?.quantity,
          0,
        )
      : 0;
  }, [cartItems]);

  const deliveryCharge = useMemo(() => {
    const found = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery);
    return found ? found.charge : 0;
  }, [selectedDelivery]);

  const totalCartAmount = useMemo(() => {
    return itemsTotal + deliveryCharge;
  }, [itemsTotal, deliveryCharge]);

  const handleInitiateOrder = () => {
    if (!cartItems?.items || cartItems?.items?.length === 0) {
      toast.error("Your cart is empty. Please add items to proceed");
      return;
    }
    if (currentSelectedAddress === null) {
      toast.error("Please select one address to proceed.");
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        mainImage: singleCartItem?.mainImage,
        price:
          singleCartItem?.offerPrice > 0
            ? singleCartItem?.offerPrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        fullAddress: currentSelectedAddress?.fullAddress,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },

      orderStatus: "pending",
      paymentMethod: "Cash On Delivery",
      paymentStatus: "pending",

      // Total includes delivery charge
      totalAmount: totalCartAmount,

      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    setIsOrderStart(true);

    dispatch(createNewOrder(orderData)).then((action) => {
      if (action?.payload?.success) {
        toast.success("Order created successfully!");
        navigate("/shop/orderDetails");
      } else {
        toast.error("Failed to create order!");
        setIsOrderStart(false);
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={img}
          alt="Checkout"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent
                  key={item?.productId || item?._id}
                  cartItem={item}
                />
              ))
            : null}

          {/* ✅ Delivery options section */}
          <div className="mt-4 rounded-lg border p-4 space-y-3">
            <p className="font-semibold">Delivery Options</p>

            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery"
                    value={opt.id}
                    checked={selectedDelivery === opt.id}
                    onChange={() => setSelectedDelivery(opt.id)}
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="font-medium">৳{opt.charge}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Items Total</span>
              <span className="font-medium">৳{itemsTotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Delivery Charge</span>
              <span className="font-medium">৳{deliveryCharge}</span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="font-bold">Grand Total</span>
              <span className="font-bold">৳{totalCartAmount}</span>
            </div>
          </div>

          <div className="mt-2 w-full">
            <Button
              variant="submit"
              onClick={handleInitiateOrder}
              className="w-full"
              disabled={isOrderStart}
            >
              {isOrderStart ? "Processing Your Order..." : "Confirm order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCheckout;
