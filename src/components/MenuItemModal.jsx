import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateMenuItemMutation, useUpdateMenuItemMutation, useGetCategoriesQuery } from "../slices/restaurantSlice";

const MenuItemModal = ({ isOpen, onClose, menuItem = null, onSuccess }) => {
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
    menuTypes: {
      REGULAR: {
        price: "",
        available: true
      },
      VIP: {
        price: "",
        available: true
      }
    }
  });


  const { data: categoriesData } = useGetCategoriesQuery();
  const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();

  const categories = categoriesData?.data || [];
  const isEditing = !!menuItem;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || "",
        description: menuItem.description || "",
        price: menuItem.price?.toString() || "",
        category: menuItem.category?._id || "",
        image: menuItem.image || "",
        available: menuItem.available ?? true,
        menuTypes: {
          REGULAR: {
            price: menuItem.menuTypes?.REGULAR?.price?.toString() || menuItem.price?.toString() || "",
            available: menuItem.menuTypes?.REGULAR?.available ?? true
          },
          VIP: {
            price: menuItem.menuTypes?.VIP?.price?.toString() || menuItem.price?.toString() || "",
            available: menuItem.menuTypes?.VIP?.available ?? true
          }
        }
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        available: true,
        menuTypes: {
          REGULAR: {
            price: "",
            available: true
          },
          VIP: {
            price: "",
            available: true
          }
        }
      });
    }
  }, [menuItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || 
        !formData.menuTypes.REGULAR.price || !formData.menuTypes.VIP.price) {
      toast.error("Please fill in all required fields including Regular and VIP prices");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.menuTypes.REGULAR.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('available', formData.available);
      
      // Add menuTypes as JSON string
      formDataToSend.append('menuTypes', JSON.stringify({
        REGULAR: {
          price: parseFloat(formData.menuTypes.REGULAR.price),
          available: formData.menuTypes.REGULAR.available
        },
        VIP: {
          price: parseFloat(formData.menuTypes.VIP.price),
          available: formData.menuTypes.VIP.available
        }
      }));
      
      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
if (isEditing) {
  await updateMenuItem({ menuId: menuItem._id, body: formDataToSend }).unwrap();

} else {
  await createMenuItem(formDataToSend).unwrap();
}

      
      onSuccess();
      onClose();
      // clear form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        available: true,
        menuTypes: {
          REGULAR: {
            price: "",
            available: true
          },
          VIP: {
            price: "",
            available: true
          }
        }
      });
      setImageFile(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save menu item");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isEditing ? "✏️ Edit Menu Item" : "➕ Add New Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  🍽️ Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter drink name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  💰 Regular Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.menuTypes.REGULAR.price}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    menuTypes: {
                      ...formData.menuTypes,
                      REGULAR: {
                        ...formData.menuTypes.REGULAR,
                        price: e.target.value
                      }
                    }
                  })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  👑 VIP Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.menuTypes.VIP.price}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    menuTypes: {
                      ...formData.menuTypes,
                      VIP: {
                        ...formData.menuTypes.VIP,
                        price: e.target.value
                      }
                    }
                  })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  📂 Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  📝 Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  rows={2}
                  placeholder="Describe the menu item"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  📸 Upload Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFormData({ ...formData, image: e.target.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-400 transition-all duration-200 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-500 file:text-white file:cursor-pointer hover:file:bg-red-600"
                  />
                  {formData.image && (
                    <div className="relative">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center bg-blue-50 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="regularAvailable"
                    checked={formData.menuTypes.REGULAR.available}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      menuTypes: {
                        ...formData.menuTypes,
                        REGULAR: {
                          ...formData.menuTypes.REGULAR,
                          available: e.target.checked
                        }
                      }
                    })}
                    className="w-5 h-5 text-blue-500 border-2 border-gray-300 rounded focus:ring-blue-400 mr-3"
                  />
                  <label htmlFor="regularAvailable" className="text-sm font-semibold text-gray-800">
                    🍽️ Available for Regular customers
                  </label>
                </div>
                
                <div className="flex items-center bg-yellow-50 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="vipAvailable"
                    checked={formData.menuTypes.VIP.available}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      menuTypes: {
                        ...formData.menuTypes,
                        VIP: {
                          ...formData.menuTypes.VIP,
                          available: e.target.checked
                        }
                      }
                    })}
                    className="w-5 h-5 text-yellow-500 border-2 border-gray-300 rounded focus:ring-yellow-400 mr-3"
                  />
                  <label htmlFor="vipAvailable" className="text-sm font-semibold text-gray-800">
                    👑 Available for VIP customers
                  </label>
                </div>
                
                <div className="flex items-center bg-gray-50 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-400 mr-3"
                  />
                  <label htmlFor="available" className="text-sm font-semibold text-gray-800">
                    ✅ Overall availability
                  </label>
                </div>
              </div>
            </div>
          </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? "⏳ Saving..." : isEditing ? "✏️ Update Item" : "➕ Create Item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;