/* eslint-disable react-hooks/exhaustive-deps */
import Address from "@/components/Shopping_components/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/Shopping_components/cart-items-content";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/http";
import { loadGuestCart, clearGuestCart } from "@/store/shop/cart-slice";
import {
  loadGuestAddresses,
  clearGuestAddresses,
} from "@/store/shop/address-slice";

const DELIVERY_OPTIONS = [
  { id: "inside_dhaka", label: "Inside Dhaka", charge: 120 },
  { id: "outside_dhaka", label: "Out of Dhaka", charge: 150 },
];

const ShoppingCheckout = () => {
  const { cartItems, guestCart } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isOrderStart, setIsOrderStart] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState(
    DELIVERY_OPTIONS[0].id,
  );

  // ✅ Guest hydrated items (full product info + quantity)
  const [guestFullItems, setGuestFullItems] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user?.id);

  // ✅ Load guest cart + guest address on refresh (guest only)
  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(loadGuestCart());
      dispatch(loadGuestAddresses());
    }
  }, [isLoggedIn, dispatch]);

  // =========================
  // Guest hydration (only by ids change)
  // =========================
  const guestCartItems = guestCart?.items || []; // [{productId, quantity}]

  const guestProductIdsKey = useMemo(() => {
    return guestCartItems
      .map((i) => i.productId)
      .sort()
      .join(",");
  }, [guestCartItems]);

  // keep quantities synced without refetch
  useEffect(() => {
    if (isLoggedIn) return;
    if (!guestCartItems.length) {
      setGuestFullItems([]);
      return;
    }

    setGuestFullItems((prev) => {
      if (!prev?.length) return prev;

      const qtyMap = new Map(
        guestCartItems.map((g) => [g.productId, g.quantity]),
      );

      return prev
        .filter((p) => qtyMap.has(p.productId))
        .map((p) => ({ ...p, quantity: qtyMap.get(p.productId) }));
    });
  }, [isLoggedIn, guestCartItems]);

  // fetch products only on add/remove
  useEffect(() => {
    const hydrateGuest = async () => {
      if (isLoggedIn) return;

      if (!guestCartItems.length) {
        setGuestFullItems([]);
        return;
      }

      try {
        setGuestLoading(true);

        const ids = guestCartItems.map((g) => g.productId);
        const res = await http.post("/api/shop/products/get-by-ids", { ids });
        const products = res?.data?.data || [];

        const qtyMap = new Map(
          guestCartItems.map((g) => [g.productId, g.quantity]),
        );

        const merged = products.map((p) => ({
          ...p,
          productId: p._id,
          quantity: qtyMap.get(p._id) || 1,
        }));

        setGuestFullItems(merged);
      } catch (e) {
        console.log(e);
        setGuestFullItems([]);
      } finally {
        setGuestLoading(false);
      }
    };

    hydrateGuest();
  }, [isLoggedIn, guestProductIdsKey]);

  // =========================
  // Choose items for checkout UI
  // =========================
  const checkoutItems = isLoggedIn ? cartItems?.items || [] : guestFullItems;

  // =========================
  // Totals
  // =========================
  const itemsTotal = useMemo(() => {
    if (!checkoutItems?.length) return 0;

    return checkoutItems.reduce((sum, currentItem) => {
      const unitPrice =
        currentItem?.offerPrice > 0
          ? currentItem.offerPrice
          : currentItem.price;

      return sum + Number(unitPrice || 0) * Number(currentItem?.quantity || 0);
    }, 0);
  }, [checkoutItems]);

  const deliveryCharge = useMemo(() => {
    const found = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery);
    return found ? found.charge : 0;
  }, [selectedDelivery]);

  const totalCartAmount = useMemo(
    () => itemsTotal + deliveryCharge,
    [itemsTotal, deliveryCharge],
  );

  // =========================
  // Create order
  // =========================
  const handleInitiateOrder = () => {
    if (!checkoutItems?.length) {
      toast.error("Your cart is empty. Please add items to proceed");
      return;
    }

    if (currentSelectedAddress === null) {
      toast.error("Please select one address to proceed.");
      return;
    }

    const orderData = {
      userId: isLoggedIn ? user.id : null,
      cartId: isLoggedIn ? cartItems?._id : null,

      cartItems: checkoutItems.map((singleCartItem) => ({
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
        name: currentSelectedAddress?.name,
        fullAddress: currentSelectedAddress?.fullAddress,
        district: currentSelectedAddress?.district,
        thana: currentSelectedAddress?.thana,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },

      orderStatus: "pending",
      paymentMethod: "Cash On Delivery",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    setIsOrderStart(true);

    dispatch(createNewOrder(orderData)).then((action) => {
      if (action?.payload?.success) {
        toast.success("Order created successfully!");

        // ✅ IMPORTANT: clear guest local data after successful order
        if (!isLoggedIn) {
          dispatch(clearGuestCart());
          dispatch(clearGuestAddresses());
          setCurrentSelectedAddress(null);
        }

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
          {!isLoggedIn && guestLoading ? (
            <p className="font-medium">Loading cart...</p>
          ) : checkoutItems.length > 0 ? (
            checkoutItems.map((item) => (
              <UserCartItemsContent
                key={item?.productId || item?._id}
                cartItem={item}
              />
            ))
          ) : null}

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
