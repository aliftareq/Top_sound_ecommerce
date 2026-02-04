import { http } from "@/lib/http";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  reviews: [],
  message: "",
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata) => {
    const response = await http.post(`/api/shop/review/add`, formdata);

    return response.data;
  },
);

export const getReviews = createAsyncThunk("/order/getReviews", async (id) => {
  const response = await http.get(`/api/shop/review/${id}`);

  return response.data;
});

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(addReview.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      });
  },
});

export default reviewSlice.reducer;
