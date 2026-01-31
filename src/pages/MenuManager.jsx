import { useGetAllMenuItemsQuery, useToggleMenuAvailabilityMutation, useDeleteMenuItemMutation, useGetCategoriesQuery, useCreateCategoryMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { ChefHat, ToggleLeft, ToggleRight, Plus, Edit, Menu, Trash2, FolderPlus, X } from "lucide-react";
import MenuItemModal from "../components/MenuItemModal";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";
import OrderSearchModal from "../components/OrderSearchModal";
import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { useBranding } from "../Context/BrandingContext";

const MenuManager = () => {
  const { data: menuData, refetch, isLoading } = useGetAllMenuItemsQuery();
  const [toggleAvailability] = useToggleMenuAvailabilityMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const user = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}").data || JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
  const menus = menuData?.data || [];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = user.token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will only work if no menu items are using this category.`)) {
      try {
        const token = user.token;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/category/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.status) {
          toast.success('Category deleted successfully!');
          fetchCategories();
        } else {
          toast.error(data.message || 'Failed to delete category');
        }
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

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

  const handleDeleteMenuItem = async (menuId, menuName) => {
    if (window.confirm(`Are you sure you want to delete "${menuName}"? This action cannot be undone.`)) {
      try {
        await deleteMenuItem(menuId).unwrap();
        toast.success("Menu item deleted successfully!");
        refetch();
      } catch (error) {
        toast.error("Failed to delete menu item");
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar 
        user={user} 
        onLogout={handleLogout}
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
              onClick={() => setShowCategoryModal(true)}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm lg:text-base transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <FolderPlus className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={() => {
                setShowCategoryManager(true);
                fetchCategories();
              }}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm lg:text-base transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Edit className="w-4 h-4" />
              Manage Categories
            </button>
            <button
              onClick={handleAddMenuItem}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm lg:text-base transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Add New Menu Item
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm lg:text-base transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              Search Orders
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <ChefHat className="w-6 h-6" style={{ color: branding.primaryColor }} />
                <h2 className="text-xl font-semibold">Menu Items</h2>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: branding.primaryColor }}></div>
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No menu items found</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
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
                                    src={menu.image.startsWith('http') ? menu.image : `${import.meta.env.VITE_API_URL.split('/api')[0]}${menu.image}`}
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
                                <button
                                  onClick={() => handleDeleteMenuItem(menu._id, menu.name)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete menu item"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {menus.map((menu) => (
                      <div key={menu._id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start gap-3 mb-3">
                          {menu.image && (
                            <img 
                              src={menu.image.startsWith('http') ? menu.image : `${import.meta.env.VITE_API_URL.split('/api')[0]}${menu.image}`}
                              alt={menu.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{menu.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                            <p className="text-sm font-medium text-gray-900">{menu.category?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(menu.price || 0)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            menu.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {menu.available ? 'Available' : 'Unavailable'}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditMenuItem(menu)}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Edit menu item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleAvailability(menu._id, menu.available)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Toggle availability"
                            >
                              {menu.available ? 
                                <ToggleRight className="w-5 h-5" /> : 
                                <ToggleLeft className="w-5 h-5" />
                              }
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(menu._id, menu.name)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete menu item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
      
      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={showMenuModal}
        onClose={handleMenuModalClose}
        menuItem={editingMenuItem}
        onSuccess={handleMenuSuccess}
      />
      
      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-hidden">
            <div className="text-white p-4 flex justify-between items-center rounded-t-2xl" style={{ backgroundColor: branding.primaryColor }}>
              <h2 className="text-xl font-bold">🗂️ Manage Categories</h2>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No categories found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">Created: {new Date(category.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category._id, category.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          toast.success('Category created successfully!');
          setShowCategoryModal(false);
          // The RTK Query mutation will automatically invalidate the cache
        }}
      />
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const { branding } = useBranding();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await createCategory({ name: categoryName.trim() }).unwrap();
      setCategoryName('');
      onSuccess();
    } catch (error) {
      if (error?.data?.message?.includes('already exists')) {
        toast.error('Category already exists. Please choose a different name.');
      } else {
        toast.error(error?.data?.message || 'Failed to create category');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="text-white p-4 flex justify-between items-center rounded-t-2xl" style={{ backgroundColor: branding.primaryColor }}>
          <h2 className="text-xl font-bold">📂 Add New Category</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white"
              style={{ '--focus-ring-color': branding.primaryColor + '33' }}
              placeholder="Enter category name (e.g., Appetizers, Main Course)"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuManager;