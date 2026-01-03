import React, { useState } from "react";
import StationaryCatlog from "./StationaryCatlog";
import SportsCatlog from "./SportsCatlog";

function CategoryList() {
  const [activeSection, setActiveSection] = useState("stationary");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 rounded-lg">
      
      {/* Section Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white shadow-sm">
          <button
            className={`px-8 py-3 rounded-md text-sm font-medium transition-all
              ${
                activeSection === "stationary"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => setActiveSection("stationary")}
          >
            Stationary
          </button>

          <button
            className={`px-8 py-3 rounded-md text-sm font-medium transition-all
              ${
                activeSection === "sports"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => setActiveSection("sports")}
          >
            Sports Kit
          </button>
        </div>
      </div>

      {/* Section Content */}
      {activeSection === "stationary" ? (
        <StationaryCatlog />
      ) : (
        <SportsCatlog />
      )}
    </div>
  );
}

export default CategoryList;
