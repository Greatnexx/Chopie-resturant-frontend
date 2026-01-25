import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { BrandingProvider } from "./Context/BrandingContext";
import MainLayout from "./Layouts/MainLayout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import TrackOrder from "./pages/TrackOrder";
import OrderManagement from "./components/OrderManagement";
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantRegister from "./pages/RestaurantRegister";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PlatformOwnerLogin from "./pages/PlatformOwnerLogin";
import PlatformOwnerDashboard from "./pages/PlatformOwnerDashboard";
import AuditTrail from "./pages/AuditTrail";
import MenuManager from "./pages/MenuManager";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import EventManagement from "./pages/EventManagement";
import RestaurantAnalytics from "./pages/RestaurantAnalytics";
import FinancialSettings from "./pages/FinancialSettings";
import FinancialReports from "./pages/FinancialReports";
import RestaurantRegistration from "./components/RestaurantRegistration";
import TenantRouter from "./components/TenantRouter";
import TenantDemo from "./components/TenantDemo";
import StaffOrderInterface from "./components/StaffOrderInterface";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<TenantRouter />}>
        {/* Landing Page */}
        <Route index element={<LandingPage />} />
        
        {/* Main app routes */}
        <Route path="/" element={<MainLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="/trackorder" element={<TrackOrder />} />
          <Route path="/r/:restaurantId/track" element={<TrackOrder />} />
          <Route path="/r/:restaurantId/trackorder" element={<TrackOrder />} />
          <Route path="/orders" element={<OrderManagement />} />
        </Route>
        
        {/* Platform Owner routes */}
        <Route path="/platform-login" element={<PlatformOwnerLogin />} />
        <Route path="/platform-dashboard" element={<PlatformOwnerDashboard />} />
        
        {/* Restaurant management routes */}
        <Route path="/restaurant/register" element={<RestaurantRegister />} />
        <Route path="/register" element={<RestaurantRegistration />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        <Route path="/restaurant/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/restaurant/audit-trail" element={<AuditTrail />} />
        <Route path="/restaurant/financial-settings" element={<FinancialSettings />} />
        <Route path="/restaurant/reports" element={<FinancialReports />} />
        <Route path="/restaurant/audit" element={<AuditTrail />} />
        <Route path="/restaurant/menu-manager" element={<MenuManager />} />
        <Route path="/restaurant/staff-orders" element={<StaffOrderInterface />} />
        <Route path="/restaurant/events" element={<EventManagement />} />
        <Route path="/restaurant/settings" element={<Settings />} />
        <Route path="/restaurant/users" element={<UserManagement />} />
        <Route path="/restaurant/analytics" element={<RestaurantAnalytics />} />
        
        {/* Demo route */}
        <Route path="/demo" element={<TenantDemo />} />
        
        {/* Tenant routes - handled by TenantRouter */}
        <Route path="/r/:subdomain" element={<div />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  return (
    <BrandingProvider>
      <RouterProvider router={router} />
    </BrandingProvider>
  );
};

export default App;
