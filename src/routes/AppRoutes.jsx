import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import publicRoutes from "./PublicRoutes";

import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../features/dashboard/screens/Dashboard";
import POSPage from "../features/billing/screens/POS";
import InvoiceListPage from "../features/billing/screens/InvoiceList";
import ProductListPage from "../features/inventory/screens/ProductList";
import ReportsPage from "../features/reports/screens/Reports";
import SettingsPage from "../features/profile/screens/Settings";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        {publicRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}

        {/* Layout Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/inventory" element={<ProductListPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
