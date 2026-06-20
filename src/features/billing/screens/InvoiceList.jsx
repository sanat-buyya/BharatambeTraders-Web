import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaFileInvoice, FaPrint, FaTimes, FaUndo, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { refundInvoice } from "../billingSlice";

function InvoiceList() {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.billing.invoices);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Math Calculations for Dashboard KPIs
  const activeInvoices = invoices.filter(inv => inv.status === "Paid");
  const totalRevenue = activeInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalCount = invoices.length;
  const refundCount = invoices.filter(inv => inv.status === "Refunded").length;
  const averageTicket = activeInvoices.length > 0 ? totalRevenue / activeInvoices.length : 0;

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = paymentFilter === "All" || inv.paymentMethod === paymentFilter;
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  // Handle Refund Action
  const handleRefund = (invoiceId) => {
    if (window.confirm(`Are you sure you want to mark Invoice ${invoiceId} as REFUNDED?`)) {
      dispatch(refundInvoice(invoiceId));
      // Update selected modal if active
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice(prev => ({ ...prev, status: "Refunded" }));
      }
    }
  };

  // Trigger Receipt Printing
  const triggerReprint = () => {
    const printContent = document.getElementById("reprint-area").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${selectedInvoice?.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; font-size: 12px; line-height: 1.4; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 0; font-size: 11px; }
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
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Invoice History Log</h2>
          <p className="text-slate-400 text-sm mt-1">Review transactions, issue returns/refunds, and reprint invoices.</p>
        </div>

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
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <IoSearch className="absolute left-3.5 top-3 text-slate-500" size={16} />
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
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden shadow-lg">
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
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-400">{inv.id}</td>
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
                    <td className="py-4 px-4 text-center flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold text-xs transition"
                        title="View Detailed Tax Receipt"
                      >
                        Receipt
                      </button>
                      {inv.status === "Paid" && (
                        <button 
                          onClick={() => handleRefund(inv.id)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded border border-rose-500/20 font-semibold text-xs transition"
                          title="Mark Invoice as Returned / Refunded"
                        >
                          <FaUndo className="text-[10px]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
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
            
            {/* Modal header */}
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
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-300" id="reprint-area">
              
              {/* Branding header */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">BHARATAMBE TRADERS</h2>
                <p className="text-[10px] text-slate-400">MB Patil Colony Near Bus Stand, BasavaKalyan</p>
                <p className="text-[10px] text-slate-400">Gorta-Muchalum Road, Phone: 6361037157</p>
                <p className="text-[10px] text-slate-400">GSTIN: 29AAAAA0000A1Z5</p>
                <div className="border-b border-dashed border-slate-800 my-2"></div>
              </div>

              {/* Invoice status warning if Refunded */}
              {selectedInvoice.status === "Refunded" && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-2 text-center font-bold text-[10px] rounded uppercase mb-2">
                  !!! THIS INVOICE IS REFUNDED / RETURNED !!!
                </div>
              )}

              {/* Meta information */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold text-white">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(selectedInvoice.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{selectedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{selectedInvoice.customerPhone}</span>
                </div>
                <div className="border-b border-dashed border-slate-800 my-2"></div>
              </div>

              {/* Items List */}
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
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-900">
                      <td className="py-1.5 max-w-[120px] truncate">{item.name}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-right">₹{item.price.toFixed(2)}</td>
                      <td className="text-right">{item.gstRate || 0}%</td>
                      <td className="text-right font-bold text-slate-100">₹{(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-800 my-2"></div>

              {/* Calculations breakdown */}
              <div className="space-y-1.5 text-[11px] text-right">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>DISCOUNT ({selectedInvoice.discountPercent}%):</span>
                    <span>-₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (Central Tax):</span>
                  <span>₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (State Tax):</span>
                  <span>₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="border-b border-slate-900/60 my-1"></div>
                <div className="flex justify-between text-sm font-extrabold text-white">
                  <span>GRAND TOTAL:</span>
                  <span>₹{selectedInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>PAID VIA ({selectedInvoice.paymentMethod}):</span>
                  <span>₹{selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center space-y-1 pt-4">
                <div className="border-b border-dashed border-slate-800 my-2"></div>
                <p className="font-bold text-white">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[9px] text-slate-500">Duplicate invoice printed on demand.</p>
              </div>

            </div>

            {/* Print toolbar footer */}
            <div className="bg-slate-950 px-6 py-4 flex gap-3 border-t border-slate-900">
              <button
                onClick={triggerReprint}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <FaPrint /> Reprint Receipt
              </button>
              
              {selectedInvoice.status === "Paid" && (
                <button
                  onClick={() => handleRefund(selectedInvoice.id)}
                  className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl font-bold border border-rose-500/20 text-xs flex items-center justify-center gap-1.5"
                >
                  <FaUndo size={10} /> Issue Refund
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
