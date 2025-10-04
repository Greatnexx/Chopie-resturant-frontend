

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./Layouts/MainLayout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import TrackOrder from "./pages/TrackOrder";
import OrderManagement from "./components/OrderManagement";
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AuditTrail from "./pages/AuditTrail";
import MenuManager from "./pages/MenuManager";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/trackorder" element={<TrackOrder />} />
          <Route path="/orders" element={<OrderManagement />} />
        </Route>
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        <Route path="/restaurant/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/restaurant/audit" element={<AuditTrail />} />
        <Route path="/restaurant/menu-manager" element={<MenuManager />} />
        <Route path="/restaurant/settings" element={<Settings />} />
        <Route path="/restaurant/users" element={<UserManagement />} />
        <Route path="*" element={<NotFound />} />
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App
