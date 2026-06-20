import { createSlice } from "@reduxjs/toolkit";

const initialProducts = [
  {
    id: 1,
    name: "Bhagavad Gita",
    description: "Sacred Hindu scripture in Sanskrit with English translations.",
    category: "Books",
    price: 349.0,
    gstRate: 0, // Books are mostly exempt in India
    stock: 25,
    sku: "BK-BG-001",
    image: "https://www.mahakaalprasad.com/cdn/shop/files/71jiacOsB7L._SY425.jpg?v=1714472043",
  },
  {
    id: 2,
    name: "Premium Yoga Mat",
    description: "Non-slip 6mm yoga mat for exercises and fitness.",
    category: "Sports",
    price: 999.0,
    gstRate: 12,
    stock: 15,
    sku: "SP-YM-002",
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400",
  },
  {
    id: 3,
    name: "Pilot V7 Hi-Tecpoint Pen",
    description: "Liquid ink rollerball pen, blue, 0.7mm fine tip.",
    category: "Stationery",
    price: 70.0,
    gstRate: 18,
    stock: 120,
    sku: "ST-PL-003",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400",
  },
  {
    id: 4,
    name: "Classmate Notebook A4",
    description: "Single line, A4 notebook, 172 pages, soft cover.",
    category: "Stationery",
    price: 60.0,
    gstRate: 12,
    stock: 85,
    sku: "ST-CM-004",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
  },
  {
    id: 5,
    name: "Professional Watercolor Set",
    description: "24 vibrant watercolor tubes with professional mixing palette.",
    category: "Art Supplies",
    price: 1250.0,
    gstRate: 18,
    stock: 10,
    sku: "AR-WC-005",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
  },
  {
    id: 6,
    name: "Leather Bound Journal",
    description: "Handcrafted vintage style leather journal for writing.",
    category: "Stationery",
    price: 599.0,
    gstRate: 18,
    stock: 18,
    sku: "ST-LJ-006",
    image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400",
  },
  {
    id: 7,
    name: "Cricket Leather Ball",
    description: "Four-piece alum tanned red leather ball for match play.",
    category: "Sports",
    price: 350.0,
    gstRate: 12,
    stock: 45,
    sku: "SP-CL-007",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400",
  },
  {
    id: 8,
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated water bottle, 1 Liter.",
    category: "Sports",
    price: 650.0,
    gstRate: 18,
    stock: 30,
    sku: "SP-WB-008",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
  },
  {
    id: 9,
    name: "Wooden Desk Organizer",
    description: "Multi-functional wooden stand for pens, sticky notes, and cards.",
    category: "Stationery",
    price: 499.0,
    gstRate: 12,
    stock: 8,
    sku: "ST-DO-009",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400",
  }
];

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("bt_inventory");
    if (serializedState === null) {
      localStorage.setItem("bt_inventory", JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return initialProducts;
  }
};

const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("bt_inventory", serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    products: loadFromLocalStorage(),
  },
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
      saveToLocalStorage(state.products);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
        saveToLocalStorage(state.products);
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      saveToLocalStorage(state.products);
    },
    deductStock: (state, action) => {
      // payload: array of { id, qty }
      action.payload.forEach(({ id, qty }) => {
        const product = state.products.find(p => p.id === id);
        if (product) {
          product.stock = Math.max(0, product.stock - qty);
        }
      });
      saveToLocalStorage(state.products);
    },
    restockProduct: (state, action) => {
      // payload: { id, qty }
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.stock += action.payload.qty;
        saveToLocalStorage(state.products);
      }
    }
  }
});

export const { addProduct, updateProduct, deleteProduct, deductStock, restockProduct } = inventorySlice.actions;
export default inventorySlice.reducer;
