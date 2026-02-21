// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { http } from "@/lib/http";

// const initialState = {
//   cartItems: [],
//   isLoading: false,
// };

// export const addToCart = createAsyncThunk(
//   "cart/addToCart",
//   async ({ userId, productId, quantity }) => {
//     const response = await http.post(
//       "/api/shop/cart/add",
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );

//     return response.data;
//   }
// );

// export const fetchCartItems = createAsyncThunk(
//   "cart/fetchCartItems",
//   async (userId) => {
//     const response = await http.get(
//       `/api/shop/cart/get/${userId}`
//     );

//     return response.data;
//   }
// );

// export const deleteCartItem = createAsyncThunk(
//   "cart/deleteCartItem",
//   async ({ userId, productId }) => {
//     const response = await http.delete(
//       `/api/shop/cart/${userId}/${productId}`
//     );

//     return response.data;
//   }
// );

// export const updateCartQuantity = createAsyncThunk(
//   "cart/updateCartQuantity",
//   async ({ userId, productId, quantity }) => {
//     const response = await http.put(
//       "/api/shop/cart/update-cart",
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );

//     return response.data;
//   }
// );

// const shoppingCartSlice = createSlice({
//   name: "shoppingCart",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(addToCart.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(addToCart.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(addToCart.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(fetchCartItems.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchCartItems.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(fetchCartItems.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(updateCartQuantity.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(updateCartQuantity.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(updateCartQuantity.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(deleteCartItem.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(deleteCartItem.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(deleteCartItem.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       });
//   },
// });

// export default shoppingCartSlice.reducer;




import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { http } from "@/lib/http";

/**
 * Guest cart is stored locally (no backend calls)
 * Shape matches DB cart as much as possible:
 *   { items: [{ productId, quantity }] }
 */
const GUEST_CART_KEY = "guest_cart";

const loadGuestCartFromStorage = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CART_KEY));
    if (parsed && Array.isArray(parsed.items)) return parsed;
    return { items: [] };
  } catch {
    return { items: [] };
  }
};

const saveGuestCartToStorage = (guestCart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
};

const initialState = {
  cartItems: { items: [] },   // logged-in (DB) cart
  guestCart: { items: [] },   // guest (localStorage) cart
  isLoading: false,
};

// =========================
// Logged-in async thunks
// =========================
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }) => {
    const response = await http.post("/api/shop/cart/add", {
      userId,
      productId,
      quantity,
    });

    return response.data;
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const response = await http.get(`/api/shop/cart/get/${userId}`);
    return response.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }) => {
    const response = await http.delete(`/api/shop/cart/${userId}/${productId}`);
    return response.data;
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }) => {
    const response = await http.put("/api/shop/cart/update-cart", {
      userId,
      productId,
      quantity,
    });

    return response.data;
  }
);

// =========================
// Slice
// =========================
const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    // Call once on app load (or when user logs out) to hydrate guest cart
    loadGuestCart: (state) => {
      state.guestCart = loadGuestCartFromStorage();
    },

    addGuestToCart: (state, action) => {
      const { productId, quantity = 1 } = action.payload || {};
      if (!productId || quantity <= 0) return;

      const items = state.guestCart.items || [];
      const idx = items.findIndex((i) => i.productId === productId);

      if (idx === -1) items.push({ productId, quantity });
      else items[idx].quantity += quantity;

      state.guestCart.items = items;
      saveGuestCartToStorage(state.guestCart);
    },

    updateGuestCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload || {};
      if (!productId || typeof quantity !== "number") return;

      const items = state.guestCart.items || [];
      const idx = items.findIndex((i) => i.productId === productId);

      if (idx > -1) {
        if (quantity <= 0) items.splice(idx, 1);
        else items[idx].quantity = quantity;

        state.guestCart.items = items;
        saveGuestCartToStorage(state.guestCart);
      }
    },

    deleteGuestCartItem: (state, action) => {
      const { productId } = action.payload || {};
      if (!productId) return;

      state.guestCart.items = (state.guestCart.items || []).filter(
        (i) => i.productId !== productId
      );

      saveGuestCartToStorage(state.guestCart);
    },

    clearGuestCart: (state) => {
      state.guestCart = { items: [] };
      saveGuestCartToStorage(state.guestCart);
    },
  },

  extraReducers: (builder) => {
    builder
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })

      // fetchCartItems
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
      })

      // updateCartQuantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })

      // deleteCartItem
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  loadGuestCart,
  addGuestToCart,
  updateGuestCartQuantity,
  deleteGuestCartItem,
  clearGuestCart,
} = shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;