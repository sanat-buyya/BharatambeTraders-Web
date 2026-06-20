import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaBoxes, FaPlus, FaTimes, FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { addProduct, updateProduct, deleteProduct } from "../inventorySlice";

function ProductList() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.inventory.products);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "Stationery",
    price: "",
    gstRate: "18",
    stock: "",
    image: ""
  });

  // Unique categories list for filters
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Calculations for KPI banners
  const totalProducts = products.length;
  const totalStockCount = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalInventoryValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Filtered products list
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = categoryFilter === "All" || prod.category === categoryFilter;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Handle Add Product Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      alert("Please fill all required fields.");
      return;
    }

    const newProd = {
      id: Date.now(),
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      gstRate: parseInt(formData.gstRate),
      stock: parseInt(formData.stock),
      image: formData.image
    };

    dispatch(addProduct(newProd));
    setShowAddModal(false);
    resetForm();
  };

  // Trigger Edit Modal
  const openEditModal = (prod) => {
    setCurrentProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      description: prod.description || "",
      category: prod.category,
      price: prod.price.toString(),
      gstRate: prod.gstRate.toString(),
      stock: prod.stock.toString(),
      image: prod.image || ""
    });
    setShowEditModal(true);
  };

  // Handle Edit Product Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedProd = {
      ...currentProduct,
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      gstRate: parseInt(formData.gstRate),
      stock: parseInt(formData.stock),
      image: formData.image
    };

    dispatch(updateProduct(updatedProd));
    setShowEditModal(false);
    resetForm();
  };

  // Handle Delete Product
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      dispatch(deleteProduct(id));
    }
  };

  // Reset helper
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "Stationery",
      price: "",
      gstRate: "18",
      stock: "",
      image: ""
    });
    setCurrentProduct(null);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Inventory &amp; Products</h2>
            <p className="text-slate-400 text-sm mt-1">Manage catalog items, adjust unit costs, select tax GST codes, and log stock levels.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95"
          >
            <FaPlus /> Add New Product
          </button>
        </div>

        {/* Statistical KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Items Catalogued</span>
            <p className="text-xl font-bold text-white mt-1">{totalProducts} Products</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Total Units Stocked</span>
            <p className="text-xl font-bold text-white mt-1">{totalStockCount} Units</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Estimated Stock Value</span>
            <p className="text-xl font-bold text-white mt-1">₹{totalInventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Out of Stock Alerts</span>
            <p className={`text-xl font-bold mt-1 ${outOfStockCount > 0 ? "text-rose-500 animate-pulse" : "text-white"}`}>
              {outOfStockCount} Alerts
            </p>
          </div>
        </div>

        {/* Search and Filters toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 p-4 rounded-xl border border-slate-900/60">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search by product name, SKU or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <IoSearch className="absolute left-3.5 top-3 text-slate-500" size={16} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Category:</span>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-855 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory list Table */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-2">Product Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-right">Base Price</th>
                  <th className="py-3 px-2 text-right">GST Map</th>
                  <th className="py-3 px-2 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-300">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock === 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">{prod.sku}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-950 border border-slate-900 rounded-md overflow-hidden flex items-center justify-center text-slate-700">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <FaBoxes size={18} />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{prod.name}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px]">{prod.description || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-slate-400">{prod.category}</td>
                      <td className="py-4 px-2 text-right font-bold text-white">₹{prod.price.toFixed(2)}</td>
                      <td className="py-4 px-2 text-right text-slate-400">{prod.gstRate}% GST</td>
                      <td className="py-4 px-2 text-center font-bold">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs
                          ${isOutOfStock 
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black animate-pulse" 
                            : isLowStock 
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }
                        `}>
                          {(isOutOfStock || isLowStock) && <FaExclamationTriangle className="text-[10px]" />}
                          {isOutOfStock ? "Out of Stock" : `${prod.stock} left`}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded border border-slate-700 transition"
                            title="Edit product"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded border border-rose-500/20 transition"
                            title="Delete product"
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500 text-sm">No inventory items match active filter query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaBoxes className="text-orange-500" /> Add New Inventory Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">SKU Code (Unique) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Sports">Sports</option>
                    <option value="Art Supplies">Art Supplies</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">GST Rate (%)</label>
                  <select 
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Base Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Stock Quantity *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-900">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold"
                >
                  Create Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaEdit className="text-orange-500" /> Edit Product Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-200">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">SKU Code *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Sports">Sports</option>
                    <option value="Art Supplies">Art Supplies</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">GST Rate (%)</label>
                  <select 
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Base Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Stock Quantity *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Image URL</label>
                <input 
                  type="text" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-lg p-2 bg-slate-950 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-900">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-850 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductList;
