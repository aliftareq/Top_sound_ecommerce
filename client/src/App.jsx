import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthLayout from "./components/AuthComponents/Layout";
import AuthLogin from "./pages/Authpages/Login";
import AuthRegister from "./pages/Authpages/Register";
import AdminLayout from "./components/Admin_components/Layout";
import AdminDashboard from "./pages/Admin_view/Dashboard";
import AdminProducts from "./pages/Admin_view/Products";
import AdminOrders from "./pages/Admin_view/orders";
import AdminFeatures from "./pages/Admin_view/features";
import ShoppingLayout from "./components/Shopping_components/Layout";
import NotFoundPage from "./pages/Not_found_page";
import ShoppingHome from "./pages/Shopping_view/Home";
import ShoppingListing from "./pages/Shopping_view/listing";
import ShoppingCheckout from "./pages/Shopping_view/checkout";
import ShoppingAccount from "./pages/Shopping_view/account";

function App() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        {/* auth routes  */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        {/* admin routes  */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        {/* shopping routes  */}
        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
        </Route>
        {/* not found page  */}
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
}

export default App;
