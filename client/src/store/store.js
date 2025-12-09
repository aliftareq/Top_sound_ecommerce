import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth_slice";
import adminProductsSlice from "./admin/products-slice";

import shopProductsSlice from "./shop/products-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,

    shopProducts: shopProductsSlice,
  },
});

export default store;
