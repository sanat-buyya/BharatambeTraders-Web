import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../app/api/axiosInstance";

// Async Thunks
export const fetchInvoices = createAsyncThunk(
  "billing/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/billing");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load invoices log"
      );
    }
  }
);

export const checkout = createAsyncThunk(
  "billing/checkout",
  async (checkoutData, { getState, rejectWithValue }) => {
    try {
      // checkoutData should contain: customerName, customerPhone, items, discountPercent, paymentMethod
      const state = getState().billing;
      
      const payload = {
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        items: state.cart,
        discountPercent: state.discount,
        paymentMethod: state.paymentMethod,
      };

      const response = await axiosInstance.post("/billing", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Checkout failed"
      );
    }
  }
);

export const refundInvoice = createAsyncThunk(
  "billing/refundInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const id = invoiceId._id || invoiceId;
      const response = await axiosInstance.put(`/billing/${id}/refund`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process refund"
      );
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    cart: [],
    customerName: "",
    customerPhone: "",
    discount: 0, // Percent
    paymentMethod: "Cash",
    invoices: [],
    loading: false,
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      // payload: product object
      const product = action.payload;
      const existingItem = state.cart.find(item => (item.id === product.id || item.productId === product.id));

      if (existingItem) {
        if (existingItem.qty < product.stock) {
          existingItem.qty += 1;
        }
      } else {
        if (product.stock > 0) {
          state.cart.push({
            id: product.id || product._id,
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            gstRate: product.gstRate,
            sku: product.sku,
            qty: 1,
            maxStock: product.stock
          });
        }
      }
    },
    removeFromCart: (state, action) => {
      // payload: product id
      state.cart = state.cart.filter(item => (item.id !== action.payload && item.productId !== action.payload));
    },
    updateCartQty: (state, action) => {
      // payload: { id, qty }
      const { id, qty } = action.payload;
      const existingItem = state.cart.find(item => (item.id === id || item.productId === id));
      if (existingItem) {
        if (qty <= 0) {
          state.cart = state.cart.filter(item => (item.id !== id && item.productId !== id));
        } else {
          existingItem.qty = Math.min(qty, existingItem.maxStock);
        }
      }
    },
    setCustomerInfo: (state, action) => {
      // payload: { name, phone }
      state.customerName = action.payload.name;
      state.customerPhone = action.payload.phone;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setDiscount: (state, action) => {
      // payload: discount percentage
      state.discount = action.payload;
    },
    clearCart: (state) => {
      state.cart = [];
      state.customerName = "";
      state.customerPhone = "";
      state.discount = 0;
      state.paymentMethod = "Cash";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        // Map _id to id for backward compatibility
        state.invoices = action.payload.map(inv => ({
          ...inv,
          id: inv.invoiceId, // UI relies on inv.id to show the code e.g. INV-2026-0001
        }));
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Checkout Invoice
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift({
          ...action.payload,
          id: action.payload.invoiceId,
        });
        // Clear cart values after checkout success
        state.cart = [];
        state.customerName = "";
        state.customerPhone = "";
        state.discount = 0;
        state.paymentMethod = "Cash";
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Refund Invoice
      .addCase(refundInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex(
          inv => (inv._id === action.payload._id || inv.id === action.payload.invoiceId)
        );
        if (index !== -1) {
          state.invoices[index] = {
            ...action.payload,
            id: action.payload.invoiceId,
          };
        }
      })
      .addCase(refundInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  setCustomerInfo,
  setPaymentMethod,
  setDiscount,
  clearCart
} = billingSlice.actions;

export default billingSlice.reducer;
