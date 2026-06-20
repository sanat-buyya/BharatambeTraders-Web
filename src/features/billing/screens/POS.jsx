import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { MdDeleteOutline, MdClear } from "react-icons/md";
import { FaUser, FaPhoneAlt, FaCalculator, FaBarcode, FaCheckCircle, FaPrint, FaTimes } from "react-icons/fa";
import { 
  addToCart, 
  removeFromCart, 
  updateCartQty, 
  setCustomerInfo, 
  setPaymentMethod, 
  setDiscount, 
  checkout 
} from "../billingSlice";
import { deductStock } from "../../inventory/inventorySlice";
import logo from "../../../assets/BTLogo.png";

function POS() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.inventory.products);
  const cart = useSelector((state) => state.billing.cart);
  const customerName = useSelector((state) => state.billing.customerName);
  const customerPhone = useSelector((state) => state.billing.customerPhone);
  const discount = useSelector((state) => state.billing.discount);
  const paymentMethod = useSelector((state) => state.billing.paymentMethod);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

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

  const calculateDiscountAmount = (subtotal) => {
    return (subtotal * discount) / 100;
  };

  const calculateGstAmount = (subtotal, discountAmount) => {
    // Discount is applied proportionally across all items
    const discountRatio = subtotal > 0 ? (subtotal - discountAmount) / subtotal : 1;
    
    return cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.qty;
      const discountedItemSubtotal = itemSubtotal * discountRatio;
      const gstRate = item.gstRate || 0;
      return sum + (discountedItemSubtotal * gstRate) / 100;
    }, 0);
  };

  const subtotal = calculateCartSubtotal();
  const discountAmt = calculateDiscountAmount(subtotal);
  const gstAmt = calculateGstAmount(subtotal, discountAmt);
  const grandTotal = subtotal - discountAmt + gstAmt;

  // Handle SKU Quick add
  const handleSkuSearch = (e) => {
    if (e.key === "Enter") {
      const match = products.find(p => p.sku.toLowerCase() === searchTerm.toLowerCase());
      if (match) {
        if (match.stock > 0) {
          dispatch(addToCart(match));
          setSearchTerm("");
        } else {
          alert(`Item ${match.name} is out of stock!`);
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

    const invoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const billData = {
      invoiceId,
      subtotal,
      discountAmount: discountAmt,
      gstAmount: gstAmt,
      total: grandTotal,
      date: new Date().toISOString()
    };

    // Store receipt detail locally for printing
    setReceiptData({
      id: invoiceId,
      date: billData.date,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "N/A",
      items: [...cart],
      subtotal,
      discountPercent: discount,
      discountAmount: discountAmt,
      gstAmount: gstAmt,
      total: grandTotal,
      paymentMethod
    });

    // 1. Deduct stock levels in Inventory
    dispatch(deductStock(cart.map(item => ({ id: item.id, qty: item.qty }))));
    
    // 2. Add Invoice to Billing History and Reset POS state
    dispatch(checkout(billData));

    // 3. Launch invoice receipt pop-up
    setShowCheckoutModal(true);
  };

  // Browser Printing Trigger
  const triggerPrint = () => {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple custom iframe or popup to avoid destructing React virtual DOM states
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${receiptData?.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; font-size: 12px; line-height: 1.4; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 0; font-size: 11px; }
            .mt-10 { margin-top: 10px; }
            .mt-20 { margin-top: 20px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-slate-950 text-slate-100 min-h-screen rounded-2xl border border-slate-900 overflow-hidden">
      
      {/* LEFT: PRODUCTS BROWSER */}
      <div className="flex-1 p-6 space-y-6 flex flex-col h-full overflow-y-auto">
        
        {/* Search, SKU scanner input */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-lg">
            <input 
              type="text"
              placeholder="Search by name, category, or hit Enter for barcode SKU..."
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

          <div className="text-xs text-slate-500 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-900">
            Scanning Mode: <span className="text-emerald-400 font-bold">READY</span>
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
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 flex-1">
          {filteredProducts.map((product) => {
            const outOfStock = product.stock <= 0;
            const inCart = cart.find(item => item.id === product.id);
            const cartQty = inCart ? inCart.qty : 0;
            const remainingStock = product.stock - cartQty;

            return (
              <div 
                key={product.id}
                onClick={() => !outOfStock && remainingStock > 0 && dispatch(addToCart(product))}
                className={`group rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 relative select-none
                  ${outOfStock || remainingStock <= 0 
                    ? "bg-slate-950/40 border-slate-950 opacity-40 cursor-not-allowed" 
                    : "bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/70 cursor-pointer shadow-lg"
                  }
                `}
              >
                {/* Image / Icon container */}
                <div className="h-32 rounded-lg bg-slate-950 overflow-hidden mb-3 border border-slate-900 flex items-center justify-center text-slate-700 relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <FaBarcode size={42} className="text-slate-800" />
                  )}
                  {cartQty > 0 && (
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-500 text-white shadow-md">
                      {cartQty} in Cart
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-slate-200 text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">{product.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono tracking-tight">{product.sku}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{product.description || "No description provided."}</p>
                </div>

                {/* Price and Add button */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900/80">
                  <div>
                    <span className="text-xs text-slate-500 block">Retail Price</span>
                    <span className="text-base font-black text-white">₹{product.price.toFixed(2)}</span>
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

          {filteredProducts.length === 0 && (
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Customer Details</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Walk-in Customer Name"
                value={customerName}
                onChange={(e) => dispatch(setCustomerInfo({ name: e.target.value, phone: customerPhone }))}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
              <FaUser size={12} className="absolute left-3 top-2.5 text-slate-600" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Phone Number (10 digits)"
                value={customerPhone}
                onChange={(e) => dispatch(setCustomerInfo({ name: customerName, phone: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
              <FaPhoneAlt size={12} className="absolute left-3 top-2.5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
            <span>Bill items</span>
            <span className="text-slate-500 font-normal">({cart.length} unique)</span>
          </h3>

          <div className="flex-1 divide-y divide-slate-800/50 overflow-y-auto max-h-[300px] mt-2 pr-1 space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500">₹{item.price.toFixed(2)} | GST: {item.gstRate}%</p>
                </div>

                {/* Qty edit */}
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

                {/* Line total & remove */}
                <div className="text-right pl-1">
                  <p className="font-bold text-slate-200">₹{(item.price * item.qty).toFixed(2)}</p>
                  <button 
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-slate-600 hover:text-red-400 transition-colors mt-0.5"
                    title="Remove item"
                  >
                    <MdDeleteOutline size={16} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-600">
                <FaCalculator className="text-3xl mb-2 animate-bounce" />
                <p className="text-xs">Cart is empty.</p>
                <p className="text-[10px] text-slate-700">Click products on left to construct bill.</p>
              </div>
            )}
          </div>
        </div>

        {/* Calculations breakdown */}
        <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 text-xs">
          
          {/* Subtotal */}
          <div className="flex justify-between">
            <span className="text-slate-500">Cart Subtotal</span>
            <span className="font-semibold text-slate-300">₹{subtotal.toFixed(2)}</span>
          </div>

          {/* Discount selection */}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Discount (%)</span>
            <select
              value={discount}
              onChange={(e) => dispatch(setDiscount(Number(e.target.value)))}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 focus:outline-none"
            >
              {[0, 2, 5, 8, 10, 12, 15, 20].map(val => (
                <option key={val} value={val}>{val}%</option>
              ))}
            </select>
          </div>

          {/* Taxes (GST) */}
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated CGST (6%)</span>
            <span className="font-semibold text-slate-400">₹{(gstAmt / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated SGST (6%)</span>
            <span className="font-semibold text-slate-400">₹{(gstAmt / 2).toFixed(2)}</span>
          </div>

          <div className="h-px bg-slate-800/80 my-2"></div>

          {/* Grand Total */}
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-200">Grand Total</span>
            <span className="text-lg font-black text-orange-500">₹{grandTotal.toFixed(2)}</span>
          </div>

        </div>

        {/* Payment mode choice */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Payment Method</span>
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
          disabled={cart.length === 0}
          className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform transform active:scale-98
            ${cart.length === 0 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            }
          `}
        >
          <FaCheckCircle /> Proceed to Checkout
        </button>

      </div>

      {/* PRINTABLE INVOICE / CHECKOUT MODAL OVERLAY */}
      {showCheckoutModal && receiptData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header toolbar */}
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
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-300" id="invoice-print-area">
              
              {/* Receipt Header branding */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">BHARATAMBE TRADERS</h2>
                <p className="text-[10px] text-slate-400">MB Patil Colony Near Bus Stand, BasavaKalyan</p>
                <p className="text-[10px] text-slate-400">Gorta-Muchalum Road, Phone: 6361037157</p>
                <p className="text-[10px] text-slate-400">GSTIN: 29AAAAA0000A1Z5</p>
                <div className="border-b border-dashed border-slate-800 my-2"></div>
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold text-white">{receiptData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(receiptData.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span>Terminal #1</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{receiptData.customerPhone}</span>
                </div>
                <div className="border-b border-dashed border-slate-800 my-2"></div>
              </div>

              {/* Items List Table */}
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-dashed border-slate-800 font-bold text-white">
                    <th className="py-1">Description</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">GST</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, idx) => {
                    const lineTotal = item.price * item.qty;
                    return (
                      <tr key={idx} className="border-b border-slate-900">
                        <td className="py-1.5 max-w-[120px] truncate">{item.name}</td>
                        <td className="text-center">{item.qty}</td>
                        <td className="text-right">₹{item.price.toFixed(2)}</td>
                        <td className="text-right">{item.gstRate || 0}%</td>
                        <td className="text-right font-bold text-slate-100">₹{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-800 my-2"></div>

              {/* Summary calculations */}
              <div className="space-y-1.5 text-[11px] text-right">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>₹{receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>DISCOUNT ({receiptData.discountPercent}%):</span>
                    <span>-₹{receiptData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (Central Tax):</span>
                  <span>₹{(receiptData.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (State Tax):</span>
                  <span>₹{(receiptData.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="border-b border-slate-900/60 my-1"></div>
                <div className="flex justify-between text-sm font-extrabold text-white">
                  <span>GRAND TOTAL:</span>
                  <span>₹{receiptData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>PAID VIA ({receiptData.paymentMethod}):</span>
                  <span>₹{receiptData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center space-y-1 pt-4">
                <div className="border-b border-dashed border-slate-800 my-2"></div>
                <p className="font-bold text-white">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[9px] text-slate-500">Goods once sold will not be taken back without receipt verification.</p>
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="bg-slate-950 px-6 py-4 flex gap-3 border-t border-slate-900">
              <button
                onClick={triggerPrint}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <FaPrint /> Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setReceiptData(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold"
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
