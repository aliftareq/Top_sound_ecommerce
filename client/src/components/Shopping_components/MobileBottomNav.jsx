import { useEffect, useState } from "react";
import {
  Home,
  ShoppingCart,
  Phone,
  Menu,
  User,
  UserCog,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems, loadGuestCart } from "@/store/shop/cart-slice";
import { logoutUser } from "@/store/auth_slice";
import { useTranslation } from "react-i18next";

// ✅ Reuse your existing menu component (same handleNavigate logic)
import MenuItems from "./MenuItems"; // <-- IMPORTANT: see note below

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { user } = useSelector((state) => state.auth);
  const { cartItems, guestCart } = useSelector((state) => state.shopCart);

  const isLoggedIn = Boolean(user?.id);

  // ✅ load correct cart depending on auth
  useEffect(() => {
    if (isLoggedIn) dispatch(fetchCartItems(user.id));
    else dispatch(loadGuestCart());
  }, [dispatch, isLoggedIn, user?.id]);

  const cartCount = isLoggedIn
    ? cartItems?.items?.length || 0
    : guestCart?.items?.length || 0;

  // ✅ cart drawer state
  const [openCartSheet, setOpenCartSheet] = useState(false);

  // ✅ profile sheet state
  const [openProfileSheet, setOpenProfileSheet] = useState(false);

  // ✅ menu sheet state
  const [openMenuSheet, setOpenMenuSheet] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpenProfileSheet(false);
  };

  const goAccount = () => {
    navigate("/shop/account");
    setOpenProfileSheet(false);
  };

  const goLogin = () => {
    navigate("/auth/login");
    setOpenProfileSheet(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md
                 flex justify-around items-center py-2
                 lg:hidden z-9999"
    >
      {/* ✅ MENU: opens left Sheet with nav items */}
      <Sheet open={openMenuSheet} onOpenChange={setOpenMenuSheet}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center text-xs">
            <Menu size={22} />
            <span>Menu</span>
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-full max-w-xs">
          {/* Keep nav same behavior */}
          <MenuItems closeSheet={() => setOpenMenuSheet(false)} />
        </SheetContent>
      </Sheet>

      {/* Call */}
      <a href="tel:01632779455" className="flex flex-col items-center text-xs">
        <Phone size={22} />
        <span>Call</span>
      </a>

      {/* Home (center) */}
      <button
        onClick={() => navigate("/")}
        className="relative -top-5 -right-3 bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center 
        shadow-lg"
      >
        <Home size={26} />
      </button>

      {/* ✅ Cart: opens Sheet like header */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="ghost"
          className="relative flex flex-col items-center text-xs h-auto p-0"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 right-0 bg-red-500 text-white
                         text-[10px] px-1 rounded-full"
            >
              {cartCount}
            </span>
          )}
          <span>Cart</span>
        </Button>

        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          isLoggedIn={isLoggedIn}
          dbCartItems={cartItems?.items || []}
          guestCartItems={guestCart?.items || []}
        />
      </Sheet>

      {/* ✅ Profile: opens left Sheet */}
      <Sheet open={openProfileSheet} onOpenChange={setOpenProfileSheet}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center text-xs">
            <User size={22} />
            <span>Profile</span>
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full max-w-xs">
          <div className="p-4">
            <div className="text-sm font-semibold mb-4">
              {user
                ? `${t("header.loggedInAs")} ${user?.userName}`
                : t("header.login")}
            </div>

            {user ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={goAccount}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  {t("header.account")}
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("header.logout")}
                </Button>
              </div>
            ) : (
              <Button variant="submit" className="w-full" onClick={goLogin}>
                {t("header.login")}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileBottomNav;
