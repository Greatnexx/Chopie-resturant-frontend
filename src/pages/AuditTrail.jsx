import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useBranding } from "../Context/BrandingContext";
import { toast } from "sonner";

const AuditTrail = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const { branding } = useBranding();
  const recordsPerPage = 20;

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

    fetchAuditTrail(1);
  }, [navigate]);

  const fetchAuditTrail = async (page = 1) => {
    try {
      setLoading(true);
      const userData = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
      const token = userData.data?.token || userData.token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/audit-trail?page=${page}&limit=${recordsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status) {
        setAuditData(data.data);
        setCurrentPage(page);
        // Handle the pagination object format
        const total = data.pagination?.total || data.total || data.data.length;
        setTotalPages(data.pagination?.totalPages || Math.ceil(total / recordsPerPage));
        setTotalRecords(total);
      } else {
        toast.error(data.message || 'Failed to fetch audit trail');
      }
    } catch (error) {
      toast.error('Error fetching audit trail');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAuditTrail(newPage);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'text-green-600 bg-green-100';
    if (action.includes('DELETE')) return 'text-red-600 bg-red-100';
    if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-100';
    if (action.includes('CREATE')) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                <p className="text-gray-600">Recent system activities</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6" style={{ color: branding.primaryColor }} />
                <h2 className="text-xl font-semibold">Recent Activities</h2>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: branding.primaryColor }}></div>
                  <p className="text-gray-500">Loading activities...</p>
                </div>
              ) : auditData.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditData.map((entry) => (
                    <div key={entry._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start ${getActionColor(entry.action)}`}>
                            {entry.action}
                          </span>
                          <div>
                            <p className="font-medium text-sm sm:text-base">{entry.userId?.name || 'Unknown User'}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{entry.userId?.role || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-gray-600">{formatDate(entry.createdAt)}</p>
                          <p className="text-xs text-gray-400">{entry.ipAddress || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {!loading && auditData.length > 0 && totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} entries
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage <= 2) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
                              currentPage === pageNum
                                ? 'text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            style={{
                              backgroundColor: currentPage === pageNum ? branding.primaryColor : 'transparent'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;