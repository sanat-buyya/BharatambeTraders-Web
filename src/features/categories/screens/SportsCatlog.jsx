import React from "react";

function SportsCatlog() {
  const sportsCategories = [
    { id: 1, name: "Cricket", image: "https://png.pngtree.com/png-clipart/20240920/original/pngtree-full-cricket-kit-on-transparent-png-image_16048362.png", color: "bg-blue-200" },
    { id: 2, name: "Football", image: "⚽", color: "bg-green-200" },
    { id: 3, name: "Basketball", image: "🏀", color: "bg-orange-200" },
    { id: 4, name: "Tennis", image: "🎾", color: "bg-yellow-200" },
    { id: 5, name: "Badminton", image: "🏸", color: "bg-red-200" },
    { id: 6, name: "Swimming", image: "🏊", color: "bg-cyan-200" },
    { id: 7, name: "Cycling", image: "🚴", color: "bg-purple-200" },
    { id: 8, name: "Running", image: "🏃", color: "bg-pink-200" },
  ];

  const handleCategoryClick = (name) => {
    alert(`Opening ${name} category`);
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
      {sportsCategories.map((category) => (
        <div
          key={category.id}
          onClick={() => handleCategoryClick(category.name)}
          className="flex flex-col items-center cursor-pointer transform transition hover:scale-105"
        >
           <div
            className={`${category.color} w-20 h-20 md:w-24 md:h-24 rounded-full
            flex items-center justify-center mb-3 border-2 border-white hover:border-green-500`}
            >
            <div className="w-16 h-16 md:w-18 md:h-18">
                <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-contain"
                />
            </div>
            </div>

          <span className="font-semibold text-gray-800 text-sm md:text-base">
            {category.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default SportsCatlog;
