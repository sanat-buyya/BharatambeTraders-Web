import { createSlice } from "@reduxjs/toolkit";

const initialInvoices = [
  {
    id: "INV-2026-0001",
    date: "2026-06-14T11:24:00.000Z",
    customerName: "Anil Deshmukh",
    customerPhone: "9448123456",
    items: [
      { id: 1, name: "Bhagavad Gita", price: 349.0, qty: 1, gstRate: 0, sku: "BK-BG-001" },
      { id: 3, name: "Pilot V7 Hi-Tecpoint Pen", price: 70.0, qty: 5, gstRate: 18, sku: "ST-PL-003" }
    ],
    subtotal: 699.0,
    discountPercent: 10,
    discountAmount: 69.9,
    gstAmount: 63.0, // 350 * 18% = 63
    total: 692.1,
    paymentMethod: "UPI",
    status: "Paid"
  },
  {
    id: "INV-2026-0002",
    date: "2026-06-15T15:45:00.000Z",
    customerName: "Sunita Patil",
    customerPhone: "9880567890",
    items: [
      { id: 2, name: "Premium Yoga Mat", price: 999.0, qty: 1, gstRate: 12, sku: "SP-YM-002" },
      { id: 8, name: "Stainless Steel Water Bottle", price: 650.0, qty: 1, gstRate: 18, sku: "SP-WB-008" }
    ],
    subtotal: 1649.0,
    discountPercent: 5,
    discountAmount: 82.45,
    gstAmount: 236.88, // 999*12%=119.88 + 650*18%=117
    total: 1803.43,
    paymentMethod: "Card",
    status: "Paid"
  },
  {
    id: "INV-2026-0003",
    date: "2026-06-16T18:10:00.000Z",
    customerName: "Pooja Hegde",
    customerPhone: "8123456789",
    items: [
      { id: 4, name: "Classmate Notebook A4", price: 60.0, qty: 10, gstRate: 12, sku: "ST-CM-004" },
      { id: 3, name: "Pilot V7 Hi-Tecpoint Pen", price: 70.0, qty: 10, gstRate: 18, sku: "ST-PL-003" }
    ],
    subtotal: 1300.0,
    discountPercent: 0,
    discountAmount: 0,
    gstAmount: 198.0, // 600*12%=72 + 700*18%=126
    total: 1498.0,
    paymentMethod: "Cash",
    status: "Paid"
  },
  {
    id: "INV-2026-0004",
    date: "2026-06-17T12:05:00.000Z",
    customerName: "Rahul Shinde",
    customerPhone: "7012345678",
    items: [
      { id: 5, name: "Professional Watercolor Set", price: 1250.0, qty: 1, gstRate: 18, sku: "AR-WC-005" },
      { id: 9, name: "Wooden Desk Organizer", price: 499.0, qty: 2, gstRate: 12, sku: "ST-DO-009" }
    ],
    subtotal: 2248.0,
    discountPercent: 8,
    discountAmount: 179.84,
    gstAmount: 344.76, // 1250*18%=225 + 998*12%=119.76
    total: 2412.92,
    paymentMethod: "UPI",
    status: "Paid"
  },
  {
    id: "INV-2026-0005",
    date: "2026-06-18T10:30:00.000Z",
    customerName: "Basavaraj K.",
    customerPhone: "9008987654",
    items: [
      { id: 1, name: "Bhagavad Gita", price: 349.0, qty: 2, gstRate: 0, sku: "BK-BG-001" },
      { id: 6, name: "Leather Bound Journal", price: 599.0, qty: 1, gstRate: 18, sku: "ST-LJ-006" }
    ],
    subtotal: 1297.0,
    discountPercent: 12,
    discountAmount: 155.64,
    gstAmount: 107.82, // 599*18%=107.82
    total: 1249.18,
    paymentMethod: "Cash",
    status: "Paid"
  },
  {
    id: "INV-2026-0006",
    date: "2026-06-19T16:20:00.000Z",
    customerName: "Vijay More",
    customerPhone: "9482123987",
    items: [
      { id: 7, name: "Cricket Leather Ball", price: 350.0, qty: 5, gstRate: 12, sku: "SP-CL-007" },
      { id: 8, name: "Stainless Steel Water Bottle", price: 650.0, qty: 2, gstRate: 18, sku: "SP-WB-008" }
    ],
    subtotal: 3050.0,
    discountPercent: 15,
    discountAmount: 457.5,
    gstAmount: 444.0, // 1750*12%=210 + 1300*18%=234
    total: 3036.5,
    paymentMethod: "UPI",
    status: "Paid"
  }
];

const loadInvoicesFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("bt_invoices");
    if (serializedState === null) {
      localStorage.setItem("bt_invoices", JSON.stringify(initialInvoices));
      return initialInvoices;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return initialInvoices;
  }
};

const saveInvoicesToLocalStorage = (invoices) => {
  try {
    localStorage.setItem("bt_invoices", JSON.stringify(invoices));
  } catch (err) {
    // ignore
  }
};

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    cart: [],
    customerName: "",
    customerPhone: "",
    discount: 0, // Percent
    paymentMethod: "Cash",
    invoices: loadInvoicesFromLocalStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      // payload: product object
      const product = action.payload;
      const existingItem = state.cart.find(item => item.id === product.id);

      if (existingItem) {
        if (existingItem.qty < product.stock) {
          existingItem.qty += 1;
        }
      } else {
        if (product.stock > 0) {
          state.cart.push({
            id: product.id,
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
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },
    updateCartQty: (state, action) => {
      // payload: { id, qty }
      const { id, qty } = action.payload;
      const existingItem = state.cart.find(item => item.id === id);
      if (existingItem) {
        if (qty <= 0) {
          state.cart = state.cart.filter(item => item.id !== id);
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
      // payload: discount percentage (integer)
      state.discount = action.payload;
    },
    clearCart: (state) => {
      state.cart = [];
      state.customerName = "";
      state.customerPhone = "";
      state.discount = 0;
      state.paymentMethod = "Cash";
    },
    checkout: (state, action) => {
      // payload: computed values from POS { subtotal, discountAmount, gstAmount, total, invoiceId }
      const { subtotal, discountAmount, gstAmount, total, invoiceId } = action.payload;
      
      const newInvoice = {
        id: invoiceId || `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(4, "0")}`,
        date: new Date().toISOString(),
        customerName: state.customerName || "Walk-in Customer",
        customerPhone: state.customerPhone || "N/A",
        items: [...state.cart],
        subtotal,
        discountPercent: state.discount,
        discountAmount,
        gstAmount,
        total,
        paymentMethod: state.paymentMethod,
        status: "Paid"
      };

      state.invoices.unshift(newInvoice); // Add to the top of the history list
      saveInvoicesToLocalStorage(state.invoices);
      
      // Reset POS cart state after checkout
      state.cart = [];
      state.customerName = "";
      state.customerPhone = "";
      state.discount = 0;
      state.paymentMethod = "Cash";
    },
    refundInvoice: (state, action) => {
      // payload: invoiceId
      const invoice = state.invoices.find(inv => inv.id === action.payload);
      if (invoice) {
        invoice.status = "Refunded";
        saveInvoicesToLocalStorage(state.invoices);
      }
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  setCustomerInfo,
  setPaymentMethod,
  setDiscount,
  clearCart,
  checkout,
  refundInvoice
} = billingSlice.actions;

export default billingSlice.reducer;
