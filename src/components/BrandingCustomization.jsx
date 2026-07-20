import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useBranding } from '../Context/BrandingContext';

const BrandingCustomization = () => {
  const { user } = useSelector((state) => state.auth);
  const { branding: contextBranding, fetchBranding, applyBranding } = useBranding();
  const [branding, setBranding] = useState({
    name: '',
    logo: null,
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#eab308'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (contextBranding) {
      setBranding(contextBranding);
      if (contextBranding.logo) {
        if (contextBranding.logo.startsWith('http')) {
          setLogoPreview(contextBranding.logo);
        } else {
          setLogoPreview(`${import.meta.env.VITE_API_URL?.split('/api')[0] || 'https://backend-chopie-project.onrender.com'}${contextBranding.logo}`);
        }
      }
    }

    const userData = sessionStorage.getItem('restaurantUser');
    if (userData) {
      const u = JSON.parse(userData);
      const restaurantName = u?.data?.restaurantName || u?.restaurantName;
      if (restaurantName && !branding.name) {
        setBranding(prev => ({ ...prev, name: restaurantName }));
      }
    }

    fetchBrandingData();
  }, [contextBranding]);

  const fetchBrandingData = async () => {
    try {
      const userData = sessionStorage.getItem('restaurantUser');
      const u = userData ? JSON.parse(userData) : null;
      const token = u?.data?.token || u?.token;

      const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-chopie-project.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/restaurant/branding`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.status && data.data?.branding) {
        setBranding({
          name: data.data.branding?.name || data.data.name || '',
          logo: data.data.branding?.logo || null,
          primaryColor: data.data.branding?.primaryColor || '#ef4444',
          secondaryColor: data.data.branding?.secondaryColor || '#f97316',
          accentColor: data.data.branding?.accentColor || '#eab308'
        });
        if (data.data.branding?.logo) {
          if (data.data.branding.logo.startsWith('http')) {
            setLogoPreview(data.data.branding.logo);
          } else {
            setLogoPreview(`${import.meta.env.VITE_API_URL?.split('/api')[0] || 'https://backend-chopie-project.onrender.com'}${data.data.branding.logo}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  const handleColorChange = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBranding(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      if (branding.logo instanceof File) {
        formData.append('logo', branding.logo);
      }
      formData.append('name', branding.name);
      formData.append('primaryColor', branding.primaryColor);
      formData.append('secondaryColor', branding.secondaryColor);
      formData.append('accentColor', branding.accentColor);

      const userData = sessionStorage.getItem('restaurantUser');
      const u = userData ? JSON.parse(userData) : null;
      const token = u?.data?.token || u?.token;

      const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-chopie-project.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/restaurant/branding`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.status) {
        setMessage('Branding updated successfully!');

        const updatedBranding = {
          name: data.data?.branding?.name || branding.name,
          logo: data.data?.branding?.logo || branding.logo,
          primaryColor: data.data?.branding?.primaryColor || branding.primaryColor,
          secondaryColor: data.data?.branding?.secondaryColor || branding.secondaryColor,
          accentColor: data.data?.branding?.accentColor || branding.accentColor
        };

        setBranding(updatedBranding);

        if (data.data?.branding?.logo) {
          if (data.data.branding.logo.startsWith('http')) {
            setLogoPreview(data.data.branding.logo);
          } else {
            setLogoPreview(`${import.meta.env.VITE_API_URL?.split('/api')[0] || 'https://backend-chopie-project.onrender.com'}${data.data.branding.logo}`);
          }
        }

        await fetchBranding();
        applyBranding(updatedBranding);
      } else {
        setMessage(data.message || 'Failed to update branding');
      }
    } catch (error) {
      setMessage('Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Customization</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={branding.name}
              onChange={(e) => setBranding(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your restaurant name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Color Customization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div
              className="p-4 sm:p-6 rounded-lg border-2"
              style={{
                backgroundColor: branding.primaryColor + '10',
                borderColor: branding.primaryColor
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                )}
                <h4 className="text-lg sm:text-xl font-bold break-words" style={{ color: branding.primaryColor }}>
                  {branding.name || user?.restaurantName || 'Your Restaurant'}
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: branding.primaryColor }}>
                  Primary Button
                </button>
                <button type="button" className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: branding.secondaryColor }}>
                  Secondary Button
                </button>
                <button type="button" className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: branding.accentColor }}>
                  Accent Button
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandingCustomization;
