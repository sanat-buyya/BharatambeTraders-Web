import { NavLink } from "react-router-dom";
import { FaThLarge, FaCalculator, FaHistory } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";

const BottomNav = () => {
  const navItems = [
    { name: "Dashboard", path: "/home", icon: FaThLarge },
    { name: "POS", path: "/pos", icon: FaCalculator },
    { name: "Invoices", path: "/invoices", icon: FaHistory },
    { name: "Inventory", path: "/inventory", icon: BsBoxSeamFill },
  ];


  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-[#0B132B] border-t border-[#1C2541]
      flex justify-around items-center
      h-16 md:hidden
    ">
      {navItems.map(({ name, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs transition
             ${isActive ? "text-orange-400" : "text-gray-400"}
             hover:text-orange-400`
          }
        >
          <Icon className="text-lg mb-1" />
          {name}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
