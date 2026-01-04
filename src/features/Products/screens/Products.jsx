import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { MdOutlineClear } from "react-icons/md";
import { useSearchParams } from "react-router-dom";

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: "Bhagavad Gita",
    discription: "Sacred Hindu scripture in Sanskrit.",
    category: "Stationary",
    categoryType: "Books",
    price: 349.0,
    image:
      "https://www.mahakaalprasad.com/cdn/shop/files/71jiacOsB7L._SY425.jpg?v=1714472043",
  },
  {
    id: 2,
    name: "Yoga Mat",
    discription: "Non-slip yoga mat for all types of yoga practices.",
    category: "Sports",
    categoryType: "Fitness",
    price: 29.99,
  },
];

// Search suggestions
const searchSuggestions = initialProducts
  .map((product) => product.name)
  .concat(
    [...new Set(initialProducts.map((product) => product.category))],
    [...new Set(initialProducts.map((product) => product.categoryType))]
  );

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const [searchParams] = useSearchParams();
  const categoryTypeFromUrl = searchParams.get("categoryType");
  console.log("Category Type from URL:", categoryTypeFromUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let products = initialProducts;

    // Apply category chips filter
    if (activeCategory !== "All") {
      products = products.filter(
        (product) =>
          product.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.categoryType.toLowerCase().includes(term) ||
          product.discription.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(products);
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    if (categoryTypeFromUrl) {
      setSearchTerm(categoryTypeFromUrl);
      setActiveCategory("All"); // reset category chips
    }
  }, []);

  // Update suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = searchSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    // Search logic is already handled in useEffect
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveCategory("All");
    setShowSuggestions(false);
  };

  return (
    <div className="w-full bg-gray-50 p-4 md:p-8 rounded-lg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl mx-auto"
          >
            {/* THIS relative controls both input + suggestions */}
            <div className="relative w-full">
              {/* Search icon */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IoSearch color="gray" />
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products by name or category..."
                className="w-full p-2 pl-10 pr-12 text-gray-900 bg-white border border-gray-300 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />

              {/* Clear button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <MdOutlineClear color="gray" />
                </button>
              )}

              {/*  Suggestions – SAME WIDTH AS INPUT */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <ul className="py-2 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>

          {/* Category Filter Chips */}
          <div className="mt-1 flex flex-wrap gap-2 justify-center">
            {["All", "Stationary", "Sports"].map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSearchTerm(""); // clear text search when using chips
                  }}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium border
                    transition-all duration-300
                    ${
                      isActive
                        ? activeCategory === "All"
                          ? "bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent"
                          : activeCategory === "Stationary"
                          ? "bg-blue-600 text-white border-transparent"
                          : "bg-green-600 text-white border-transparent"
                        : "border-gray-300 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {product.image?(<div className="h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>):(
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
                )}
                <div className="p-4">
                  <div className="mb-1">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full ${
                        product.category === "Stationary"
                          ? "bg-blue-100 text-blue-600"
                          : product.category === "Sports"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-1 text-sm">
                    {product.discription}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-2 text-gray-500">
              No products match your search for "{searchTerm}". Try a different
              term.
            </p>
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
