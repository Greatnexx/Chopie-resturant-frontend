import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BrandingCustomization from './BrandingCustomization';
import { getBaseUrl } from '../utils/apiUtils';

const RestaurantCustomizationDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState({
    allowOnlineOrdering: true,
    requireTableNumber: true,
    enableVipTables: true,
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    },
    deliverySettings: {
      enabled: true,
      radius: 5,
      minOrder: 20,
      deliveryFee: 3.99
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'hours', name: 'Operating Hours', icon: '🕒' },
    { id: 'contact', name: 'Contact Info', icon: '📞' },
    { id: 'delivery', name: 'Delivery', icon: '🚚' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/restaurant/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${getBaseUrl()}/restaurant/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.status) {
        setMessage('Settings updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update settings');
      }
    } catch (error) {
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const renderBrandingTab = () => <BrandingCustomization />;

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowOnlineOrdering}
            onChange={(e) => handleSettingChange('', 'allowOnlineOrdering', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Allow Online Ordering</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.requireTableNumber}
            onChange={(e) => handleSettingChange('', 'requireTableNumber', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Require Table Number</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enableVipTables}
            onChange={(e) => handleSettingChange('', 'enableVipTables', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable VIP Tables</span>
        </label>
      </div>
    </div>
  );

  const renderHoursTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Operating Hours</h3>
      
      <div className="space-y-4">
        {Object.entries(settings.operatingHours).map(([day, hours]) => (
          <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="w-24 font-medium capitalize">{day}</div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hours.closed}
                onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Closed</span>
            </label>

            {!hours.closed && (
              <>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Open:</label>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Close:</label>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={settings.contactInfo.phone}
            onChange={(e) => handleSettingChange('contactInfo', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.contactInfo.email}
            onChange={(e) => handleSettingChange('contactInfo', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={settings.contactInfo.website}
            onChange={(e) => handleSettingChange('contactInfo', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
          <input
            type="url"
            value={settings.contactInfo.socialMedia.facebook}
            onChange={(e) => handleSettingChange('contactInfo', 'socialMedia', {
              ...settings.contactInfo.socialMedia,
              facebook: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
          <input
            type="url"
            value={settings.contactInfo.socialMedia.instagram}
            onChange={(e) => handleSettingChange('contactInfo', 'socialMedia', {
              ...settings.contactInfo.socialMedia,
              instagram: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
          <input
            type="url"
            value={settings.contactInfo.socialMedia.twitter}
            onChange={(e) => handleSettingChange('contactInfo', 'socialMedia', {
              ...settings.contactInfo.socialMedia,
              twitter: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderDeliveryTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Delivery Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.deliverySettings.enabled}
            onChange={(e) => handleSettingChange('deliverySettings', 'enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable Delivery</span>
        </label>

        {settings.deliverySettings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (km)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.deliverySettings.radius}
                onChange={(e) => handleSettingChange('deliverySettings', 'radius', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.deliverySettings.minOrder}
                onChange={(e) => handleSettingChange('deliverySettings', 'minOrder', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.deliverySettings.deliveryFee}
                onChange={(e) => handleSettingChange('deliverySettings', 'deliveryFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding': return renderBrandingTab();
      case 'settings': return renderSettingsTab();
      case 'hours': return renderHoursTab();
      case 'contact': return renderContactTab();
      case 'delivery': return renderDeliveryTab();
      default: return renderBrandingTab();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Customization</h1>
          <p className="text-gray-600">Customize your restaurant's appearance and settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
          
          {activeTab !== 'branding' && (
            <>
              {message && (
                <div className={`mt-6 p-4 rounded-md ${
                  message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCustomizationDashboard;