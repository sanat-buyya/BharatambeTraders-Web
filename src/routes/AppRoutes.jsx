import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import publicRoutes from "./PublicRoutes";

import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/screens/Dashboard";
import POSPage from "../features/billing/screens/POS";
import InvoiceListPage from "../features/billing/screens/InvoiceList";
import ProductListPage from "../features/inventory/screens/ProductList";

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
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/inventory" element={<ProductListPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

