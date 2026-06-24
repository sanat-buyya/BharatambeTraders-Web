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

  // Quotation & PDF settings
  const [isQuotation, setIsQuotation] = useState(false);
  const [pageSize, setPageSize] = useState("auto");
  const [orientation, setOrientation] = useState("portrait");

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

    dispatch(checkout({
      discountType,
      discountValue,
      isQuotation,
    })).then((res) => {
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
          isQuotation: savedInvoice.isQuotation,
        });

        // Trigger products refetch to synchronize stock counters instantly
        dispatch(fetchProducts());
        
        // Clear local discount input
        setDiscountValue(0);
        setIsQuotation(false); // Reset quotation toggle

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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-receipt {
              max-width: 480px;
              margin: 0 auto;
              border: 3px double #94a3b8;
              border-top: 10px solid #556b2f;
              border-radius: 8px;
              padding: 20px;
              background-color: #fff;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
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
              max-height: 40px;
              width: auto;
              object-fit: contain;
            }
            .shop-header-banner {
              background-color: #e2ebc8 !important;
              color: #0f172a !important;
              padding: 4px 10px;
              font-size: 9px;
              font-weight: 700;
              display: flex;
              justify-content: space-between;
              border-top-left-radius: 6px;
              border-top-right-radius: 6px;
            }
            .shop-title-banner {
              background-color: #6b8e23 !important;
              color: #ffffff !important;
              padding: 10px;
              text-align: center;
            }
            .shop-title-text {
              font-size: 18px;
              font-weight: 900;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .shop-subtitle-text {
              font-size: 9.5px;
              font-weight: 700;
              letter-spacing: 2px;
              margin: 2px 0 0 0;
            }
            .shop-address-banner {
              background-color: #e2ebc8 !important;
              color: #0f172a !important;
              padding: 8px 12px;
              text-align: center;
              font-size: 8.5px;
              font-weight: 700;
              border-bottom-left-radius: 6px;
              border-bottom-right-radius: 6px;
            }
            .shop-tagline {
              font-size: 7.5px;
              font-weight: normal;
              margin-top: 4px;
              color: #374151 !important;
            }
            .document-title-container {
              padding: 12px 0;
              text-align: center;
            }
            .document-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              text-decoration: underline;
              color: #000 !important;
              letter-spacing: 1px;
            }
            
            /* Borders for receipt data */
            .details-box {
              background-color: #fff !important;
              border: 1px solid #94a3b8 !important;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 12px;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 9.5px;
              font-weight: 700;
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
            
            /* Bordered Table Grid */
            .receipt-table-container {
              border: 1px solid #94a3b8 !important;
              border-radius: 6px;
              overflow: hidden;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
            }
            .receipt-table th {
              background-color: #0f172a !important;
              color: #ffffff !important;
              font-weight: 700;
              font-size: 8.5px;
              text-transform: uppercase;
              padding: 6px 8px;
              border-bottom: 1px solid #94a3b8 !important;
              border-right: 1px solid #94a3b8 !important;
            }
            .receipt-table th:last-child {
              border-right: none !important;
            }
            .receipt-table td {
              padding: 6px 8px;
              font-size: 9.5px;
              border-bottom: 1px solid #e2e8f0 !important;
              border-right: 1px solid #94a3b8 !important;
              color: #1e293b !important;
            }
            .receipt-table td:last-child {
              border-right: none !important;
            }
            .receipt-table tr:last-child td {
              border-bottom: none !important;
            }
            
            /* Calculations inner table */
            .inner-calc-table {
              width: 100%;
              border-collapse: collapse;
            }
            .inner-calc-table td {
              padding: 4px 8px !important;
              border: none !important;
              font-size: 9px !important;
            }
            .inner-calc-table tr:not(:last-child) td {
              border-bottom: 1px solid #e2e8f0 !important;
            }
            
            /* Footer & Signatures */
            .footer-sig-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 20px;
              padding: 0 8px;
            }
            .footer-thankyou {
              font-weight: 700;
              font-style: italic;
              font-size: 9.5px;
              color: #0f172a !important;
            }
            .sig-block {
              text-align: right;
              width: 140px;
            }
            .sig-line {
              border-bottom: 1px solid #94a3b8 !important;
              margin-bottom: 4px;
            }
            .sig-text {
              font-size: 8.5px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569 !important;
            }

            .divider-dashed {
              border-bottom: 1px dashed #cbd5e1;
              margin: 12px 0;
            }
            .divider-solid {
              border-bottom: 1px solid #e2e8f0;
              margin: 12px 0;
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

  const getDynamicPdfUrl = () => {
    if (!receiptData?._id) return "";
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    const token = user?.token || "";
    return `${serverUrl}/api/billing/${receiptData._id}/pdf?pageSize=${pageSize}&orientation=${orientation}&token=${token}&t=${Date.now()}`;
  };

  const getPdfDownloadLink = () => {
    return getDynamicPdfUrl();
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

        {/* Quotation / Estimate Toggle */}
        <div className="flex items-center gap-2.5 py-1 select-none">
          <input
            type="checkbox"
            id="isQuotation"
            checked={isQuotation}
            onChange={(e) => setIsQuotation(e.target.checked)}
            className="w-4 h-4 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-orange-500 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="isQuotation" className="text-xs font-semibold text-slate-350 cursor-pointer">
            Generate as Quotation / Estimate
          </label>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> {receiptData.isQuotation ? "Quotation / Estimate Generated" : "Tax Invoice Generated"}
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

            {/* Split Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-[68vh]">
              {/* Left Column: PDF Iframe Preview */}
              <div className="flex-1 bg-slate-950 border-r border-slate-850 flex flex-col h-full min-h-[300px] md:min-h-0">
                <div className="p-3 bg-slate-950 border-b border-slate-850 flex flex-wrap justify-between items-center gap-2">
                  <span className="font-bold text-xs text-slate-300">Live Generated PDF Preview</span>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Size:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-350"
                    >
                      <option value="auto">Auto-Fit</option>
                      <option value="A4">A4 Paper</option>
                      <option value="A3">A3 Paper</option>
                    </select>

                    <label className="text-[10px] text-slate-500 font-bold uppercase">Layout:</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-350"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                <iframe
                  src={getDynamicPdfUrl()}
                  className="w-full h-full flex-1 border-none bg-slate-950"
                  title="Live Invoice PDF"
                />
              </div>

              {/* Right Column: HTML Print Preview */}
              <div className="w-full md:w-[480px] overflow-y-auto p-4 bg-slate-950 flex flex-col h-full">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 text-center">
                  POS Print Receipt Preview
                </div>
                <div className="bg-white p-4 rounded-lg overflow-y-auto flex-1 max-h-full" style={{ color: "#1e293b" }}>
                  <div id="invoice-print-area">
                    <div className="print-receipt">
                      {/* GSTIN / MOBILE Light olive green banner */}
                      <div className="shop-header-banner">
                        <span>REG.GSTIN: {gstNumber}</span>
                        <span>MOBILE: {contactPhone}</span>
                      </div>

                      {/* Logo container if logoSrc exists */}
                      {logoSrc && (
                        <div className="logo-container">
                          <img src={logoSrc} alt="Logo" className="logo-img" />
                        </div>
                      )}

                      {/* Olive Green Shop Banner */}
                      <div className="shop-title-banner">
                        <h1 className="shop-title-text">{shopName.toUpperCase()}</h1>
                        <p className="shop-subtitle-text">WHOLE SALER'S</p>
                      </div>

                      {/* Light Green Address & Tagline Banner */}
                      <div className="shop-address-banner">
                        <p className="bold">{address.toUpperCase()}</p>
                        <p className="shop-tagline">
                          {profile.businessDescription || "OFFICE STATIONARY, SCHOOL ITEMS, ALL NOTE BOOKS, ZEROX PAPERS, SPORTS ITMES, COMPUTERS MATERIALS AND OTHERS MATERIALS"}
                        </p>
                      </div>

                      {/* Document Title */}
                      <div className="document-title-container">
                        <span className="document-title">
                          {receiptData.isQuotation ? "ESTIMATE / QUOTATION" : "CREDIT BILL"}
                        </span>
                      </div>

                      {/* Invoice Details Box */}
                      <div className="details-box">
                        <div className="details-row">
                          <span className="details-label">Bill No:</span>
                          <span className="details-val font-mono">{receiptData.id}</span>
                        </div>
                        <div className="details-row">
                          <span className="details-label">Date:</span>
                          <span className="details-val">{new Date(receiptData.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="details-row">
                          <span className="details-label">Customer Name:</span>
                          <span className="details-val">{receiptData.customerName.toUpperCase()}</span>
                        </div>
                        {receiptData.customerPhone && receiptData.customerPhone !== "N/A" && (
                          <div className="details-row">
                            <span className="details-label">Mobile No:</span>
                            <span className="details-val">{receiptData.customerPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Bordered Table Grid */}
                      <div className="receipt-table-container">
                        <table className="receipt-table">
                          <thead>
                            <tr>
                              <th style={{ width: "8%" }}>S.No</th>
                              <th style={{ width: "52%" }}>PARTICULARS</th>
                              <th style={{ width: "10%" }}>QTY</th>
                              <th style={{ width: "12%" }}>RATE</th>
                              <th style={{ width: "18%" }}>AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {receiptData.items.map((item, idx) => {
                              const lineTotal = item.price * item.qty;
                              return (
                                <tr key={idx}>
                                  <td className="text-center">{idx + 1}</td>
                                  <td className="bold">{item.name.toUpperCase()}</td>
                                  <td className="text-center font-mono">{item.qty}</td>
                                  <td className="text-right font-mono">₹{item.price.toFixed(2)}</td>
                                  <td className="text-right font-mono bold">₹{lineTotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                            
                            {/* Bank details and Calculations merged row */}
                            <tr>
                              <td colSpan="3" style={{ verticalAlign: "top", padding: "8px", borderRight: "1px solid #94a3b8" }}>
                                <div style={{ color: "#b91c1c", fontWeight: "bold", fontSize: "8.5px", marginBottom: "4px" }}>
                                  BANK ACCOUNT DETAILS:
                                </div>
                                <div style={{ fontSize: "7.5px", color: "#0f172a", lineHeight: "1.3" }}>
                                  <div>A/c Name: {shopName.toUpperCase()}</div>
                                  <div>Bank: CANARA BANK, BASAVAKALYAN BRANCH</div>
                                  <div>A/c No: 120033287950  |  IFSC: CNRB0010700</div>
                                </div>
                              </td>
                              <td colSpan="2" style={{ padding: "0" }}>
                                <table className="inner-calc-table">
                                  <tbody>
                                    <tr>
                                      <td className="bold" style={{ width: "40%" }}>TOTAL QTY:</td>
                                      <td className="text-right font-mono bold" style={{ width: "60%" }}>
                                        {receiptData.items.reduce((sum, item) => sum + item.qty, 0)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="bold">SUBTOTAL:</td>
                                      <td className="text-right font-mono">₹{receiptData.subtotal.toFixed(2)}</td>
                                    </tr>
                                    {receiptData.discountAmount > 0 && (
                                      <tr>
                                        <td className="bold text-rose-500">DISCOUNT:</td>
                                        <td className="text-right font-mono text-rose-500 font-bold">
                                          -₹{receiptData.discountAmount.toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td className="bold">CGST ({(receiptData.items[0]?.gstRate || 0) / 2}%):</td>
                                      <td className="text-right font-mono">₹{(receiptData.gstAmount / 2).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td className="bold">SGST ({(receiptData.items[0]?.gstRate || 0) / 2}%):</td>
                                      <td className="text-right font-mono">₹{(receiptData.gstAmount / 2).toFixed(2)}</td>
                                    </tr>
                                    <tr style={{ borderTop: "1px solid #94a3b8" }}>
                                      <td className="bold font-extrabold text-orange-600" style={{ fontSize: "10px" }}>
                                        {receiptData.isQuotation ? "ESTIMATED TOTAL" : "GRAND TOTAL"}
                                      </td>
                                      <td className="text-right font-mono font-black text-orange-600" style={{ fontSize: "11px" }}>
                                        ₹{receiptData.total.toFixed(2)}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footer & Signature block */}
                      <div className="footer-sig-container">
                        <div className="footer-thankyou">Thanku visit again</div>
                        <div className="sig-block">
                          <div className="sig-line"></div>
                          <div className="sig-text">Authorized signature</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
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
