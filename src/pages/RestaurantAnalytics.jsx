import { useState } from "react";
import { useGetAnalyticsQuery } from "../slices/restaurantSlice";
import { BarChart3, DollarSign, Clock, TrendingUp, Menu } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../Context/BrandingContext";

const RestaurantAnalytics = () => {
  const [period, setPeriod] = useState("day");
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const userData = sessionStorage.getItem("restaurantUser");
  const user = userData ? JSON.parse(userData).data || JSON.parse(userData) : {};
  
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery(period);
  const analytics = analyticsData?.data || {};

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
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
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 text-sm lg:text-base">Track your restaurant's performance</p>
              </div>
            </div>
            
            {/* Period Selector */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {['day', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === p ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: period === p ? branding.primaryColor : 'transparent'
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: branding.primaryColor }}></div>
              <p className="text-gray-500 text-lg">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center ">
                    <div className="bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.completedOrders || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Order Time</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.avgOrderTime || 0} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fast Orders (&lt;20 min)</span>
                      <span className="font-semibold text-green-600">{analytics.fastOrders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delayed Orders (&gt;30 min)</span>
                      <span className="font-semibold text-red-600">{analytics.delayedOrders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-blue-600">
                        {analytics.totalOrders > 0 
                          ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cash Orders</span>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{analytics.paymentMethods?.cash?.count || 0}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(analytics.paymentMethods?.cash?.revenue || 0)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transfer Orders</span>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{analytics.paymentMethods?.transfer?.count || 0}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(analytics.paymentMethods?.transfer?.revenue || 0)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Insights</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Period</span>
                      <span className="font-semibold text-gray-900 capitalize">{analytics.period || period}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;