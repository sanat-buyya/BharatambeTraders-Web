import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  FaFileInvoiceDollar, 
  FaBoxes, 
  FaArrowUp, 
  FaShoppingCart, 
  FaExclamationTriangle, 
  FaPlus,
  FaFileInvoice
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const products = useSelector((state) => state.inventory.products);
  const invoices = useSelector((state) => state.billing.invoices);

  // Math Calculations
  const activeInvoices = invoices.filter(inv => inv.status === "Paid");
  const totalRevenue = activeInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalInvoicesCount = invoices.length;
  const avgOrderValue = totalInvoicesCount > 0 ? totalRevenue / totalInvoicesCount : 0;
  const itemsSold = activeInvoices.reduce((acc, curr) => {
    return acc + curr.items.reduce((sum, item) => sum + item.qty, 0);
  }, 0);

  // Low stock products alert (stock <= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Revenue by payment method
  const paymentMethods = invoices.reduce((acc, curr) => {
    if (curr.status === "Paid") {
      acc[curr.paymentMethod] = (acc[curr.paymentMethod] || 0) + curr.total;
    }
    return acc;
  }, { Cash: 0, UPI: 0, Card: 0 });

  // Generate SVG Chart Data points (last 6 invoices in chronological order)
  const chartInvoices = [...invoices].slice(0, 6).reverse();
  const maxTotal = Math.max(...chartInvoices.map(inv => inv.total), 1000);
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;
  
  const points = chartInvoices.map((inv, idx) => {
    const x = padding + (idx * (svgWidth - padding * 2)) / (Math.max(chartInvoices.length - 1, 1));
    const y = svgHeight - padding - (inv.total * (svgHeight - padding * 2)) / maxTotal;
    return { x, y, label: inv.id.split("-").pop(), total: inv.total };
  });

  const svgLinePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const svgAreaPath = points.length > 0 
    ? `${svgLinePath} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z` 
    : "";

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Sales &amp; Analytics Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time indicators, revenue reports, and stock management overview.</p>
          </div>
          <button 
            onClick={() => navigate("/pos")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95"
          >
            <FaPlus /> New Billing Terminal
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue */}
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-slate-800 transition-colors">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                <FaArrowUp /> +14.2% <span className="text-slate-500">this week</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FaFileInvoiceDollar className="text-2xl" />
            </div>
          </div>

          {/* Card 2: Invoice count */}
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-slate-800 transition-colors">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoices Issued</span>
              <h3 className="text-2xl md:text-3xl font-black text-white">{totalInvoicesCount}</h3>
              <p className="text-slate-500 text-xs font-medium">Bills logged in system</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <FaFileInvoice className="text-2xl" />
            </div>
          </div>

          {/* Card 3: Items Sold */}
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-slate-800 transition-colors">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items Sold</span>
              <h3 className="text-2xl md:text-3xl font-black text-white">{itemsSold}</h3>
              <p className="text-slate-500 text-xs font-medium">Products disbursed</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
              <FaShoppingCart className="text-2xl" />
            </div>
          </div>

          {/* Card 4: Low stock count */}
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-slate-800 transition-colors">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
              <h3 className={`text-2xl md:text-3xl font-black ${lowStockProducts.length > 0 ? "text-rose-500 animate-pulse" : "text-white"}`}>
                {lowStockProducts.length}
              </h3>
              <p className="text-slate-500 text-xs font-medium">Items with &le; 5 units left</p>
            </div>
            <div className={`p-3 rounded-xl border ${lowStockProducts.length > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-slate-800 text-slate-400"}`}>
              <FaBoxes className="text-2xl" />
            </div>
          </div>

        </div>

        {/* Visual Charts & Payment breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Curve Chart */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-white">Billing Revenue Trend</h4>
                <p className="text-xs text-slate-500">Sales velocity over the last {chartInvoices.length} transactions</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300 rounded-md">Realtime</span>
            </div>

            {chartInvoices.length > 1 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[450px] py-2">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" />
                    <line x1={padding} y1={(svgHeight) / 2} x2={svgWidth - padding} y2={(svgHeight) / 2} stroke="#1e293b" strokeDasharray="3" />
                    <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1.5" />

                    {/* Area fill */}
                    {svgAreaPath && <path d={svgAreaPath} fill="url(#chartGradient)" />}

                    {/* Plot Line */}
                    {svgLinePath && <path d={svgLinePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Points and Tooltips */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#1e1b4b" stroke="#f97316" strokeWidth="2.5" className="hover:scale-125 transition-transform cursor-pointer" />
                        
                        {/* Tooltip value */}
                        <text x={p.x} y={p.y - 12} fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">
                          ₹{Math.round(p.total)}
                        </text>
                        
                        {/* Bottom labels */}
                        <text x={p.x} y={svgHeight - 10} fill="#64748b" fontSize="10" textAnchor="middle">
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-sm">Add more invoices to see sales analytics trend charts.</p>
              </div>
            )}
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white">Payment Share</h4>
              <p className="text-xs text-slate-500">Breakdown of earnings by payment channel</p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {Object.keys(paymentMethods).map((method) => {
                const amount = paymentMethods[method];
                const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                
                let colorBar = "bg-orange-500";
                let textClass = "text-orange-400";
                if (method === "UPI") { colorBar = "bg-emerald-500"; textClass = "text-emerald-400"; }
                if (method === "Card") { colorBar = "bg-blue-500"; textClass = "text-blue-400"; }

                return (
                  <div key={method} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{method}</span>
                      <span className={textClass}>
                        ₹{amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div className={`h-full ${colorBar} rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-900/60 text-center">
              <p className="text-xs text-slate-500">Average ticket size: <strong className="text-slate-300">₹{avgOrderValue.toFixed(2)}</strong></p>
            </div>
          </div>

        </div>

        {/* Bottom tables: Recent Sales & Low Stock warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Sales table */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-white">Recent Transactions</h4>
                <p className="text-xs text-slate-500">Latest sales orders processed at Terminal</p>
              </div>
              <button 
                onClick={() => navigate("/invoices")} 
                className="text-xs text-orange-500 hover:text-orange-400 font-semibold hover:underline"
              >
                View History &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-2.5">Invoice</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 font-semibold text-slate-400">{inv.id}</td>
                      <td>
                        <div className="font-semibold text-slate-200">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500">{inv.customerPhone}</div>
                      </td>
                      <td>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border 
                          ${inv.paymentMethod === "UPI" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""}
                          ${inv.paymentMethod === "Cash" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : ""}
                          ${inv.paymentMethod === "Card" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : ""}
                        `}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="text-right font-bold text-white">₹{inv.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 text-sm">No transactions logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts & Fast Action */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-white">Low Stock Alerts</h4>
                <p className="text-xs text-slate-500">Products that require restocking attention</p>
              </div>
              <button 
                onClick={() => navigate("/inventory")} 
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold hover:underline"
              >
                Go to Inventory &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-2.5">Product SKU</th>
                    <th>Product Name</th>
                    <th>Stock Left</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {lowStockProducts.slice(0, 4).map((prod) => (
                    <tr key={prod.id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 text-slate-400 font-mono">{prod.sku}</td>
                      <td className="font-semibold text-slate-200">{prod.name}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold
                          ${prod.stock === 0 ? "bg-rose-500/10 border border-rose-500/20 text-rose-500" : "bg-amber-500/10 border border-amber-500/20 text-amber-500"}
                        `}>
                          <FaExclamationTriangle className="text-[10px]" />
                          {prod.stock === 0 ? "Out of Stock" : `${prod.stock} units`}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => navigate("/inventory")}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white rounded-lg text-xs font-semibold"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 text-sm">
                        🎉 All catalog products have sufficient stock levels!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
