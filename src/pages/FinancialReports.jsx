import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAnalyticsQuery } from "../slices/restaurantSlice";
import { Menu, BarChart3, Calendar, Download, TrendingUp, DollarSign } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useBranding } from "../Context/BrandingContext";
import { toast } from "sonner";
import { formatCurrency } from "../utils/formatCurrency";

const FinancialReports = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();
  const { branding } = useBranding();

  // Calculate period based on date range
  const daysDiff = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
  const period = daysDiff > 30 ? 'month' : daysDiff > 7 ? 'week' : 'day';
  
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery(period, { skip: !user });
  const analytics = analyticsData?.data || {};

  useEffect(() => {
    const userData = sessionStorage.getItem("restaurantUser");
    if (!userData) {
      navigate("/restaurant/login");
      return;
    }
    const parsedData = JSON.parse(userData);
    const user = parsedData.data || parsedData;
    setUser(user);

    if (user.role !== 'SuperAdmin' && user.role !== 'TransactionAdmin') {
      navigate("/restaurant/dashboard");
      return;
    }
  }, [navigate]);

  const exportReport = () => {
    // Implement CSV export functionality
    toast.info('Export functionality will be implemented');
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
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
                <p className="text-gray-600 text-sm lg:text-base">Generate and view financial analytics</p>
              </div>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  <span className="font-medium">Report Period</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="p-2 border rounded-lg focus:ring-2 focus:border-gray-400"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="p-2 border rounded-lg focus:ring-2 focus:border-gray-400"
                  />
                </div>
              </div>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: branding.primaryColor }}></div>
              <p className="text-gray-500">Loading report...</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                      <DollarSign className="w-6 h-6" style={{ color: branding.primaryColor }} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                      <BarChart3 className="w-6 h-6" style={{ color: branding.primaryColor }} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{analytics.totalOrders || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                      <TrendingUp className="w-6 h-6" style={{ color: branding.primaryColor }} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                      <Calendar className="w-6 h-6" style={{ color: branding.primaryColor }} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Report Days</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>Cash Payments</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{analytics.paymentMethods?.cash?.count || 0}</p>
                        <p className="text-sm text-gray-500">orders</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span>Bank Transfer</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{analytics.paymentMethods?.transfer?.count || 0}</p>
                        <p className="text-sm text-gray-500">orders</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No data available</p>
                    <p className="text-sm text-gray-400">Revenue chart will appear here when orders are placed</p>
                  </div>
                </div>
              </div>

              {/* Top Selling Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
                {!analytics.totalOrders ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No sales data available</p>
                    <p className="text-sm text-gray-400">Top selling items will appear here when orders are placed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Item Name</th>
                          <th className="text-left py-3">Quantity Sold</th>
                          <th className="text-left py-3">Revenue</th>
                          <th className="text-left py-3">Avg Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Top items data would come from a separate API endpoint */}
                        <tr>
                          <td className="py-3 text-gray-500" colSpan="4">Top selling items data not available yet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;