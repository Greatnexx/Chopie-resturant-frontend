import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/apiUtils';

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingApprovals: 0,
    totalUsers: 0
  });

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchRestaurants();
      fetchStats();
    }
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/tenant/admin/restaurants`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
  };

  const handleRestaurantStatusChange = async (restaurantId, isActive) => {
    try {
      const response = await fetch(`${getBaseUrl()}/tenant/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();
      if (data.status) {
        setRestaurants(prev => 
          prev.map(restaurant => 
            restaurant._id === restaurantId 
              ? { ...restaurant, isActive }
              : restaurant
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to update restaurant status:', error);
    }
  };

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage restaurants and system overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stats.totalRestaurants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stats.activeRestaurants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Restaurant Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subdomain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.branding?.logo && (
                          <img 
                            className="h-10 w-10 rounded-full mr-3" 
                            src={getLogoUrl(restaurant.branding.logo)} 
                            alt={restaurant.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.subdomain}.chopie.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.email}</div>
                      <div className="text-sm text-gray-500">{restaurant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        restaurant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{restaurant.subscription?.plan || 'basic'}</div>
                      <div className="text-sm text-gray-500 capitalize">{restaurant.subscription?.status || 'active'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRestaurantStatusChange(restaurant._id, !restaurant.isActive)}
                        className={`mr-2 px-3 py-1 rounded text-xs font-medium ${
                          restaurant.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {restaurant.isActive ? 'Suspend' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleViewDetails(restaurant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restaurant Details Modal */}
        {showDetailsModal && selectedRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Restaurant Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {selectedRestaurant.branding?.logo && (
                      <img 
                        className="h-16 w-16 rounded-full" 
                        src={getLogoUrl(selectedRestaurant.branding.logo)} 
                        alt={selectedRestaurant.name}
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold">{selectedRestaurant.name}</h4>
                      <p className="text-gray-600">{selectedRestaurant.subdomain}.chopie.com</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                      <p className="text-sm text-gray-600">Email: {selectedRestaurant.email}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedRestaurant.phone}</p>
                      <p className="text-sm text-gray-600">Address: {selectedRestaurant.address}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Status & Subscription</h5>
                      <p className="text-sm text-gray-600">
                        Status: <span className={`font-medium ${
                          selectedRestaurant.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedRestaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">Plan: {selectedRestaurant.subscription?.plan || 'Basic'}</p>
                      <p className="text-sm text-gray-600">Subscription Status: {selectedRestaurant.subscription?.status || 'Active'}</p>
                    </div>
                  </div>
                  
                  {selectedRestaurant.branding && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Branding</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <p className="text-sm text-gray-600">Primary Color: 
                          <span className="ml-2 inline-block w-4 h-4 rounded" 
                                style={{ backgroundColor: selectedRestaurant.branding.primaryColor }}></span>
                          {selectedRestaurant.branding.primaryColor}
                        </p>
                        <p className="text-sm text-gray-600">Secondary Color: 
                          <span className="ml-2 inline-block w-4 h-4 rounded" 
                                style={{ backgroundColor: selectedRestaurant.branding.secondaryColor }}></span>
                          {selectedRestaurant.branding.secondaryColor}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Registration Details</h5>
                    <p className="text-sm text-gray-600">Created: {new Date(selectedRestaurant.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Last Updated: {new Date(selectedRestaurant.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;