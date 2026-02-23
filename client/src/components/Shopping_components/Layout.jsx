import React from "react";
import ShoppingHeader from "./header";
import { Outlet } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import MobileBottomNav from "./MobileBottomNav";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden relative pb-24 lg:pb-0">
      <ShoppingHeader />

      <main className="flex flex-col w-full">
        <Outlet />
      </main>

      {/* ✅ Mobile Bottom Navbar (mobile + md only) */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default ShoppingLayout;
