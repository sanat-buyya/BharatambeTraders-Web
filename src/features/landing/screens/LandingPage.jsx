import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCalculator, FaChartBar, FaBoxes, FaHistory } from "react-icons/fa";
import logo from "../../../assets/BTLogo.png";

function LandingPage() {
  const navigate = useNavigate();
  const products = useSelector((state) => state.inventory.products);
  const invoices = useSelector((state) => state.billing.invoices);

  // Quick statistics
  const totalProducts = products.length;
  const totalSalesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, curr) => curr.status === "Paid" ? acc + curr.total : acc, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center p-1">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              BHARATAMBE TRADERS
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">POS & Billing System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-medium">Terminal #1 Active</span>
        </div>
      </header>

      {/* Main Hero & Portals */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mb-12">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full uppercase">
            Internal Business Portal
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-tight">
            Store Billing &amp; <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Inventory Management
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg">
            A comprehensive, high-speed terminal designed for managing sales, generating tax invoices, and tracking real-time stock levels.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          
          {/* Card 1: POS */}
          <div 
            onClick={() => navigate("/pos")}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-orange-500/30 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-orange-500/5"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaCalculator className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
              POS Terminal
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Launch the billing screen, add products, apply discounts, select payment options, and instantly checkout and print invoices.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-semibold group-hover:underline">
              Launch Billing &rarr;
            </span>
          </div>

          {/* Card 2: Dashboard */}
          <div 
            onClick={() => navigate("/home")}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500/30 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/5"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaChartBar className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Sales Reports
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              View comprehensive business intelligence reports, aggregate statistics, revenue curves, and payment method analytics.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:underline">
              Open Dashboard &rarr;
            </span>
          </div>

          {/* Card 3: Inventory */}
          <div 
            onClick={() => navigate("/inventory")}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/5"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaBoxes className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Manage Inventory
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Add new catalog items, track low-stock status alerts, adjust prices, edit tax (GST) mappings, and update quantities.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold group-hover:underline">
              Manage Stock &rarr;
            </span>
          </div>

        </div>

        {/* Horizontal Mini-Metrics bar */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-900 bg-slate-905/30 backdrop-blur-sm text-center">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="border-l border-slate-900">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Bills Issued</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalSalesCount}</p>
          </div>
          <div className="border-l border-slate-900">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Products Mapped</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalProducts}</p>
          </div>
          <div className="border-l border-slate-900">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Low Stock items</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {products.filter(p => p.stock <= 5).length}
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-600 border-t border-slate-900 mt-auto">
        &copy; {new Date().getFullYear()} Bharatambe Traders. POS System Dashboard. Designed for optimal screen resolutions.
      </footer>

    </div>
  );
}

export default LandingPage;
