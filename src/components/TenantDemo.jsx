import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTenant } from '../slices/tenantSlice';

const TenantDemo = () => {
  const dispatch = useDispatch();
  const [selectedDemo, setSelectedDemo] = useState('');

  const demoRestaurants = [
    {
      _id: 'demo1',
      name: 'Pizza Palace',
      subdomain: 'pizzapalace',
      email: 'info@pizzapalace.com',
      phone: '+1-555-0123',
      address: '123 Main St, City, State 12345',
      branding: {
        primaryColor: '#e53e3e',
        secondaryColor: '#fd7f28',
        accentColor: '#fbb040',
        fontFamily: 'Inter',
        logo: '/uploads/logos/pizza-logo.png'
      }
    },
    {
      _id: 'demo2',
      name: 'Burger Barn',
      subdomain: 'burgerbarn',
      email: 'hello@burgerbarn.com',
      phone: '+1-555-0456',
      address: '456 Oak Ave, City, State 12345',
      branding: {
        primaryColor: '#38a169',
        secondaryColor: '#68d391',
        accentColor: '#f6e05e',
        fontFamily: 'Roboto',
        logo: '/uploads/logos/burger-logo.png'
      }
    },
    {
      _id: 'demo3',
      name: 'Sushi Zen',
      subdomain: 'sushizen',
      email: 'contact@sushizen.com',
      phone: '+1-555-0789',
      address: '789 Pine Rd, City, State 12345',
      branding: {
        primaryColor: '#3182ce',
        secondaryColor: '#63b3ed',
        accentColor: '#ed8936',
        fontFamily: 'Poppins',
        logo: '/uploads/logos/sushi-logo.png'
      }
    }
  ];

  const handleDemoSelect = (restaurant) => {
    setSelectedDemo(restaurant.subdomain);
    dispatch(setTenant(restaurant));
    
    // Apply branding
    const root = document.documentElement;
    root.style.setProperty('--primary-color', restaurant.branding.primaryColor);
    root.style.setProperty('--secondary-color', restaurant.branding.secondaryColor);
    root.style.setProperty('--accent-color', restaurant.branding.accentColor);
    
    if (restaurant.branding.fontFamily) {
      document.body.style.fontFamily = restaurant.branding.fontFamily;
    }
    
    document.title = `${restaurant.name} - Order Online`;
  };

  const resetDemo = () => {
    setSelectedDemo('');
    dispatch(setTenant(null));
    
    // Reset branding
    const root = document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    document.body.style.fontFamily = '';
    document.title = 'Chopie - Restaurant Management';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Tenant Restaurant Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Experience how different restaurants can have their own branded menu pages
          </p>
          
          {selectedDemo && (
            <button
              onClick={resetDemo}
              className="mb-8 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset Demo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demoRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                selectedDemo === restaurant.subdomain ? 'ring-4 ring-blue-500' : ''
              }`}
              onClick={() => handleDemoSelect(restaurant)}
            >
              <div 
                className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                style={{ backgroundColor: restaurant.branding.primaryColor + '20' }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: restaurant.branding.primaryColor }}
                >
                  {restaurant.name.charAt(0)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {restaurant.address}
                </p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: restaurant.branding.primaryColor }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: restaurant.branding.secondaryColor }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: restaurant.branding.accentColor }}
                  ></div>
                  <span className="text-xs text-gray-500 ml-2">
                    {restaurant.branding.fontFamily}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>📞 {restaurant.phone}</p>
                  <p>📧 {restaurant.email}</p>
                  <p>🌐 {restaurant.subdomain}.chopie.com</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedDemo && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tenant Features Demonstrated:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">✅ Implemented Features:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Tenant-specific branding (colors, fonts)</li>
                  <li>• Isolated restaurant data</li>
                  <li>• Dynamic page title updates</li>
                  <li>• Subdomain/path-based routing</li>
                  <li>• Branded menu page components</li>
                  <li>• Restaurant customization dashboard</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🔄 How it works:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• TenantRouter identifies restaurant by subdomain/path</li>
                  <li>• Fetches restaurant data and branding from API</li>
                  <li>• Applies custom CSS variables for colors</li>
                  <li>• Renders TenantMenuPage with restaurant branding</li>
                  <li>• All menu items styled with tenant colors</li>
                  <li>• Cart and modals use tenant branding</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDemo;