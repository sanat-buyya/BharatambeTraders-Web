import { HiOutlineMenu } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultLogo from "../assets/SLLogo.png";

const Headers = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getPageName = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Billing Portal";
    const segment = path[path.length - 1];
    if (segment === "home") return "Sales Dashboard";
    if (segment === "pos") return "Billing Terminal (POS)";
    if (segment === "invoices") return "Invoice History";
    if (segment === "inventory") return "Inventory & Products";
    if (segment === "reports") return "Reports & Business Auditing";
    if (segment === "settings") return "Settings & Profile";
    return segment.replace(/^\w/, (c) => c.toUpperCase());
  };

  const shopName = user?.profile?.shopName || user?.businessName || "SmartLedger";
  const logoSrc = user?.profile?.logo || defaultLogo;
  const ownerName = user?.ownerName || "Merchant Owner";

  return (
    <header className="flex items-center justify-between 
        bg-slate-900 border-b border-slate-800
        shadow px-6 h-16 text-white z-35">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-slate-800 text-white"
        >
          <HiOutlineMenu size={22} />
        </button>
        <h1 className="text-sm md:text-base font-semibold tracking-wide text-slate-100">{getPageName()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Merchant Portal</span>
          <span className="text-xs font-semibold text-orange-400">{ownerName}</span>
        </div>
        <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center border border-slate-800 overflow-hidden">
            <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xs text-slate-200 hidden sm:block truncate max-w-[120px]" title={shopName}>
            {shopName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Headers;
