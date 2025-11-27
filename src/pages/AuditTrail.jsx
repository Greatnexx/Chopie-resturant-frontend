import { useState } from "react";
import { useGetAuditLogsQuery } from "../slices/restaurantSlice";
import { FileText, User, Clock, Menu } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";

const AuditTrail = () => {
  const { data: auditData, isLoading } = useGetAuditLogsQuery();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
  const logs = auditData?.data || [];

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN": return "bg-green-100 text-green-800";
      case "CREATE_USER": return "bg-blue-100 text-blue-800";
      case "ACCEPT_ORDER": return "bg-yellow-100 text-yellow-800";
      case "UPDATE_STATUS": return "bg-purple-100 text-purple-800";
      case "TOGGLE_USER_STATUS": return "bg-red-100 text-red-800";
      case "AWARD_STAR": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <RestaurantSidebar 
          user={user} 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Audit Trail</h1>
                <p className="text-gray-600 text-sm lg:text-base">Track all system activities and user actions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold">System Activities</h2>
              </div>
            </div>

            <div className="p-6">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 text-sm lg:text-base">
                              {log.userId?.name || "Unknown User"}
                            </span>
                            <span className="text-xs lg:text-sm text-gray-500">
                              ({log.userId?.role})
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2 text-sm lg:text-base">{log.details}</p>
                          
                          {log.orderId && (
                            <p className="text-xs lg:text-sm text-blue-600">
                              Order: #{log.orderId.orderNumber}
                            </p>
                          )}
                          
                          {log.ipAddress && (
                            <p className="text-xs text-gray-500">
                              IP: {log.ipAddress}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;