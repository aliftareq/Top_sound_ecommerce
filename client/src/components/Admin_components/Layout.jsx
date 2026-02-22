import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";

const AdminLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />

      {/* ✅ add min-w-0 here */}
      <div className="flex flex-1 min-w-0 flex-col">
        <AdminHeader setOpen={setOpenSidebar} />

        {/* ✅ add min-w-0 here too */}
        <main className="flex flex-1 min-w-0 flex-col bg-blue-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
