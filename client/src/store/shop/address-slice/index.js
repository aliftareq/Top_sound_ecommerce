import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { http } from "@/lib/http";

const GUEST_ADDRESS_KEY = "guest_addresses";

const loadGuestAddressesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_ADDRESS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestAddressesToStorage = (list) => {
  localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(list));
};

const initialState = {
  isLoading: false,
  addressList: [],       // ✅ logged-in (DB)
  guestAddressList: [],  // ✅ guest (localStorage)
};

// =====================
// Logged-in async thunks
// =====================
export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData) => {
    const response = await http.post("/api/shop/address/add", formData);
    return response.data;
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId) => {
    const response = await http.get(`/api/shop/address/get/${userId}`);
    return response.data;
  }
);

export const editaAddress = createAsyncThunk(
  "/addresses/editaAddress",
  async ({ userId, addressId, formData }) => {
    const response = await http.put(
      `/api/shop/address/update/${userId}/${addressId}`,
      formData
    );
    return response.data;
  }
);

export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }) => {
    const response = await http.delete(
      `/api/shop/address/delete/${userId}/${addressId}`
    );
    return response.data;
  }
);

// =====================
// Slice
// =====================
const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // ✅ Guest "fetch" (hydrate from localStorage)
    loadGuestAddresses: (state) => {
      state.guestAddressList = loadGuestAddressesFromStorage();
    },

    // ✅ Guest add
    addGuestAddress: (state, action) => {
      const payload = action.payload || {};

      // create local id
      const newAddress = {
        _id: crypto?.randomUUID?.() || String(Date.now()),
        name: payload.name || "",
        fullAddress: payload.fullAddress || "",
        district: payload.district || "",
        thana: payload.thana || "",
        phone: payload.phone || "",
        notes: payload.notes || "",
      };

      const list = state.guestAddressList || [];
      const next = [...list, newAddress];

      state.guestAddressList = next;
      saveGuestAddressesToStorage(next);
    },

    // ✅ Guest edit
    editGuestAddress: (state, action) => {
      const { addressId, formData } = action.payload || {};
      if (!addressId) return;

      const list = state.guestAddressList || [];
      const idx = list.findIndex((a) => a._id === addressId);
      if (idx === -1) return;

      const updated = {
        ...list[idx],
        ...formData,
      };

      const next = list.map((a, i) => (i === idx ? updated : a));
      state.guestAddressList = next;
      saveGuestAddressesToStorage(next);
    },

    // ✅ Guest delete
    deleteGuestAddress: (state, action) => {
      const { addressId } = action.payload || {};
      if (!addressId) return;

      const next = (state.guestAddressList || []).filter((a) => a._id !== addressId);
      state.guestAddressList = next;
      saveGuestAddressesToStorage(next);
    },

    // optional helper
    clearGuestAddresses: (state) => {
      state.guestAddressList = [];
      saveGuestAddressesToStorage([]);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload?.data || [];
      })
      .addCase(fetchAllAddresses.rejected, (state) => {
        state.isLoading = false;
        state.addressList = [];
      })
      .addCase(editaAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editaAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(editaAddress.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteAddress.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  loadGuestAddresses,
  addGuestAddress,
  editGuestAddress,
  deleteGuestAddress,
  clearGuestAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;