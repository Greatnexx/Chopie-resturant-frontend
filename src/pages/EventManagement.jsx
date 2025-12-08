import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";
import RestaurantSidebar from "../components/RestaurantSidebar";
import EventManager from "../components/EventManager";

const EventManagement = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("restaurantUser");
    if (!userData) {
      navigate("/restaurant/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check if user has permission to manage events
    if (!["SuperAdmin", "MenuManager"].includes(parsedUser.role)) {
      navigate("/restaurant/dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  if (!user) return null;

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar 
        user={user} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="text-gray-600 text-sm lg:text-base">Create and manage restaurant events</p>
              </div>
            </div>
          </div>
          
          <EventManager />
        </div>
      </div>
    </div>
    </>
  );
};

export default EventManagement;