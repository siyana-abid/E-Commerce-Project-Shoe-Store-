import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCartItems, clearCart } = cartSlice.actions;

export default cartSlice.reducer;