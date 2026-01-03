import { HiOutlineMenu } from "react-icons/hi";
import { useLocation } from "react-router-dom";

const Headers = ({ onMenuClick, setMobileOpen }) => {
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Dashboard";
    return path[path.length - 1].replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <header className="flex items-center justify-between 
        bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 
        shadow px-6 h-16 text-white">
      <div className="flex items-center gap-3">
        {setMobileOpen?(<button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100"
        >
          <HiOutlineMenu size={22} />
        </button>):""}
        <h1 className="text-xl font-semibold">{getPageName()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
          B
        </div>
        <span className="font-semibold hidden sm:block">
          Bharatambe Traders
        </span>
      </div>
    </header>
  );
};

export default Headers;
