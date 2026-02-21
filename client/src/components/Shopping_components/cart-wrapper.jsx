/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useTranslation } from "react-i18next";
import { http } from "@/lib/http";

const UserCartWrapper = ({
  dbCartItems,
  guestCartItems,
  isLoggedIn,
  setOpenCartSheet,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [guestFullItems, setGuestFullItems] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);

  // ✅ Only change when items are added/removed (NOT when quantity changes)
  const guestProductIdsKey = useMemo(() => {
    return (guestCartItems || [])
      .map((i) => i.productId)
      .sort()
      .join(",");
  }, [guestCartItems]);

  // ✅ Keep quantities in sync without refetching products
  useEffect(() => {
    if (isLoggedIn) return;
    if (!guestCartItems?.length) {
      setGuestFullItems([]);
      return;
    }

    // Update quantities locally (no API call)
    setGuestFullItems((prev) => {
      if (!prev?.length) return prev;

      const qtyMap = new Map(
        guestCartItems.map((g) => [g.productId, g.quantity])
      );

      return prev
        .filter((p) => qtyMap.has(p.productId)) // remove deleted items
        .map((p) => ({
          ...p,
          quantity: qtyMap.get(p.productId),
        }));
    });
  }, [isLoggedIn, guestCartItems]);

  // ✅ Fetch products ONLY when product list changes (add/remove)
  useEffect(() => {
    const hydrateGuest = async () => {
      if (isLoggedIn) return;

      if (!guestCartItems?.length) {
        setGuestFullItems([]);
        return;
      }

      try {
        setGuestLoading(true);

        const ids = guestCartItems.map((g) => g.productId);

        const res = await http.post("/api/shop/products/get-by-ids", { ids });
        const products = res?.data?.data || [];

        // Merge quantity into product objects
        const qtyMap = new Map(guestCartItems.map((g) => [g.productId, g.quantity]));
        const merged = products.map((p) => ({
          ...p,
          productId: p._id, // keep consistent key for UI
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
  }, [isLoggedIn, guestProductIdsKey]); // ✅ ONLY ids change triggers fetch

  const itemsToRender = isLoggedIn ? (dbCartItems || []) : guestFullItems;

  // ✅ Total updates instantly on quantity change (no refetch)
  const totalCartAmount = useMemo(() => {
    if (!itemsToRender?.length) return 0;

    return itemsToRender.reduce((sum, item) => {
      const unitPrice = item?.offerPrice > 0 ? item.offerPrice : item.price;
      return sum + Number(unitPrice || 0) * Number(item?.quantity || 0);
    }, 0);
  }, [itemsToRender]);

  return (
    <SheetContent className="sm:max-w-md px-6">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      {!isLoggedIn && guestLoading ? (
        <div className="mt-8 font-medium">Loading cart...</div>
      ) : itemsToRender && itemsToRender.length > 0 ? (
        <div>
          <div className="mt-8 space-y-4">
            {itemsToRender.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))}
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
            {t("btn.order")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-center font-bold">You have Not Added Any item Yet!</p>
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