import { useState, useEffect } from "react";
import { useChangePasswordMutation, useGetRestaurantSettingsQuery, useUpdateRestaurantSettingsMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Menu, Palette, Clock, Phone, MapPin } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import BrandingCustomization from "../components/BrandingCustomization";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../Context/BrandingContext";


const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: ''
    }
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { data: settingsData, isLoading: settingsLoading } = useGetRestaurantSettingsQuery();
  const [updateSettings, { isLoading: updateLoading }] = useUpdateRestaurantSettingsMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const userData = sessionStorage.getItem("restaurantUser");
  const user = userData ? JSON.parse(userData).data || JSON.parse(userData) : {};

  // Check if user is MenuManager - they should only see account tab
  const isMenuManager = user?.role === 'MenuManager';
  
  // Set default tab based on role
  useEffect(() => {
    if (isMenuManager) {
      setActiveTab('account');
    } else {
      setActiveTab('branding');
    }
  }, [isMenuManager]);

  // Load settings data
  useEffect(() => {
    if (settingsData?.data) {
      const { operatingHours: hours, contactInfo: contact } = settingsData.data;
      if (hours) {
        setOperatingHours(hours);
      }
      if (contact) {
        setContactInfo({
          name: contact.name || '',
          phone: contact.phone || '',
          email: contact.email || '',
          website: contact.website || '',
          address: contact.address || '',
          socialMedia: {
            facebook: contact.socialMedia?.facebook || '',
            instagram: contact.socialMedia?.instagram || ''
          }
        });
      }
    }
  }, [settingsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();
      
      // Update session storage with new token if provided
      if (result.data?.token) {
        const currentUser = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
        const updatedUser = {
          ...currentUser,
          data: {
            ...currentUser.data,
            ...result.data.user,
            token: result.data.token
          }
        };
        sessionStorage.setItem("restaurantUser", JSON.stringify(updatedUser));
      }
      
      toast.success("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  const handleHoursChange = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day.toLowerCase()]: {
        ...prev[day.toLowerCase()],
        [field]: value
      }
    }));
  };

  const handleContactChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setContactInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveHours = async () => {
    try {
      await updateSettings({ operatingHours }).unwrap();
      toast.success('Operating hours updated successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update hours');
    }
  };

  const handleSaveContact = async () => {
    try {
      await updateSettings({ contactInfo }).unwrap();
      toast.success('Contact information updated successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update contact info');
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Restaurant Settings</h1>
                <p className="text-gray-600 text-sm lg:text-base">Customize your restaurant and manage settings</p>
              </div>
            </div>
            
            {/* Settings Tabs */}
            {!isMenuManager && (
              <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('branding')}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'branding' ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'branding' ? branding.primaryColor : 'transparent'
                  }}
                >
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Branding</span>
                </button>
                <button
                  onClick={() => setActiveTab('hours')}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'hours' ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'hours' ? branding.primaryColor : 'transparent'
                  }}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Hours</span>
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'contact' ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'contact' ? branding.primaryColor : 'transparent'
                  }}
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Contact</span>
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'account' ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'account' ? branding.primaryColor : 'transparent'
                  }}
                >
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Account</span>
                </button>
              </div>
            )}
          </div>

        

          {/* Tab Content */}
          {!isMenuManager && activeTab === 'branding' && (
            <BrandingCustomization />
          )}
          
          {!isMenuManager && activeTab === 'hours' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
              <p className="text-gray-600 mb-6">Set your restaurant's operating hours</p>
              
              {settingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderBottomColor: branding.primaryColor }}></div>
                  <p className="mt-2 text-gray-600">Loading hours...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const dayKey = day.toLowerCase();
                    const dayData = operatingHours[dayKey] || { open: '09:00', close: '22:00', closed: false };
                    
                    return (
                      <div key={day} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span className="font-medium w-20 text-sm sm:text-base">{day}</span>
                            <label className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                className="rounded" 
                                checked={!dayData.closed}
                                onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                              />
                              <span className="text-sm text-gray-600">Open</span>
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 w-12">Open:</label>
                              <input 
                                type="time" 
                                value={dayData.open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                disabled={dayData.closed}
                                className="border rounded px-2 py-1 disabled:bg-gray-100 text-sm" 
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 w-12">Close:</label>
                              <input 
                                type="time" 
                                value={dayData.close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                disabled={dayData.closed}
                                className="border rounded px-2 py-1 disabled:bg-gray-100 text-sm" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button 
                onClick={handleSaveHours}
                disabled={updateLoading}
                className="mt-6 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => !updateLoading && (e.target.style.backgroundColor = branding.primaryColor + 'dd')}
                onMouseLeave={(e) => !updateLoading && (e.target.style.backgroundColor = branding.primaryColor)}
              >
                {updateLoading ? 'Saving...' : 'Save Hours'}
              </button>
            </div>
          )}
          
          {!isMenuManager && activeTab === 'contact' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-6">Update your restaurant's contact details</p>
              
              {settingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderBottomColor: branding.primaryColor }}></div>
                  <p className="mt-2 text-gray-600">Loading contact info...</p>
                </div>
              ) : (
                <>
                  {/* Restaurant URL Display */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Your Restaurant URL</h3>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-white px-3 py-2 rounded border flex-1">
                        https://{settingsData?.data?.subdomain || 'your-restaurant'}.chopie-resturant-frontend.vercel.app
                      </code>
                      <button
                        onClick={() => {
                          const url = `https://${settingsData?.data?.subdomain}.chopie-resturant-frontend.vercel.app`;
                          navigator.clipboard.writeText(url);
                          toast.success('URL copied to clipboard!');
                        }}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">Share this URL with your customers to access your menu</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="Restaurant Name"
                      value={contactInfo.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="+1 (555) 123-4567"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="contact@restaurant.com"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input 
                      type="url" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="https://restaurant.com"
                      value={contactInfo.website}
                      onChange={(e) => handleContactChange('website', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                      className="w-full border rounded-lg px-3 py-2" 
                      rows="3" 
                      placeholder="123 Main Street, City, State 12345"
                      value={contactInfo.address}
                      onChange={(e) => handleContactChange('address', e.target.value)}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input 
                      type="url" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="https://facebook.com/restaurant"
                      value={contactInfo.socialMedia.facebook}
                      onChange={(e) => handleContactChange('socialMedia.facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input 
                      type="url" 
                      className="w-full border rounded-lg px-3 py-2" 
                      placeholder="https://instagram.com/restaurant"
                      value={contactInfo.socialMedia.instagram}
                      onChange={(e) => handleContactChange('socialMedia.instagram', e.target.value)}
                    />
                  </div>
                </div>
                </>
              )}
              
              <button 
                onClick={handleSaveContact}
                disabled={updateLoading}
                className="mt-6 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => !updateLoading && (e.target.style.backgroundColor = branding.primaryColor + 'dd')}
                onMouseLeave={(e) => !updateLoading && (e.target.style.backgroundColor = branding.primaryColor)}
              >
                {updateLoading ? 'Saving...' : 'Save Contact Info'}
              </button>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6" style={{ color: branding.primaryColor }} />
                  <h2 className="text-xl font-semibold">Change Password</h2>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white py-3 rounded-lg focus:ring-4 disabled:opacity-50 font-medium transition-colors"
                    style={{ 
                      backgroundColor: isLoading ? branding.primaryColor + '80' : branding.primaryColor,
                      focusRingColor: branding.primaryColor + '33'
                    }}
                    onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = branding.primaryColor + 'dd')}
                    onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = branding.primaryColor)}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = branding.primaryColor + 'dd'}
                onMouseLeave={(e) => e.target.style.backgroundColor = branding.primaryColor}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;