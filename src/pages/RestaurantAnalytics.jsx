import { useState } from "react";
import { useGetAnalyticsQuery } from "../slices/restaurantSlice";
import { BarChart3, DollarSign, Clock, TrendingUp, Menu, Calendar, AlertCircle, Flame, ShoppingBag } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../Context/BrandingContext";

const RestaurantAnalytics = () => {
  const [period, setPeriod] = useState("day");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const userData = sessionStorage.getItem("restaurantUser");
  const user = userData ? JSON.parse(userData).data || JSON.parse(userData) : {};
  
  const analyticsParams = useCustomRange && dateRange.startDate && dateRange.endDate
    ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
    : period;

  const { data: analyticsData, isLoading } = useGetAnalyticsQuery(analyticsParams);
  const analytics = analyticsData?.data || {};

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setUseCustomRange(false);
  };

  const handleApplyRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setUseCustomRange(true);
    }
  };

  const handleClearRange = () => {
    setDateRange({ startDate: "", endDate: "" });
    setUseCustomRange(false);
  };

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
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {['day', 'week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      period === p && !useCustomRange ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: period === p && !useCustomRange ? branding.primaryColor : 'transparent'
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="text-sm text-gray-700 outline-none"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    min={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="text-sm text-gray-700 outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyRange}
                  disabled={!dateRange.startDate || !dateRange.endDate}
                  className="px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Apply
                </button>
                {useCustomRange && (
                  <button
                    onClick={handleClearRange}
                    className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {useCustomRange && (
              <p className="text-sm text-gray-500 mt-2">
                Showing results from <strong>{new Date(dateRange.startDate).toLocaleDateString()}</strong> to <strong>{new Date(dateRange.endDate).toLocaleDateString()}</strong>
              </p>
            )}
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
                      <span className="text-gray-600">Card / Transfer</span>
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
                        {formatCurrency(analytics.paidOrders > 0 ? analytics.totalRevenue / analytics.paidOrders : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Period</span>
                      <span className="font-semibold text-gray-900 capitalize">{analytics.period || period}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Daily Report — only shown on Day view */}
              {period === 'day' && !useCustomRange && analytics.dailyReport && (
                <div className="mt-6 space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Daily Report — {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Selling Items */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                        <h3 className="text-base font-semibold text-gray-900">Top Selling Items</h3>
                      </div>
                      {analytics.dailyReport.topItems.length === 0 ? (
                        <p className="text-sm text-gray-400">No orders yet today</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.dailyReport.topItems.map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">{item.quantity} sold</div>
                                <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Peak Hour + Hourly Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-5 h-5 text-red-500" />
                        <h3 className="text-base font-semibold text-gray-900">Busiest Hour</h3>
                      </div>
                      {analytics.dailyReport.peakHour ? (
                        <>
                          <div className="text-center mb-4">
                            <p className="text-3xl font-bold" style={{ color: branding.primaryColor }}>
                              {analytics.dailyReport.peakHour.hour === 0 ? '12AM'
                                : analytics.dailyReport.peakHour.hour < 12 ? `${analytics.dailyReport.peakHour.hour}AM`
                                : analytics.dailyReport.peakHour.hour === 12 ? '12PM'
                                : `${analytics.dailyReport.peakHour.hour - 12}PM`}
                            </p>
                            <p className="text-sm text-gray-500">{analytics.dailyReport.peakHour.orders} orders · {formatCurrency(analytics.dailyReport.peakHour.revenue)}</p>
                          </div>
                          {/* Mini bar chart — only hours with orders */}
                          <div className="space-y-1">
                            {analytics.dailyReport.hourlyBreakdown.filter(h => h.orders > 0).map(h => {
                              const maxOrders = analytics.dailyReport.peakHour.orders;
                              const pct = Math.round((h.orders / maxOrders) * 100);
                              const label = h.hour === 0 ? '12AM' : h.hour < 12 ? `${h.hour}AM` : h.hour === 12 ? '12PM' : `${h.hour - 12}PM`;
                              return (
                                <div key={h.hour} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-8">{label}</span>
                                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: branding.primaryColor }}></div>
                                  </div>
                                  <span className="text-xs text-gray-600 w-4">{h.orders}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">No paid orders yet today</p>
                      )}
                    </div>

                    {/* Outstanding Payments */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-base font-semibold text-gray-900">Outstanding Payments</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Unpaid orders</span>
                          <div className="text-right">
                            <div className="font-semibold text-red-600">{analytics.dailyReport.outstanding.unpaidCount}</div>
                            <div className="text-xs text-gray-500">{formatCurrency(analytics.dailyReport.outstanding.unpaidAmount)}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Partial payments</span>
                          <div className="text-right">
                            <div className="font-semibold text-yellow-600">{analytics.dailyReport.outstanding.partialCount}</div>
                            <div className="text-xs text-gray-500">{formatCurrency(analytics.dailyReport.outstanding.partialAmount)}</div>
                          </div>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Total outstanding</span>
                          <span className="font-bold text-red-600">{formatCurrency(analytics.dailyReport.outstanding.totalOutstanding)}</span>
                        </div>
                        {analytics.dailyReport.outstanding.totalOutstanding === 0 && (
                          <p className="text-sm text-green-600 font-medium text-center pt-1">✓ All orders settled</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;