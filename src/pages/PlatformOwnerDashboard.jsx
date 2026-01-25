import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PlatformOwnerDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const user = userInfo?.user; // Extract user from userInfo
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [activityFeed, setActivityFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'PlatformOwner') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchRestaurantDetails = async (restaurantId) => {

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const url = `${apiUrl}/platform-owner/restaurants/${restaurantId}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.status) {
        setRestaurantDetails(data.data);
        setShowDetailsModal(true);

      } else {
        console.error('Failed to fetch restaurant details:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant details:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const headers = { 'Authorization': `Bearer ${token}` };

      const [analyticsRes, healthRes, revenueRes, activityRes, alertsRes, restaurantsRes] = 
        await Promise.all([
          fetch(`${apiUrl}/platform-owner/analytics`, { headers }),
          fetch(`${apiUrl}/platform-owner/system-health`, { headers }),
          fetch(`${apiUrl}/platform-owner/revenue-analytics`, { headers }),
          fetch(`${apiUrl}/platform-owner/activity-feed?limit=10`, { headers }),
          fetch(`${apiUrl}/platform-owner/alerts`, { headers }),
          fetch(`${apiUrl}/platform-owner/restaurants`, { headers })
        ]);

      const [analyticsData, healthData, revenueDataRes, activityData, alertsData, restaurantsData] = 
        await Promise.all([
          analyticsRes.json(),
          healthRes.json(),
          revenueRes.json(),
          activityRes.json(),
          alertsRes.json(),
          restaurantsRes.json()
        ]);

      if (analyticsData.status) setAnalytics(analyticsData.data);
      if (healthData.status) setSystemHealth(healthData.data);
      if (revenueDataRes.status) setRevenueData(revenueDataRes.data);
      if (activityData.status) setActivityFeed(activityData.data);
      if (alertsData.status) setAlerts(alertsData.data);
      if (restaurantsData.status) setRestaurants(restaurantsData.data);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const revenueChartData = {
    labels: revenueData.chartData?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.chartData?.map(item => item.revenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const restaurantStatusData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [analytics.restaurants?.active || 0, analytics.restaurants?.pending || 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  if (user?.role !== 'PlatformOwner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Platform Owner access required.</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
              <p className="text-gray-600">Monitor and manage the entire platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${getHealthColor(systemHealth.healthScore)}`}>
                <div className="w-3 h-3 rounded-full bg-current mr-2"></div>
                <span className="font-medium">System Health: {systemHealth.healthScore}%</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/platform-owner/login');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'analytics', name: 'Analytics' },
              { id: 'restaurants', name: 'Restaurants' },
              { id: 'activity', name: 'Activity' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      alert.type === 'success' ? 'bg-green-50 border-green-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                        <span className="text-lg font-bold">{alert.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.restaurants?.total || 0}</p>
                    <p className="text-xs text-green-600">+{analytics.restaurants?.monthlyGrowth || 0} this month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{analytics.revenue?.total?.toLocaleString() || 0}</p>
                    <p className="text-xs text-green-600">₦{analytics.revenue?.today?.toLocaleString() || 0} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.orders?.total || 0}</p>
                    <p className="text-xs text-blue-600">{analytics.orders?.today || 0} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.users?.active || 0}</p>
                    <p className="text-xs text-gray-500">of {analytics.users?.total || 0} total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-64">
                  <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Restaurant Status</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={restaurantStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{systemHealth.orders?.last24h || 0}</div>
                  <div className="text-sm text-gray-600">Orders (24h)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{systemHealth.restaurants?.active || 0}</div>
                  <div className="text-sm text-gray-600">Active Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{systemHealth.auditLogs?.last24h || 0}</div>
                  <div className="text-sm text-gray-600">System Events (24h)</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold">₦{revenueData.summary?.totalRevenue?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{revenueData.summary?.totalOrders || 0}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">₦{revenueData.summary?.avgOrderValue?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Restaurant Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.subdomain}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{restaurant.stats?.userCount || 0}</td>
                      <td className="px-6 py-4 text-sm">{restaurant.stats?.orderCount || 0}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {

                            fetchRestaurantDetails(restaurant._id);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm"
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
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.userId?.name} • {activity.restaurantId?.name} • 
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      {}
      
      {/* Restaurant Details Modal */}
      {showDetailsModal && restaurantDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {restaurantDetails.restaurant.name} - Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Restaurant Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Restaurant Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {restaurantDetails.restaurant.name}</p>
                    <p><span className="font-medium">Email:</span> {restaurantDetails.restaurant.email}</p>
                    <p><span className="font-medium">Phone:</span> {restaurantDetails.restaurant.phone}</p>
                    <p><span className="font-medium">Subdomain:</span> {restaurantDetails.restaurant.subdomain}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        restaurantDetails.restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurantDetails.restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    <p><span className="font-medium">Created:</span> {new Date(restaurantDetails.restaurant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Address</h4>
                  <p className="text-sm">
                    {restaurantDetails.restaurant.address?.street}, {restaurantDetails.restaurant.address?.city}, {restaurantDetails.restaurant.address?.state} {restaurantDetails.restaurant.address?.zipCode}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{restaurantDetails.stats.userCount}</div>
                      <div className="text-xs text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{restaurantDetails.stats.totalOrders}</div>
                      <div className="text-xs text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">₦{restaurantDetails.stats.totalRevenue?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-600">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">₦{restaurantDetails.stats.avgOrderValue?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-600">Avg Order Value</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Settings</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Online Ordering:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        restaurantDetails.restaurant.settings?.onlineOrdering ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurantDetails.restaurant.settings?.onlineOrdering ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                    <p><span className="font-medium">Table Reservations:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        restaurantDetails.restaurant.settings?.tableReservations ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurantDetails.restaurant.settings?.tableReservations ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                    <p><span className="font-medium">VIP Program:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        restaurantDetails.restaurant.settings?.vipProgram ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurantDetails.restaurant.settings?.vipProgram ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {restaurantDetails.recentOrders && restaurantDetails.recentOrders.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recent Orders</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {restaurantDetails.recentOrders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-2 text-sm font-mono">{order.orderNumber}</td>
                          <td className="px-4 py-2 text-sm">{order.userId?.name || 'Guest'}</td>
                          <td className="px-4 py-2 text-sm">₦{order.totalAmount?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformOwnerDashboard;