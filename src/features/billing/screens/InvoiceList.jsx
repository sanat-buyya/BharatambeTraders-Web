import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaFileInvoice, FaPrint, FaTimes, FaUndo, FaCheckCircle, FaExclamationCircle, FaSpinner, FaDownload } from "react-icons/fa";
import { fetchInvoices, refundInvoice } from "../billingSlice";
import { fetchProducts } from "../../inventory/inventorySlice";
import logo from "../../../assets/SLLogo.png";

function InvoiceList() {
  const dispatch = useDispatch();
  const { invoices, loading, error } = useSelector((state) => state.billing);
  const { user } = useSelector((state) => state.auth);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Math Calculations for Dashboard KPIs
  const activeInvoices = invoices.filter(inv => inv.status === "Paid");
  const totalRevenue = activeInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalCount = invoices.length;
  const refundCount = invoices.filter(inv => inv.status === "Refunded").length;
  const averageTicket = activeInvoices.length > 0 ? totalRevenue / activeInvoices.length : 0;

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = paymentFilter === "All" || inv.paymentMethod === paymentFilter;
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  // Handle Refund Action
  const handleRefund = (inv) => {
    const invId = inv._id;
    if (window.confirm(`Are you sure you want to mark Invoice ${inv.invoiceId} as REFUNDED?\nThis will revert stock levels.`)) {
      dispatch(refundInvoice(invId)).then(() => {
        // Sync products stock again
        dispatch(fetchProducts());
        // Update selected modal if active
        if (selectedInvoice && (selectedInvoice._id === invId || selectedInvoice.id === inv.invoiceId)) {
          setSelectedInvoice(prev => ({ ...prev, status: "Refunded" }));
        }
      });
    }
  };

  // Trigger Receipt Printing
  const triggerReprint = () => {
    const printContent = document.getElementById("reprint-area").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${selectedInvoice?.invoiceId || selectedInvoice?.id}</title>
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

  const getPdfDownloadLink = (inv) => {
    if (!inv?.pdfUrl) return "#";
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    return `${serverUrl}${inv.pdfUrl}`;
  };

  const profile = user?.profile || {};
  const shopName = profile.shopName || user?.businessName || "SmartLedger";
  const address = profile.businessAddress || "N/A Address";
  const gstNumber = profile.gstNumber || "N/A GSTIN";
  const contactPhone = profile.mobileNumber || user?.mobileNumber || "N/A Phone";
  const logoSrc = profile.logo || logo;

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Invoice History Log</h2>
          <p className="text-slate-400 text-sm mt-1">Review transactions, issue returns/refunds, and reprint invoices.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Statistical summary boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Gross Sales</span>
            <p className="text-xl font-bold text-white mt-1">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Active Invoices</span>
            <p className="text-xl font-bold text-white mt-1">{activeInvoices.length} Bills</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Avg ticket value</span>
            <p className="text-xl font-bold text-white mt-1">₹{averageTicket.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Refunded counts</span>
            <p className="text-xl font-bold text-rose-500 mt-1">{refundCount} Returns</p>
          </div>
        </div>

        {/* Filters and search layout */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 p-4 rounded-xl border border-slate-900/60">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search by Invoice ID, customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <IoSearch className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Payment Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Payment:</span>
              <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-slate-900 border border-slate-855 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-855 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice listing Table */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden shadow-lg relative">
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-2">Timestamp</th>
                  <th className="py-3 px-2">Customer Details</th>
                  <th className="py-3 px-2">Payment Method</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Amount Due</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-300">
                {filteredInvoices.map((inv) => {
                  const invId = inv._id;
                  return (
                    <tr key={invId} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">{inv.invoiceId}</td>
                      <td className="py-4 px-2">
                        <div>{new Date(inv.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(inv.date).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-semibold text-slate-100">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500">{inv.customerPhone}</div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                          ${inv.paymentMethod === "UPI" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""}
                          ${inv.paymentMethod === "Cash" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : ""}
                          ${inv.paymentMethod === "Card" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : ""}
                        `}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                          ${inv.status === "Paid" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          }
                        `}>
                          {inv.status === "Paid" ? <FaCheckCircle /> : <FaExclamationCircle />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-black text-white">₹{inv.total.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold text-xs transition"
                            title="View Detailed Tax Receipt"
                          >
                            Receipt
                          </button>
                          {inv.status === "Paid" && (
                            <button 
                              onClick={() => handleRefund(inv)}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded border border-rose-500/20 font-semibold text-xs transition"
                              title="Mark Invoice as Returned / Refunded"
                            >
                              <FaUndo className="text-[10px]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredInvoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500 text-sm">No transaction invoices log matches active filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* REPRINT / VIEW RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaFileInvoice className="text-orange-500" /> Invoice Details
              </h3>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Reprint content block */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-305 print:p-0" id="reprint-area">
              
              {/* Branding header */}
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

              {/* Invoice status warning if Refunded */}
              {selectedInvoice.status === "Refunded" && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-2.5 text-center font-bold text-[10px] rounded uppercase mb-2">
                  !!! THIS INVOICE IS REFUNDED / RETURNED !!!
                </div>
              )}

              {/* Transaction Metadata Card */}
              <div className="details-box bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 text-[10px]">
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Invoice:</span>
                  <span className="details-val font-mono font-bold text-white">{selectedInvoice.invoiceId || selectedInvoice.id}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Date:</span>
                  <span className="details-val text-slate-300">{new Date(selectedInvoice.date).toLocaleString()}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Customer:</span>
                  <span className="details-val font-semibold text-slate-305">{selectedInvoice.customerName}</span>
                </div>
                <div className="details-row flex justify-between">
                  <span className="details-label text-slate-500 font-bold uppercase tracking-wider text-[8.5px]">Phone:</span>
                  <span className="details-val text-slate-305">{selectedInvoice.customerPhone}</span>
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
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-900/40">
                      <td className="py-2 px-1 max-w-[120px] truncate text-slate-200">{item.name}</td>
                      <td className="py-2 text-center font-mono text-slate-300">{item.qty}</td>
                      <td className="py-2 text-right font-mono text-slate-300 font-normal">₹{item.price.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-slate-300 font-normal">{item.gstRate || 0}%</td>
                      <td className="py-2 text-right font-mono font-bold text-white">₹{(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divider-dashed border-b border-dashed border-slate-800 my-2"></div>

              {/* Summary Calculations Block */}
              <div className="calc-block flex flex-col items-end w-full">
                <div className="calc-container w-full max-w-[240px] space-y-1.5 text-[10px] text-right text-slate-300">
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-mono text-slate-200">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="calc-row flex justify-between text-rose-400 font-semibold">
                      <span>Discount ({selectedInvoice.discountPercent.toFixed(0)}%):</span>
                      <span className="font-mono">-₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">CGST (Central Tax):</span>
                    <span className="font-mono text-slate-200">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="calc-row flex justify-between">
                    <span className="text-slate-500">SGST (State Tax):</span>
                    <span className="font-mono text-slate-200">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="divider-solid border-b border-slate-850 my-1.5"></div>
                  <div className="calc-row-total flex justify-between text-xs font-black text-orange-400 py-1">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base font-extrabold text-orange-400">₹{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                  <div className="calc-row flex justify-between text-emerald-400 font-bold border-t border-slate-900 pt-1.5">
                    <span>Paid Via ({selectedInvoice.paymentMethod}):</span>
                    <span className="font-mono">₹{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="footer-msg text-center space-y-1 pt-4 text-slate-500 text-[10px]">
                <div className="divider-dashed border-b border-dashed border-slate-800 my-2"></div>
                <p className="footer-thankyou font-bold text-slate-300">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[9px] text-slate-550">Duplicate invoice printed on demand.</p>
              </div>

            </div>

            {/* Print toolbar footer */}
            <div className="bg-slate-950 px-6 py-4 flex flex-col gap-2 border-t border-slate-900">
              <div className="flex gap-2">
                <button
                  onClick={triggerReprint}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-700 text-xs"
                >
                  <FaPrint /> Reprint Receipt
                </button>
                <a
                  href={getPdfDownloadLink(selectedInvoice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-700 text-xs"
                >
                  <FaDownload /> Download PDF
                </a>
              </div>
              {selectedInvoice.status === "Paid" && (
                <button
                  onClick={() => handleRefund(selectedInvoice)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                >
                  Issue Return Refund
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InvoiceList;
