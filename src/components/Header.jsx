import { HiOutlineMenu } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import logo from "../assets/BTLogo.png";

const Headers = ({ onMenuClick }) => {
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Billing Portal";
    const segment = path[path.length - 1];
    if (segment === "home") return "Sales Dashboard";
    if (segment === "pos") return "Billing Terminal (POS)";
    if (segment === "invoices") return "Invoice History";
    if (segment === "inventory") return "Inventory & Products";
    return segment.replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <header className="flex items-center justify-between 
        bg-slate-900 border-b border-slate-800
        shadow px-6 h-16 text-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-slate-800 text-white"
        >
          <HiOutlineMenu size={22} />
        </button>
        <h1 className="text-lg md:text-xl font-semibold tracking-wide text-slate-100">{getPageName()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-xs text-slate-400">Cashier Station</span>
          <span className="text-sm font-medium text-orange-400">Terminal Cashier</span>
        </div>
        <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
          </div>
          <span className="font-semibold text-slate-200 hidden sm:block">
            Bharatambe Traders
          </span>
        </div>
      </div>
    </header>
  );
};

export default Headers;

