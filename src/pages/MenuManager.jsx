import { useGetAllMenuItemsQuery, useToggleMenuAvailabilityMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { ChefHat, ToggleLeft, ToggleRight, MessageCircle, Plus, Edit, Menu } from "lucide-react";
import MenuItemModal from "../components/MenuItemModal";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";
import OrderSearchModal from "../components/OrderSearchModal";
import SimpleStaffChat from "../components/SimpleStaffChat";
import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

const MenuManager = () => {
  const { data: menuData, refetch, isLoading } = useGetAllMenuItemsQuery();
  const [toggleAvailability] = useToggleMenuAvailabilityMutation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
  const menus = menuData?.data || [];

  // Socket connection now handled by NotificationBell in sidebar

  const handleToggleAvailability = async (menuId, currentStatus) => {
    try {
      await toggleAvailability({ menuId, available: !currentStatus }).unwrap();
      toast.success("Menu availability updated!");
      refetch();
    } catch (error) {
      toast.error("Failed to update menu availability");
    }
  };

  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setShowMenuModal(true);
  };

  const handleEditMenuItem = (menuItem) => {
    setEditingMenuItem(menuItem);
    setShowMenuModal(true);
  };

  const handleMenuModalClose = () => {
    setShowMenuModal(false);
    setEditingMenuItem(null);
  };

  const handleMenuSuccess = () => {
    refetch();
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar 
        user={user} 
        onLogout={confirmLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage menu item availability</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAddMenuItem}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4" />
              Add New Menu Item
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm lg:text-base"
            >
              Search Orders
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear all chat data?')) {
                  try {
                    await fetch(`${import.meta.env.VITE_BASE_URL}/chat/clear-all`, {
                      method: 'DELETE'
                    });
                    toast.success('All chat data cleared!');
                    window.location.reload();
                  } catch (error) {
                    toast.error('Failed to clear chat data');
                  }
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm lg:text-base"
            >
              Clear All Chats
            </button>
          </div>

          {/* Customer Support Chat */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setShowChatModal(true)}
                className="flex items-center gap-3 w-full p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-red-500" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-gray-800">Customer Support Chat</h2>
                  <p className="text-sm text-gray-600">Click to open chat interface</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <ChefHat className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold">Menu Items</h2>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No menu items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Name</th>
                        <th className="text-left py-3">Category</th>
                        <th className="text-left py-3">Price</th>
                        <th className="text-left py-3">Status</th>
                        <th className="text-left py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map((menu) => (
                        <tr key={menu._id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              {menu.image && (
                                <img 
                                  src={menu.image} 
                                  alt={menu.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{menu.name}</p>
                                <p className="text-sm text-gray-500">{menu.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">{menu.category?.name || 'N/A'}</td>
                          <td className="py-3">{formatCurrency(menu.price || 0)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              menu.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {menu.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditMenuItem(menu)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Edit menu item"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleToggleAvailability(menu._id, menu.available)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Toggle availability"
                              >
                                {menu.available ? 
                                  <ToggleRight className="w-6 h-6" /> : 
                                  <ToggleLeft className="w-6 h-6" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
      
      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-96 flex flex-col m-4">
            <div className="bg-red-500 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Customer Support Chat</h2>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="hover:bg-red-600 p-1 rounded"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
            <div className="flex-1 p-4">
              <SimpleStaffChat user={user} />
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={showMenuModal}
        onClose={handleMenuModalClose}
        menuItem={editingMenuItem}
        onSuccess={handleMenuSuccess}
      />
    </div>
  );
};

export default MenuManager;