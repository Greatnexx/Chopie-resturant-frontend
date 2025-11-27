import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Search,
  ChefHat,
  BarChart3,
  Shield,
  X
} from "lucide-react";
import OrderSearchModal from "./OrderSearchModal";
import NotificationBell from "./NotificationBell";

const RestaurantSidebar = ({ user, onLogout, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/restaurant/dashboard", roles: ["SuperAdmin", "TransactionAdmin", "MenuManager", "SubUser"] },
    { icon: BarChart3, label: "Analytics", path: "/restaurant/super-admin", roles: ["SuperAdmin"] },
    { icon: Users, label: "User Management", path: "/restaurant/users", roles: ["SuperAdmin"] },
    { icon: ChefHat, label: "Menu Management", path: "/restaurant/menu-manager", roles: ["MenuManager"] },
    { icon: FileText, label: "Audit Trail", path: "/restaurant/audit", roles: ["SuperAdmin", "TransactionAdmin"] },
    { icon: Settings, label: "Settings", path: "/restaurant/settings", roles: ["SuperAdmin", "TransactionAdmin", "MenuManager", "SubUser"] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg h-screen flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="font-bold text-gray-800">Chopie Admin</h2>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell user={user} />
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => setShowSearchModal(true)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => {
                  navigate(item.path);
                  onClose(); // Close sidebar on mobile after navigation
                  // Force a small delay to ensure smooth transition
                  setTimeout(() => window.scrollTo(0, 0), 100);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-red-50 text-red-600 border-r-2 border-red-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      
      <OrderSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default RestaurantSidebar;