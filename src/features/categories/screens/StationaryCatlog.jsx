import React from "react";
import { useNavigate } from "react-router-dom";

function StationaryCatlog() {
  const navigate = useNavigate();

  const stationaryCategories = [
    { id: 1, name: "Books", image: "https://freepngimg.com/thumb/book/6-books-png-image-with-transparency-background.png", color: "bg-blue-100" },
    { id: 2, name: "Pens", image: "✒️", color: "bg-red-100" },
    { id: 3, name: "Notebooks", image: "📓", color: "bg-green-100" },
    { id: 4, name: "Pencils", image: "✏️", color: "bg-yellow-100" },
    { id: 5, name: "Erasers", image: "🧼", color: "bg-purple-100" },
    { id: 6, name: "Sharpeners", image: "🔪", color: "bg-pink-100" },
    { id: 7, name: "Rulers", image: "📏", color: "bg-indigo-100" },
    { id: 8, name: "Calculators", image: "🧮", color: "bg-teal-100" },
  ];

  const handleCategoryClick = (categoryName) => {
  navigate(`/products?categoryType=${categoryName}`);
};


  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
      {stationaryCategories.map((category) => (
        <div
          key={category.id}
          onClick={() => handleCategoryClick(category.name)}
          className="flex flex-col items-center cursor-pointer transform transition hover:scale-105"
        >
          <div
            className={`${category.color} w-20 h-20 md:w-24 md:h-24 rounded-full
            flex items-center justify-center mb-3 border-2 border-white hover:border-blue-500`}
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

export default StationaryCatlog;
