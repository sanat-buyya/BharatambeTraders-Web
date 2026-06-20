import { NavLink } from "react-router-dom";
import {
  FaThLarge,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCalculator,
  FaHistory,
} from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";

const SideBar = ({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}) => {

  // Desktop sidebar items
  const desktopNavItems = [
    { name: "Dashboard", path: "/home", icon: FaThLarge },
    { name: "POS / New Bill", path: "/pos", icon: FaCalculator },
    { name: "Invoices History", path: "/invoices", icon: FaHistory },
    { name: "Inventory", path: "/inventory", icon: BsBoxSeamFill },
  ];

  // Mobile sidebar items (ONLY Profile)
  const mobileNavItems = [
    // { name: "Profile", path: "/profile", icon: FaUser },
  ];


  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

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
          <h1 className="text-lg font-bold">Bharatambe Traders</h1>
        )}

        <div className="flex gap-2">
          {/* Collapse - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 bg-gray-800 rounded"
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {/* Close - Mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 bg-gray-800 rounded"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 space-y-1">
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
                    ? "bg-[#1f2b46] text-orange-600"
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

        {/* Mobile nav (ONLY Profile) */}
        <div className="md:hidden">
          {mobileNavItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition
                ${
                  isActive
                    ? "bg-[#1f2b46] text-orange-600"
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

      {/* Bottom  */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <p className="text-sm text-gray-400">
            &copy; {getCurrentYear()} Bharatambe Traders
          </p>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
