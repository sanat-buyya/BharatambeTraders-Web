import React, { useState, useEffect } from "react";
import axiosInstance from "../../../app/api/axiosInstance";
import { FaFileCsv, FaPrint, FaSpinner, FaChartBar, FaUserFriends, FaBoxes, FaPercent } from "react-icons/fa";

function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/dashboard/summary");
        setReportData(response.data.reports);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to compile reports data from the server.");
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const exportToCSV = (data, headers, filename) => {
    if (!data || data.length === 0) return alert("No data available to export");
    
    // Construct CSV rows
    const csvRows = [headers.join(",")];
    
    data.forEach(item => {
      const values = Object.values(item).map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
        <FaSpinner className="animate-spin text-orange-500 text-2xl" />
        <span>Compiling financial logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-rose-400 bg-slate-950 p-6">
        <div className="border border-rose-500/20 bg-rose-500/10 p-6 rounded-2xl max-w-md text-center space-y-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900 print:bg-white print:text-black print:border-none print:p-0 print:m-0">
      
      {/* SCREEN HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Business Reports &amp; Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Audit daily velocity, product movements, tax collections, and customer insights.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow transition-all duration-150"
          >
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      {/* REPORT SELECTOR TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3 mb-6 print:hidden">
        {[
          { id: "sales", label: "Sales Velocity", icon: FaChartBar },
          { id: "products", label: "Product Performance", icon: FaBoxes },
          { id: "customers", label: "Customer Rankings", icon: FaUserFriends },
          { id: "gst", label: "GST Summary Reports", icon: FaPercent },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-150
                ${isActive 
                  ? "bg-orange-500 text-white border-transparent shadow shadow-orange-500/10" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }
              `}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB REPORT CONTAINER */}
      <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6 space-y-6 shadow-xl print:border-none print:p-0">
        
        {/* T1: SALES REPORT */}
        {activeTab === "sales" && reportData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Daily Sales log (Last 30 Days)</h3>
              <button
                onClick={() => exportToCSV(reportData.dailySales, ["Date", "Sales Total", "Invoices Count"], "daily_sales_report")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-semibold"
              >
                <FaFileCsv /> Export to Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Sales Date</th>
                    <th className="py-2.5 px-2 text-center">Transactions Issued</th>
                    <th className="py-2.5 px-4 text-right">Gross Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-350">
                  {reportData.dailySales.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4 font-mono">{row.date}</td>
                      <td className="py-3 px-2 text-center">{row.count}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-100">₹{row.sales.toFixed(2)}</td>
                    </tr>
                  ))}
                  {reportData.dailySales.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-500">No daily logs compiled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Monthly log */}
            <div className="pt-6 border-t border-slate-900/60">
              <div className="flex justify-between items-center print:hidden mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Sales aggregates</h3>
                <button
                  onClick={() => exportToCSV(reportData.monthlySales, ["Month", "Sales Total", "Invoices Count"], "monthly_sales_report")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-semibold"
                >
                  <FaFileCsv /> Export to Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Sales Month</th>
                      <th className="py-2.5 px-2 text-center">Invoices Count</th>
                      <th className="py-2.5 px-4 text-right">Gross Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-slate-350">
                    {reportData.monthlySales.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold">{row.month}</td>
                        <td className="py-3 px-2 text-center">{row.count}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-100">₹{row.sales.toFixed(2)}</td>
                      </tr>
                    ))}
                    {reportData.monthlySales.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-slate-500">No monthly logs compiled yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* T2: PRODUCTS PERFORMANCE */}
        {activeTab === "products" && reportData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Product Performance Audit</h3>
              <button
                onClick={() => exportToCSV(reportData.productReport, ["Product Name", "SKU", "Units Sold", "Total Revenue"], "product_performance_report")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-semibold"
              >
                <FaFileCsv /> Export to Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">SKU / Code</th>
                    <th className="py-2.5 px-2">Item Name</th>
                    <th className="py-2.5 px-2 text-center">Quantities Sold</th>
                    <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-350">
                  {reportData.productReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-450">{row.sku}</td>
                      <td className="py-3 px-2 font-semibold text-slate-100">{row.name}</td>
                      <td className="py-3 px-2 text-center font-bold text-orange-400">{row.qty}</td>
                      <td className="py-3 px-4 text-right font-black text-white">₹{row.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {reportData.productReport.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No product sales logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T3: CUSTOMER RANKINGS */}
        {activeTab === "customers" && reportData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Customer Rankings</h3>
              <button
                onClick={() => exportToCSV(reportData.customerReport, ["Customer Name", "Phone", "Total Purchases", "Orders Count"], "customer_ranking_report")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-semibold"
              >
                <FaFileCsv /> Export to Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Customer Name</th>
                    <th className="py-2.5 px-2">Phone Number</th>
                    <th className="py-2.5 px-2 text-center">Bills Incurred</th>
                    <th className="py-2.5 px-4 text-right">Cumulative Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-350">
                  {reportData.customerReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-100">{row.name}</td>
                      <td className="py-3 px-2 font-mono text-slate-400">{row.phone}</td>
                      <td className="py-3 px-2 text-center">{row.ordersCount}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-450">₹{row.totalSpent.toFixed(2)}</td>
                    </tr>
                  ))}
                  {reportData.customerReport.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No client profiles generated from transactions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T4: GST SUMMARY REPORTS */}
        {activeTab === "gst" && reportData && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-center print:hidden">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">GST Tax Audit Logs</h3>
              <button
                onClick={() => exportToCSV(reportData.gstReport.ratesBreakdown, ["Tax Bracket", "Taxable Value", "CGST Amount", "SGST Amount", "Total Tax"], "gst_tax_breakdown_report")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-semibold"
              >
                <FaFileCsv /> Export to Excel
              </button>
            </div>

            {/* Overall tax sums */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-center">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Total Taxable Value</p>
                <p className="text-lg font-bold text-white mt-1">₹{reportData.gstReport.summary.totalTaxable.toFixed(2)}</p>
              </div>
              <div className="border-l border-slate-900">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Central GST (CGST)</p>
                <p className="text-lg font-bold text-slate-100 mt-1">₹{reportData.gstReport.summary.totalCgst.toFixed(2)}</p>
              </div>
              <div className="border-l border-slate-900">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">State GST (SGST)</p>
                <p className="text-lg font-bold text-slate-100 mt-1">₹{reportData.gstReport.summary.totalSgst.toFixed(2)}</p>
              </div>
              <div className="border-l border-slate-900">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Total GST Collected</p>
                <p className="text-lg font-black text-orange-500 mt-1">₹{reportData.gstReport.summary.totalTax.toFixed(2)}</p>
              </div>
            </div>

            {/* Rate-wise details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax Bracket Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Tax Rate Bracket</th>
                      <th className="py-2.5 px-2 text-right">Taxable Net Value</th>
                      <th className="py-2.5 px-2 text-right">CGST</th>
                      <th className="py-2.5 px-2 text-right">SGST</th>
                      <th className="py-2.5 px-4 text-right">Total Tax Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-slate-350">
                    {reportData.gstReport.ratesBreakdown.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-100">{row.rate}</td>
                        <td className="py-3 px-2 text-right">₹{row.taxableValue.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-slate-400">₹{row.cgst.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-slate-400">₹{row.sgst.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-orange-400">₹{row.totalTax.toFixed(2)}</td>
                      </tr>
                    ))}
                    {reportData.gstReport.ratesBreakdown.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">No GST transactions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Reports;
