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

      {/* ✅ WhatsApp Floating Button (no text, mobile + md only) */}
      <a
        href="https://wa.me/8801632779455"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-28 right-4 
                   bg-green-500 hover:bg-green-600
                   w-14 h-14 
                   rounded-full 
                   flex items-center justify-center 
                   shadow-xl 
                   z-9999
                   hover:scale-110 
                   transition-all duration-300"
      >
        <FaWhatsapp className="text-white" size={28} />
      </a>
    </div>
  );
}

export default ShoppingLayout;
