import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/admin/orders";

const initialState = {
  orderList: [],
  orderDetails: null,

  isLoading: false, // page-level loading (fetch list/details)
  actionLoading: false, // button-level loading (update/create/sync)
  error: null,
  successMessage: null,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/get`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to load orders" }
      );
    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/details/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to load order details" }
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/update/${id}`, {
        orderStatus,
      });
      return { ...response.data, meta: { id, orderStatus } };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to update order status" }
      );
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "/order/updatePaymentStatus",
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/update-payment/${id}`, {
        paymentStatus,
      });
      return { ...response.data, meta: { id, paymentStatus } };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to update payment status" }
      );
    }
  }
);

// ✅ NEW: update order price
// backend: PUT /api/admin/orders/update-price/:id
export const updateOrderPrice = createAsyncThunk(
  "/order/updateOrderPrice",
  async ({ id, totalAmount }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/update-price/${id}`, {
        totalAmount,
      });
      return { ...response.data, meta: { id, totalAmount } };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to update order price" }
      );
    }
  }
);

// ✅ NEW: create steadfast parcel
// backend: POST /api/admin/orders/steadfast/create/:id
export const createSteadfastParcelForOrder = createAsyncThunk(
  "/order/createSteadfastParcelForOrder",
  async ({ id, recipient_name, delivery_type = 0 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/steadfast/create/${id}`, {
        recipient_name,
        delivery_type,
      });
      console.log(response.data);
      return response.data; // expects {success, message, data: order}
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to create Steadfast parcel" }
      );
    }
  }
);

// ✅ NEW: sync steadfast status
// backend: POST /api/admin/orders/steadfast/sync/:id
export const syncSteadfastStatusForOrder = createAsyncThunk(
  "/order/syncSteadfastStatusForOrder",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/steadfast/sync/${id}`);
      return response.data; // expects {success, message, data:{...}} or {success, message, data: order}
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to sync Steadfast status" }
      );
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    clearAdminOrderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------------------------
      // GET ALL ORDERS
      // -------------------------
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action?.payload?.data || [];
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action?.payload?.message || "Failed to load orders";
      })

      // -------------------------
      // ORDER DETAILS
      // -------------------------
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action?.payload?.data || null;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error =
          action?.payload?.message || "Failed to load order details";
      })

      // -------------------------
      // UPDATE ORDER STATUS
      // -------------------------
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action?.payload?.message || "Order status updated";

        const { id, orderStatus } = action.payload.meta || {};
        if (state.orderDetails && state.orderDetails._id === id) {
          state.orderDetails.orderStatus = orderStatus;
          state.orderDetails.orderUpdateDate = new Date().toISOString();
        }
        state.orderList = (state.orderList || []).map((o) =>
          o._id === id
            ? {
                ...o,
                orderStatus,
                orderUpdateDate: new Date().toISOString(),
              }
            : o
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action?.payload?.message || "Failed to update order status";
      })

      // -------------------------
      // UPDATE PAYMENT STATUS
      // -------------------------
      .addCase(updatePaymentStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action?.payload?.message || "Payment status updated";

        const { id, paymentStatus } = action.payload.meta || {};
        if (state.orderDetails && state.orderDetails._id === id) {
          state.orderDetails.paymentStatus = paymentStatus;
          state.orderDetails.orderUpdateDate = new Date().toISOString();
        }
        state.orderList = (state.orderList || []).map((o) =>
          o._id === id
            ? {
                ...o,
                paymentStatus,
                orderUpdateDate: new Date().toISOString(),
              }
            : o
        );
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action?.payload?.message || "Failed to update payment status";
      })

      // -------------------------
      // ✅ UPDATE ORDER PRICE
      // -------------------------
      .addCase(updateOrderPrice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOrderPrice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action?.payload?.message || "Order price updated";

        const { id, totalAmount } = action.payload.meta || {};

        // update details instantly so header updates without refetch
        if (state.orderDetails && state.orderDetails._id === id) {
          state.orderDetails.totalAmount = totalAmount;
          state.orderDetails.orderUpdateDate = new Date().toISOString();
        }

        // update list instantly too
        state.orderList = (state.orderList || []).map((o) =>
          o._id === id
            ? {
                ...o,
                totalAmount,
                orderUpdateDate: new Date().toISOString(),
              }
            : o
        );
      })
      .addCase(updateOrderPrice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action?.payload?.message || "Failed to update order price";
      })

      // -------------------------
      // CREATE STEADFAST PARCEL
      // -------------------------
      .addCase(createSteadfastParcelForOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSteadfastParcelForOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action?.payload?.message || "Steadfast parcel created";

        const updatedOrder = action?.payload?.data;
        if (updatedOrder?._id) {
          if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
            state.orderDetails = updatedOrder;
          }
          state.orderList = (state.orderList || []).map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o
          );
        }
      })
      .addCase(createSteadfastParcelForOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action?.payload?.message || "Failed to create Steadfast parcel";
      })

      // -------------------------
      // SYNC STEADFAST STATUS
      // -------------------------
      .addCase(syncSteadfastStatusForOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(syncSteadfastStatusForOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action?.payload?.message || "Steadfast status synced";

        const payloadData = action?.payload?.data;

        if (payloadData?._id) {
          const updatedOrder = payloadData;

          if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
            state.orderDetails = updatedOrder;
          }
          state.orderList = (state.orderList || []).map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o
          );
          return;
        }

        const orderId = payloadData?.orderId;
        if (orderId) {
          if (state.orderDetails && state.orderDetails._id === orderId) {
            state.orderDetails.orderStatus =
              payloadData.orderStatus || state.orderDetails.orderStatus;
            state.orderDetails.steadfast =
              payloadData.steadfast || state.orderDetails.steadfast;
          }
          state.orderList = (state.orderList || []).map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  orderStatus: payloadData.orderStatus || o.orderStatus,
                  steadfast: payloadData.steadfast || o.steadfast,
                }
              : o
          );
        }
      })
      .addCase(syncSteadfastStatusForOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action?.payload?.message || "Failed to sync Steadfast status";
      });
  },
});

export const { resetOrderDetails, clearAdminOrderMessages } =
  adminOrderSlice.actions;

export default adminOrderSlice.reducer;
