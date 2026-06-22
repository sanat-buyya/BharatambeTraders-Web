import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { MdDeleteOutline, MdClear } from "react-icons/md";
import { FaUser, FaPhoneAlt, FaCalculator, FaBarcode, FaCheckCircle, FaPrint, FaTimes, FaSpinner, FaDownload } from "react-icons/fa";
import { 
  addToCart, 
  removeFromCart, 
  updateCartQty, 
  setCustomerInfo, 
  setPaymentMethod, 
  checkout,
  clearCart
} from "../billingSlice";
import { fetchProducts } from "../../inventory/inventorySlice";
import logo from "../../../assets/SLLogo.png";


function POS() {
  const dispatch = useDispatch();
  
  // Selectors
  const { products, loading: productsLoading } = useSelector((state) => state.inventory);
  const { cart, customerName, customerPhone, paymentMethod, loading: checkoutLoading } = useSelector((state) => state.billing);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Manual Discount states
  const [discountType, setDiscountType] = useState("percent"); // "percent" | "fixed"
  const [discountValue, setDiscountValue] = useState(0);

  // Load products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Categories list based on items
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Filters
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Totals calculations
  const calculateCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const subtotal = calculateCartSubtotal();

  const calculateDiscountAmount = () => {
    if (discountType === "fixed") {
      return Math.min(Number(discountValue) || 0, subtotal);
    }
    const pct = Number(discountValue) || 0;
    return (subtotal * pct) / 100;
  };

  const discountAmt = calculateDiscountAmount();
  const discountedSubtotal = subtotal - discountAmt;

  const calculateGstAmount = () => {
    const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;
    return cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.qty;
      const discountedItemSubtotal = itemSubtotal * discountRatio;
      const gstRate = item.gstRate || 0;
      return sum + (discountedItemSubtotal * gstRate) / 100;
    }, 0);
  };

  const gstAmt = calculateGstAmount();
  const grandTotal = discountedSubtotal + gstAmt;

  // Handle SKU Quick add
  const handleSkuSearch = (e) => {
    if (e.key === "Enter") {
      const match = products.find(p => p.sku.toLowerCase() === searchTerm.toLowerCase());
      if (match) {
        const inCartItem = cart.find(c => c.productId === match._id);
        const cartQty = inCartItem ? inCartItem.qty : 0;
        if (match.stock > cartQty) {
          dispatch(addToCart(match));
          setSearchTerm("");
        } else {
          alert(`Item ${match.name} is out of stock / limit reached!`);
        }
      }
    }
  };

  // Perform Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty! Add products to checkout.");
      return;
    }

    dispatch(checkout()).then((res) => {
      if (!res.error) {
        const savedInvoice = res.payload;
        
        // Save receipt detail local state for print layout
        setReceiptData({
          id: savedInvoice.invoiceId,
          _id: savedInvoice._id,
          date: savedInvoice.date,
          customerName: savedInvoice.customerName,
          customerPhone: savedInvoice.customerPhone,
          items: [...savedInvoice.items],
          subtotal: savedInvoice.subtotal,
          discountPercent: savedInvoice.discountPercent,
          discountAmount: savedInvoice.discountAmount,
          gstAmount: savedInvoice.gstAmount,
          total: savedInvoice.total,
          paymentMethod: savedInvoice.paymentMethod,
          pdfUrl: savedInvoice.pdfUrl,
        });

        // Trigger products refetch to synchronize stock counters instantly
        dispatch(fetchProducts());
        
        // Clear local discount input
        setDiscountValue(0);

        // Open printing popup modal
        setShowCheckoutModal(true);
      } else {
        alert(res.payload || "Checkout failed");
      }
    });
  };

  // Browser Printing Trigger
  const triggerPrint = () => {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${receiptData?.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              padding: 20px; 
              color: #1e293b; 
              font-size: 11px; 
              line-height: 1.5;
              background-color: #fff;
            }
            .print-receipt {
              max-width: 480px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: 700; }
            .extra-bold { font-weight: 800; }
            
            /* Logo & Header */
            .logo-container {
              display: flex;
              justify-content: center;
              margin-bottom: 8px;
            }
            .logo-img {
              max-height: 48px;
              width: auto;
              object-fit: contain;
            }
            .shop-title {
              font-size: 16px;
              font-weight: 850;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 4px 0;
            }
            .shop-meta {
              font-size: 9.5px;
              color: #64748b;
              margin: 2px 0;
            }
            
            .divider-dashed { 
              border-bottom: 1px dashed #cbd5e1; 
              margin: 12px 0; 
            }
            .divider-solid { 
              border-bottom: 1px solid #e2e8f0; 
              margin: 12px 0; 
            }
            
            /* Meta Details Box */
            .details-box {
              background-color: #f8fafc;
              border: 1px solid #f1f5f9;
              border-radius: 8px;
              padding: 10px 12px;
              margin-bottom: 14px;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 9.5px;
            }
            .details-label {
              color: #64748b;
              text-transform: uppercase;
              font-size: 8.5px;
              font-weight: 600;
              letter-spacing: 0.3px;
            }
            .details-val {
              color: #334155;
              font-weight: 600;
            }
            .font-mono {
              font-family: 'JetBrains Mono', 'Courier New', monospace;
            }
            
            /* Table Styling */
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 12px 0;
            }
            th { 
              background-color: #0f172a; 
              color: #ffffff;
              font-weight: 700; 
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              padding: 6px 8px;
              text-align: left;
            }
            td { 
              padding: 8px; 
              font-size: 9.5px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            
            /* Calculations block */
            .calc-block {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              margin-top: 10px;
            }
            .calc-container {
              width: 100%;
              max-width: 240px;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 9.5px;
              color: #475569;
            }
            .calc-row-total {
              display: flex;
              justify-content: space-between;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              font-weight: 800;
              color: #f97316;
            }
            
            /* Footer Message */
            .footer-msg {
              text-align: center;
              margin-top: 20px;
              font-size: 9px;
              color: #64748b;
            }
            .footer-thankyou {
              font-weight: 700;
              color: #0f172a;
              font-size: 10px;
              margin-bottom: 3px;
            }
            
            @page {
              size: auto;
              margin: 10mm;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="print-receipt">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPdfDownloadLink = () => {
    if (!receiptData?.pdfUrl) return "#";
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    return `${serverUrl}${receiptData.pdfUrl}`;
  };

  const profile = user?.profile || {};
  const shopName = profile.shopName || user?.businessName || "SmartLedger";
  const address = profile.businessAddress || "N/A Address";
  const gstNumber = profile.gstNumber || "N/A GSTIN";
  const contactPhone = profile.mobileNumber || user?.mobileNumber || "N/A Phone";
  const logoSrc = profile.logo || logo;

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-slate-950 text-slate-100 min-h-screen rounded-2xl border border-slate-900 overflow-hidden relative">
      
      {checkoutLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-3 text-sm text-slate-350">
            <FaSpinner className="animate-spin text-orange-500 text-3xl" />
            <span>Processing invoice transaction...</span>
          </div>
        </div>
      )}

      {/* LEFT: PRODUCTS BROWSER */}
      <div className="flex-1 p-6 space-y-6 flex flex-col h-full overflow-y-auto">
        
        {/* Search, SKU scanner input */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Search products, categories, or press Enter for barcode SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSkuSearch}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <IoSearch size={18} />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 cursor-help" title="Enter SKU to quick-add to cart">
              <FaBarcode size={18} className="text-orange-500" />
            </div>
          </div>

          <div className="text-xs text-slate-550 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-900">
            Scanner Port: <span className="text-emerald-450 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Category filtering chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                  ${isActive 
                    ? "bg-orange-500 text-white border-transparent shadow-md shadow-orange-500/10" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-800"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 relative">
          {productsLoading && (
            <div className="col-span-full py-16 flex items-center justify-center">
              <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            </div>
          )}
          
          {filteredProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            const inCart = cart.find(item => item.productId === product._id);
            const cartQty = inCart ? inCart.qty : 0;
            const remainingStock = product.stock - cartQty;

            return (
              <div 
                key={product._id}
                onClick={() => !outOfStock && remainingStock > 0 && dispatch(addToCart(product))}
                className={`group rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 relative select-none
                  ${outOfStock || remainingStock <= 0 
                    ? "bg-slate-950/40 border-slate-950 opacity-40 cursor-not-allowed" 
                    : "bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/70 cursor-pointer shadow-lg"
                  }
                `}
              >
                <div className="h-32 rounded-lg bg-slate-950 overflow-hidden mb-3 border border-slate-900 flex items-center justify-center text-slate-700 relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <FaBarcode size={42} className="text-slate-800" />
                  )}
                  {cartQty > 0 && (
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-md">
                      {cartQty} in Cart
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-slate-205 text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">{product.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-450 font-mono tracking-tight">{product.sku}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{product.description || "No description provided."}</p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900/80">
                  <div>
                    <span className="text-[10px] text-slate-550 block">Rate Cost</span>
                    <span className="text-sm font-black text-white">₹{product.price.toFixed(2)}</span>
                  </div>
                  
                  {outOfStock ? (
                    <span className="text-xs font-bold text-rose-500">Out of Stock</span>
                  ) : remainingStock <= 0 ? (
                    <span className="text-xs font-bold text-amber-500">Limit Reached</span>
                  ) : (
                    <div className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      Stock: <span className="font-bold text-slate-200">{remainingStock}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && !productsLoading && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-600">
              <FaBarcode size={48} className="animate-pulse mb-3" />
              <p className="text-sm">No items found matching the search terms.</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: CART AND CHECKOUT LOGIC */}
      <div className="w-full xl:w-96 bg-slate-900 border-t xl:border-t-0 xl:border-l border-slate-900 p-6 flex flex-col h-full overflow-y-auto space-y-6">
        
        {/* Customer logging */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 border-b border-slate-800 pb-2">Customer Details</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Walk-in Customer Name"
                value={customerName}
                onChange={(e) => dispatch(setCustomerInfo({ name: e.target.value, phone: customerPhone }))}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
              <FaUser size={12} className="absolute left-3 top-3 text-slate-600" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Phone Number (10 digits)"
                value={customerPhone}
                onChange={(e) => dispatch(setCustomerInfo({ name: customerName, phone: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
              <FaPhoneAlt size={12} className="absolute left-3 top-3 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 border-b border-slate-800 pb-2 flex justify-between">
            <span>Bill items</span>
            <span className="text-slate-500 font-normal">({cart.length} unique)</span>
          </h3>

          <div className="flex-1 divide-y divide-slate-800/50 overflow-y-auto max-h-[250px] mt-2 pr-1 space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                  <p className="text-[9px] text-slate-500">₹{item.price.toFixed(2)} | GST: {item.gstRate}%</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => dispatch(updateCartQty({ id: item.id, qty: item.qty - 1 }))}
                    className="w-5 h-5 rounded bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-slate-100">{item.qty}</span>
                  <button 
                    onClick={() => dispatch(updateCartQty({ id: item.id, qty: item.qty + 1 }))}
                    className="w-5 h-5 rounded bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="text-right pl-1">
                  <p className="font-bold text-slate-200 font-mono">₹{(item.price * item.qty).toFixed(2)}</p>
                  <button 
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-slate-655 hover:text-red-400 transition-colors mt-0.5"
                    title="Remove item"
                  >
                    <MdDeleteOutline size={16} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-600">
                <FaCalculator className="text-3xl mb-2" />
                <p className="text-xs">Cart is empty.</p>
                <p className="text-[10px] text-slate-700">Click products on left to build bill.</p>
              </div>
            )}
          </div>
        </div>

        {/* Calculations breakdown */}
        <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 text-xs">
          
          <div className="flex justify-between">
            <span className="text-slate-500">Cart Subtotal</span>
            <span className="font-semibold text-slate-300 font-mono">₹{subtotal.toFixed(2)}</span>
          </div>

          {/* Dynamic manual discount settings */}
          <div className="space-y-2 py-1 border-t border-b border-slate-900/80 my-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Discount type:</span>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => { setDiscountType("percent"); setDiscountValue(0); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition
                    ${discountType === "percent" ? "bg-orange-500 text-white border-transparent" : "bg-slate-900 border-slate-800 text-slate-400"}
                  `}
                >
                  % Percent
                </button>
                <button 
                  type="button"
                  onClick={() => { setDiscountType("fixed"); setDiscountValue(0); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition
                    ${discountType === "fixed" ? "bg-orange-500 text-white border-transparent" : "bg-slate-900 border-slate-800 text-slate-400"}
                  `}
                >
                  ₹ Fixed
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Enter Discount Value:</span>
              <input 
                type="number"
                min="0"
                max={discountType === "percent" ? "100" : subtotal}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right font-semibold font-mono text-slate-205 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Discount Amount</span>
            <span className="font-semibold text-rose-400 font-mono">-₹{discountAmt.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">CGST (Central Tax)</span>
            <span className="font-semibold text-slate-450 font-mono">₹{(gstAmt / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">SGST (State Tax)</span>
            <span className="font-semibold text-slate-450 font-mono">₹{(gstAmt / 2).toFixed(2)}</span>
          </div>

          <div className="h-px bg-slate-800/80 my-2"></div>

          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-200">Grand Total</span>
            <span className="text-base font-black text-orange-500 font-mono">₹{grandTotal.toFixed(2)}</span>
          </div>

        </div>

        {/* Payment mode choice */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Payment Method</span>
          <div className="grid grid-cols-3 gap-2">
            {["Cash", "UPI", "Card"].map((method) => {
              const active = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => dispatch(setPaymentMethod(method))}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all duration-150
                    ${active 
                      ? "bg-slate-950 border-orange-500 text-orange-400 font-extrabold shadow" 
                      : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200"
                    }
                  `}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || checkoutLoading}
          className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform transform active:scale-98 text-xs
            ${cart.length === 0 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            }
          `}
        >
          {checkoutLoading ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle /> Proceed to Checkout</>}
        </button>

      </div>

      {/* PRINTABLE INVOICE / CHECKOUT MODAL OVERLAY */}
      {showCheckoutModal && receiptData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Invoice Generated
              </h3>
              <button 
                onClick={() => {
                  setShowCheckoutModal(false);
                  setReceiptData(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Receipt details content (Scrollable area) */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-305 print:p-0" id="invoice-print-area">
              
              {/* Receipt Header branding */}
              <div className="text-center space-y-1">
                <div className="logo-container flex justify-center mb-2">
                  <img src={logoSrc} alt="Logo" className="logo-img max-h-12 w-auto object-contain rounded-lg border border-slate-800" />
                </div>
                <h2 className="shop-title text-base font-extrabold text-white uppercase tracking-wider">{shopName.toUpperCase()}</h2>
                <p className="shop-meta text-[10px] text-slate-400">{address}</p>
                <p className="shop-meta text-[10px] text-slate-400">Phone: {contactPhone}</p>
                <p className="shop-meta text-[10px] text-slate-400">GSTIN: {gstNumber}</p>
                <div className="divider-dashed border-b border-dashed border-slate-800 my-3"></div>
              </div>

              {/* Transaction Metadata Card */}
              <div className="details-box bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 text-[10px]">
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Invoice:</span>
                  <span className="details-val font-mono font-bold text-white">{receiptData.id}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Date:</span>
                  <span className="details-val text-slate-300">{new Date(receiptData.date).toLocaleString()}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Customer:</span>
                  <span className="details-val font-semibold text-slate-305">{receiptData.customerName}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Phone:</span>
                  <span className="details-val text-slate-305">{receiptData.customerPhone}</span>
                </div>
              </div>

              <div className="divider-dashed border-b border-dashed border-slate-800 my-2"></div>

              {/* Items List Table */}
              <table className="w-full text-left text-[10px] items-table">
                <thead>
                  <tr className="border-b border-dashed border-slate-800 font-bold text-white">
                    <th className="py-2 px-1 text-slate-400 text-left">Description</th>
                    <th className="py-2 text-center text-slate-400">Qty</th>
                    <th className="py-2 text-right text-slate-400">Rate</th>
                    <th className="py-2 text-right text-slate-400">GST</th>
                    <th className="py-2 text-right text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {receiptData.items.map((item, idx) => {
                    const lineTotal = item.price * item.qty;
                    return (
                      <tr key={idx} className="border-b border-slate-900/40">
                        <td className="py-2 px-1 max-w-[120px] truncate text-slate-200">{item.name}</td>
                        <td className="py-2 text-center font-mono text-slate-300">{item.qty}</td>
                        <td className="py-2 text-right font-mono text-slate-300">₹{item.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-slate-300">{item.gstRate || 0}%</td>
                        <td className="py-2 text-right font-mono font-bold text-white">₹{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="divider-dashed border-b border-dashed border-slate-800 my-2"></div>

              {/* Summary Calculations Block */}
              <div className="calc-block flex flex-col items-end w-full">
                <div className="calc-container w-full max-w-[240px] space-y-1.5 text-[10px] text-right text-slate-300">
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-mono text-slate-200">₹{receiptData.subtotal.toFixed(2)}</span>
                  </div>
                  {receiptData.discountAmount > 0 && (
                    <div className="calc-row flex justify-between text-rose-400 font-semibold">
                      <span>Discount ({receiptData.discountPercent.toFixed(0)}%):</span>
                      <span className="font-mono">-₹{receiptData.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">CGST (Central Tax):</span>
                    <span className="font-mono text-slate-200">₹{(receiptData.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">SGST (State Tax):</span>
                    <span className="font-mono text-slate-200">₹{(receiptData.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="divider-solid border-b border-slate-850 my-1.5"></div>
                  <div className="calc-row-total flex justify-between text-xs font-black text-orange-400 py-1">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base font-extrabold text-orange-400">₹{receiptData.total.toFixed(2)}</span>
                  </div>
                  <div className="calc-row flex justify-between text-emerald-400 font-bold border-t border-slate-900 pt-1.5">
                    <span>Paid Via ({receiptData.paymentMethod}):</span>
                    <span className="font-mono">₹{receiptData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="footer-msg text-center space-y-1 pt-4 text-slate-500 text-[10px]">
                <div className="divider-dashed border-b border-dashed border-slate-800 my-2"></div>
                <p className="footer-thankyou font-bold text-slate-300">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[9px] text-slate-550">Goods once sold will not be taken back without receipt verification.</p>
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="bg-slate-950 px-6 py-4 flex flex-col gap-2 border-t border-slate-900">
              <div className="flex gap-2">
                <button
                  onClick={triggerPrint}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-700 text-xs"
                >
                  <FaPrint /> Print Receipt
                </button>
                <a
                  href={getPdfDownloadLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-700 text-xs"
                >
                  <FaDownload /> Download PDF
                </a>
              </div>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setReceiptData(null);
                }}
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-bold text-xs mt-1"
              >
                Next Customer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default POS;
