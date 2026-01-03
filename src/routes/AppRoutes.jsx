import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import publicRoutes from "./PublicRoutes";

import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/screens/Dashboard";
import AllCategoryPage from "../features/categories/screens/CategoryList";
import NearByStoresPage from "../features/nearByStore/screens/nearByStores";
import ProductsPage from "../features/Products/screens/Products";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        {publicRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}

        {/* Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/allCategory" element={<AllCategoryPage />} />
          <Route path="/nearbyStores" element={<NearByStoresPage />} />
           <Route path="/products" element={<ProductsPage />} /> 
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
