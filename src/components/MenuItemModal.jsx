import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateMenuItemMutation, useUpdateMenuItemMutation, useGetCategoriesQuery } from "../slices/restaurantSlice";
import { useBranding } from "../Context/BrandingContext";
import { getBaseUrl } from "../utils/apiUtils";
import "./MenuItemModal.css";

const MenuItemModal = ({ isOpen, onClose, menuItem = null, onSuccess }) => {
  const { branding } = useBranding();
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
    menuTypes: {
      REGULAR: { available: true, price: "" },
      VIP: { available: true, price: "" }
    }
  });

  const { data: categoriesData, refetch: refetchCategories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    return `${baseUrl}${imagePath}`;
  };

  const categories = categoriesData?.data || [];
  const isEditing = !!menuItem;
  const isLoading = isCreating || isUpdating;

  // Refetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      refetchCategories();
    }
  }, [isOpen, refetchCategories]);

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
            available: menuItem.menuTypes?.REGULAR?.available ?? true,
            price: menuItem.menuTypes?.REGULAR?.price?.toString() || menuItem.price?.toString() || ""
          },
          VIP: {
            available: menuItem.menuTypes?.VIP?.available ?? true,
            price: menuItem.menuTypes?.VIP?.price?.toString() || menuItem.price?.toString() || ""
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
          REGULAR: { available: true, price: "" },
          VIP: { available: true, price: "" }
        }
      });
    }
  }, [menuItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseInt(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('available', formData.available);
      
      // Add menuTypes data
      formDataToSend.append('menuTypes', JSON.stringify({
        REGULAR: {
          available: formData.menuTypes.REGULAR.available,
          price: parseInt(formData.menuTypes.REGULAR.price) || parseInt(formData.price)
        },
        VIP: {
          available: formData.menuTypes.VIP.available,
          price: parseInt(formData.menuTypes.VIP.price) || parseInt(formData.price)
        }
      }));
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (isEditing) {
        await updateMenuItem({ menuId: menuItem._id, body: formDataToSend }).unwrap();
        toast.success("Menu item updated successfully!");
      } else {
        await createMenuItem(formDataToSend).unwrap();
        toast.success("Menu item created successfully!");
      }
      
      onSuccess();
      onClose();
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        available: true,
        menuTypes: {
          REGULAR: { available: true, price: "" },
          VIP: { available: true, price: "" }
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
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="text-white p-4 flex justify-between items-center" style={{ backgroundColor: branding.primaryColor }}>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  🍽️ Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ 
                    '--tw-ring-color': branding.primaryColor,
                    '--tw-border-opacity': '1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = branding.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${branding.primaryColor}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter menu item name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  📝 Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = branding.primaryColor;
                    e.target.style.boxShadow = `0 0 0 2px ${branding.primaryColor}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  rows={3}
                  placeholder="Describe the menu item"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    💰 Base Price *
                  </label>
                  <input
                    type="text"
                    value={formData.price ? Number(formData.price).toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData({ ...formData, price: value });
                      }
                    }}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                    onFocus={(e) => {
                      e.target.style.borderColor = branding.primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${branding.primaryColor}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amount without decimals (e.g., 60000 for ₦60,000)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    📂 Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                    onFocus={(e) => {
                      e.target.style.borderColor = branding.primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${branding.primaryColor}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option disabled>No categories found - Please create a category first</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* VIP/Regular Pricing Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👑 VIP & Regular Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Regular Pricing */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🍽️</span>
                      <h4 className="font-semibold text-gray-800">Regular Menu</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="text"
                          value={formData.menuTypes.REGULAR.price ? Number(formData.menuTypes.REGULAR.price).toLocaleString() : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            if (value === '' || /^\d+$/.test(value)) {
                              setFormData({
                                ...formData,
                                menuTypes: {
                                  ...formData.menuTypes,
                                  REGULAR: {
                                    ...formData.menuTypes.REGULAR,
                                    price: value
                                  }
                                }
                              });
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          placeholder="Regular price"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="regular-available"
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
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400 mr-2"
                        />
                        <label htmlFor="regular-available" className="text-sm text-gray-700">
                          Available for regular customers
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* VIP Pricing */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">👑</span>
                      <h4 className="font-semibold text-gray-800">VIP Menu</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          VIP Price
                        </label>
                        <input
                          type="text"
                          value={formData.menuTypes.VIP.price ? Number(formData.menuTypes.VIP.price).toLocaleString() : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            if (value === '' || /^\d+$/.test(value)) {
                              setFormData({
                                ...formData,
                                menuTypes: {
                                  ...formData.menuTypes,
                                  VIP: {
                                    ...formData.menuTypes.VIP,
                                    price: value
                                  }
                                }
                              });
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                          placeholder="VIP price"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="vip-available"
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
                          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400 mr-2"
                        />
                        <label htmlFor="vip-available" className="text-sm text-gray-700">
                          Available for VIP customers
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  💡 Tip: VIP tables are identified by table numbers starting with "VIP" (e.g., VIP1, VIP2)
                </div>
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
                    className="dynamic-file-input w-full p-3 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-200 bg-gray-50"
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = branding.primaryColor;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  {formData.image && (
                    <div className="relative">
                      <img 
                        src={getImageUrl(formData.image)} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: branding.primaryColor
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = branding.secondaryColor;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = branding.primaryColor;
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-gray-50 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 border-2 border-gray-300 rounded mr-3"
                  style={{
                    accentColor: branding.primaryColor
                  }}
                />
                <label htmlFor="available" className="text-sm font-semibold text-gray-800">
                  ✅ Available for customers
                </label>
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
                className="flex-1 px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = branding.primaryColor + 'dd';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = branding.primaryColor;
                  }
                }}
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