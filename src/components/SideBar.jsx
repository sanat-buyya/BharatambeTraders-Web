import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  FaThLarge,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCalculator,
  FaHistory,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";

const SideBar = ({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Desktop sidebar items
  const desktopNavItems = [
    { name: "Dashboard", path: "/home", icon: FaThLarge },
    { name: "POS / New Bill", path: "/pos", icon: FaCalculator },
    { name: "Invoices History", path: "/invoices", icon: FaHistory },
    { name: "Inventory", path: "/inventory", icon: BsBoxSeamFill },
    { name: "Reports", path: "/reports", icon: FaChartBar },
    { name: "Settings", path: "/settings", icon: FaCog },
  ];

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const displayName = user?.profile?.shopName || user?.businessName || "SmartLedger";

  return (
    <aside
      className={`
        fixed md:relative top-0 left-0 h-full z-40
        bg-[#0B132B] text-white flex flex-col
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* Top */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-700">
        {!collapsed && (
          <h1 className="text-sm font-black tracking-wider uppercase text-orange-400 truncate max-w-[170px]" title={displayName}>
            {displayName}
          </h1>
        )}

        <div className="flex gap-2">
          {/* Collapse - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 bg-gray-800 rounded hover:bg-gray-750"
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {/* Close - Mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 bg-gray-800 rounded hover:bg-gray-750"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
        {/* Desktop nav */}
        <div className="hidden md:block">
          {desktopNavItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition
                ${
                  isActive
                    ? "bg-[#1f2b46] text-orange-400"
                    : "text-gray-300"
                }
                hover:bg-[#162036] hover:text-orange-400`
              }
            >
              <Icon className="text-base" />
              {!collapsed && <span>{name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden">
          {desktopNavItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition
                ${
                  isActive
                    ? "bg-[#1f2b46] text-orange-400"
                    : "text-gray-300"
                }
                hover:bg-[#162036] hover:text-orange-400`
              }
            >
              <Icon className="text-base" />
              <span>{name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout Trigger */}
      <div className="px-3 py-2 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-350 hover:bg-[#162036] hover:text-red-400 transition text-left"
        >
          <FaSignOutAlt className="text-base text-red-500" />
          {!collapsed && <span className="font-semibold text-xs text-red-400">Log Out</span>}
        </button>
      </div>

      {/* Bottom  */}
      <div className="p-4 border-t border-gray-700 text-center">
        {!collapsed && (
          <p className="text-[10px] text-gray-500">
            &copy; {getCurrentYear()} {displayName.slice(0, 18)}
          </p>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
