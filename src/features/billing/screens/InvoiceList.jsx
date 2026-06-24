import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaFileInvoice, FaPrint, FaTimes, FaUndo, FaCheckCircle, FaExclamationCircle, FaSpinner, FaDownload } from "react-icons/fa";
import { fetchInvoices, refundInvoice, convertQuotation } from "../billingSlice";
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

  // PDF Page Size & Orientation settings
  const [pageSize, setPageSize] = useState("auto");
  const [orientation, setOrientation] = useState("portrait");

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

  // Convert Quotation Action
  const handleConvertToSale = (inv) => {
    const invId = inv._id;
    if (window.confirm(`Are you sure you want to convert Quotation/Estimate ${inv.invoiceId} to a tax invoice?\nThis will validate and deduct inventory stock levels.`)) {
      dispatch(convertQuotation(invId)).then((res) => {
        if (!res.error) {
          alert("Successfully converted quotation to Tax Invoice!");
          dispatch(fetchProducts());
          // Update selected modal if active
          setSelectedInvoice(res.payload);
        } else {
          alert(res.payload || "Conversion failed");
        }
      });
    }
  };

  const getDynamicPdfUrl = () => {
    if (!selectedInvoice?._id) return "";
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    const token = user?.token || "";
    return `${serverUrl}/api/billing/${selectedInvoice._id}/pdf?pageSize=${pageSize}&orientation=${orientation}&token=${token}&t=${Date.now()}`;
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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-receipt {
              max-width: 480px;
              margin: 0 auto;
              border: 3px double #94a3b8;
              border-top: 10px solid #6b8e23;
              border-radius: 8px;
              padding: 20px;
              background-color: #fff;
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
    return getDynamicPdfUrl();
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
                <option value="Quotation">Quotation</option>
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
                            : inv.status === "Quotation"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-900">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaFileInvoice className="text-orange-500" /> {selectedInvoice.status === "Quotation" ? "Quotation / Estimate Details" : "Invoice Details"}
              </h3>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Split Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-[68vh]">
              {/* Left Column: PDF Iframe Preview */}
              <div className="flex-1 bg-slate-950 border-r border-slate-855 flex flex-col h-full min-h-[300px] md:min-h-0">
                <div className="p-3 bg-slate-950 border-b border-slate-855 flex flex-wrap justify-between items-center gap-2">
                  <span className="font-bold text-xs text-slate-300">Live Generated PDF Preview</span>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Size:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-355"
                    >
                      <option value="auto">Auto-Fit</option>
                      <option value="A4">A4 Paper</option>
                      <option value="A3">A3 Paper</option>
                    </select>

                    <label className="text-[10px] text-slate-500 font-bold uppercase">Layout:</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-0.5 text-slate-355"
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
                  <div id="reprint-area">
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
                          {selectedInvoice.status === "Quotation" ? "ESTIMATE / QUOTATION" : "CREDIT BILL"}
                        </span>
                      </div>

                      {/* Invoice Details Box */}
                      <div className="details-box">
                        <div className="details-row">
                          <span className="details-label">Bill No:</span>
                          <span className="details-val font-mono">{selectedInvoice.invoiceId || selectedInvoice.id}</span>
                        </div>
                        <div className="details-row">
                          <span className="details-label">Date:</span>
                          <span className="details-val">{new Date(selectedInvoice.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="details-row">
                          <span className="details-label">Customer Name:</span>
                          <span className="details-val">{selectedInvoice.customerName.toUpperCase()}</span>
                        </div>
                        {selectedInvoice.customerPhone && selectedInvoice.customerPhone !== "N/A" && (
                          <div className="details-row">
                            <span className="details-label">Mobile No:</span>
                            <span className="details-val">{selectedInvoice.customerPhone}</span>
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
                            {selectedInvoice.items.map((item, idx) => {
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
                                        {selectedInvoice.items.reduce((sum, item) => sum + item.qty, 0)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="bold">SUBTOTAL:</td>
                                      <td className="text-right font-mono">₹{selectedInvoice.subtotal.toFixed(2)}</td>
                                    </tr>
                                    {selectedInvoice.discountAmount > 0 && (
                                      <tr>
                                        <td className="bold text-rose-500">DISCOUNT:</td>
                                        <td className="text-right font-mono text-rose-500 font-bold">
                                          -₹{selectedInvoice.discountAmount.toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td className="bold">CGST ({(selectedInvoice.items[0]?.gstRate || 0) / 2}%):</td>
                                      <td className="text-right font-mono">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td className="bold">SGST ({(selectedInvoice.items[0]?.gstRate || 0) / 2}%):</td>
                                      <td className="text-right font-mono">₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</td>
                                    </tr>
                                    <tr style={{ borderTop: "1px solid #94a3b8" }}>
                                      <td className="bold font-extrabold text-orange-600" style={{ fontSize: "10px" }}>
                                        {selectedInvoice.status === "Quotation" ? "ESTIMATED TOTAL" : "GRAND TOTAL"}
                                      </td>
                                      <td className="text-right font-mono font-black text-orange-600" style={{ fontSize: "11px" }}>
                                        ₹{selectedInvoice.total.toFixed(2)}
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
              {selectedInvoice.status === "Quotation" && (
                <button
                  onClick={() => handleConvertToSale(selectedInvoice)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-bold text-xs"
                >
                  Convert to Tax Invoice (Sale)
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
