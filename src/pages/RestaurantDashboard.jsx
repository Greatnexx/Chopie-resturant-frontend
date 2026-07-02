import { useState, useEffect } from "react";
import { useGetRestaurantOrdersQuery, useAcceptOrderMutation, useRejectOrderMutation, useUpdateOrderStatusMutation, useGetAnalyticsQuery, useCancelOrderMutationMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { Bell, Clock, CheckCircle, ChefHat, User, X, Check, Menu } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate, useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import RestaurantSidebar from "../components/RestaurantSidebar";
import OrderNotification from "../components/OrderNotification";
import OrderActionButtons from "../components/OrderActionButtons";
import PasswordChangeModal from "../components/PasswordChangeModal";
import ChatRequestModal from "../components/ChatRequestModal";
import StaffChatPanel from "../components/StaffChatPanel";
import { useBranding } from "../Context/BrandingContext";

const RestaurantDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [showNotification, setShowNotification] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChatRequest, setShowChatRequest] = useState(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { branding } = useBranding();
  
  const { data: ordersData, isLoading: ordersLoading, refetch } = useGetRestaurantOrdersQuery(undefined, { skip: !user });
  const { data: analyticsData } = useGetAnalyticsQuery('day', { skip: !user || user?.role !== 'TransactionAdmin' });
  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder] = useRejectOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [cancelOrderMutation] = useCancelOrderMutationMutation();

  const analytics = analyticsData?.data || {};

  // Check if chat should be auto-opened from URL parameter
  useEffect(() => {
    if (searchParams.get('showChat') === 'true') {
      setShowChatPanel(true);
      // Clean up URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const userData = sessionStorage.getItem("restaurantUser");
    if (!userData) {
      navigate("/restaurant/login");
      return;
    }
    const parsedData = JSON.parse(userData);
    // Extract user data from the login response structure
    const user = parsedData.data || parsedData;
    setUser(user);
    
    // Check if user needs to change password
    if (user.isFirstLogin) {
      setShowPasswordModal(true);
    }

    // Only create Socket.IO connection for order management if user can accept orders
    if (user.role === 'SuperAdmin' || user.role === 'MenuManager') {
      const socketUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      socket.on('connect', () => {
      });
      
      socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          socket.connect()
        }
      });
      
      socket.on('connect_error', (error) => {
        console.error('🚨 RestaurantDashboard Socket.IO connection error:', error);
      });
      
      socket.on('newOrder', (orderData) => {
        setNotifications(prev => [...prev, { ...orderData, type: 'new', timestamp: Date.now() }]);
        setShowNotification(orderData);
        refetch();
      });

      // Listen for new chat requests - FIXED: Direct handling in dashboard
      socket.on('newChatAvailable', (chatData) => {
        setShowChatRequest(chatData);
        setShowChatPanel(true); // Auto-show chat panel
        toast.info(`New chat request from ${chatData.customerName}`);
      });
      
      // Listen for chat accepted events to clear the request modal
      socket.on('chatAccepted', (data) => {
        if (showChatRequest && data.chatId === showChatRequest.chatId) {
          setShowChatRequest(null);
        }
      });
      
      // Also listen for new messages to show notifications
      socket.on('receiveMessage', (data) => {
        const { chatId, message } = data;
        if (message.senderType === 'customer') {
          toast.success(`New message from ${message.sender}`);
        }
      });
      
      // Test if socket is receiving any events
      socket.onAny((eventName, ...args) => {
      });
      
      // Test connection
      socket.emit('test', 'Dashboard connected');

      socket.on('orderAccepted', (data) => {
        setNotifications(prev => prev.filter(n => n.orderId !== data.orderId));
        if (showNotification?.orderId === data.orderId) {
          setShowNotification(null);
        }
        // Remove refetch() - RTK Query will handle cache invalidation
      });

      socket.on('orderRejected', (data) => {
        // Remove refetch() - RTK Query will handle cache invalidation
      });
      
      socket.on('orderStatusUpdated', (data) => {
        // Remove refetch() - RTK Query will handle cache invalidation
      });

      return () => {
        socket.off('newOrder');
        socket.off('newChatAvailable');
        socket.off('chatAccepted');
        socket.off('receiveMessage');
        socket.off('orderAccepted');
        socket.off('orderRejected');
        socket.off('orderStatusUpdated');
        socket.disconnect();
      };
    }
  }, [navigate, refetch]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId).unwrap();
      toast.success("Order accepted!");
      setNotifications(prev => prev.filter(n => n.orderId !== orderId));
      // Remove refetch() - RTK Query invalidatesTags will handle cache update
    } catch (error) {
      toast.error(error?.data?.message || "Failed to accept order");
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await rejectOrder(orderId).unwrap();
      toast.info("Order rejected");
      setNotifications(prev => prev.filter(n => n.orderId !== orderId));
      // Remove refetch() - RTK Query invalidatesTags will handle cache update
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reject order");
    }
  };

  const handleUpdateStatus = async (orderId) => {
    setLoadingOrderId(orderId);
    try {
      await updateOrderStatus(orderId).unwrap();
      toast.success("Order status updated!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      await cancelOrderMutation({ orderId, reason }).unwrap();
      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "accepted": return <User className="w-5 h-5 text-blue-500" />;
      case "Preparing": return <ChefHat className="w-5 h-5 text-orange-500" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case "pending": return "Accept Order";
      case "accepted": return "Start Preparing";
      case "Preparing": return "Mark Complete";
      default: return null;
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    // Clear session and redirect to login page
    sessionStorage.removeItem("restaurantUser");
    toast.success("Password changed successfully! Please login with your new password.");
    navigate("/restaurant/login");
  };

  const handleAcceptChat = async (chatRequest) => {
    try {
      const restaurantUser = JSON.parse(
        sessionStorage.getItem("restaurantUser") || "{}"
      );
      const token = restaurantUser.data?.token || restaurantUser.token;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/${chatRequest.chatId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            staffId: user._id || user.id
          })
        }
      );
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast.success('Chat accepted!');
        setShowChatRequest(null);
        setShowChatPanel(true);
      } else {
        toast.error(responseData.message || 'Failed to accept chat');
      }
    } catch (error) {
      toast.error('Failed to accept chat');
    }
  };

  const handleDeclineChat = () => {
    setShowChatRequest(null);
  };

  const handleNewChatNotification = (chatData) => {
    // Auto-show chat panel when new chat arrives
    setShowChatPanel(true);
    // Also show the chat request modal
    setShowChatRequest(chatData);
  };

  // SuperAdmins can access both Dashboard and Analytics pages

  const orders = ordersData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar 
        user={user} 
        onLogout={confirmLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onChatToggle={() => setShowChatPanel(!showChatPanel)}
        showChatPanel={showChatPanel}
        onNewChat={handleNewChatNotification}
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm lg:text-base">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>
        {/* Transaction Admin Dashboard */}
        {user?.role === 'TransactionAdmin' && (
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                    <svg className="w-6 h-6" style={{ color: branding.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">{formatCurrency(analytics.totalRevenue || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                    <svg className="w-6 h-6" style={{ color: branding.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cash Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.paymentMethods?.cash?.count || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                    <svg className="w-6 h-6" style={{ color: branding.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Transfer Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.paymentMethods?.transfer?.count || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full" style={{ backgroundColor: branding.primaryColor + '20' }}>
                    <svg className="w-6 h-6" style={{ color: branding.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate('/restaurant/audit-trail')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
                >
                  <div className="w-8 h-8 mx-auto mb-2" style={{ color: branding.primaryColor }}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900">View Audit Trail</p>
                  <p className="text-sm text-gray-500">Track all system activities</p>
                </button>
                
                <button 
                  onClick={() => navigate('/restaurant/financial-settings')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
                >
                  <div className="w-8 h-8 mx-auto mb-2" style={{ color: branding.primaryColor }}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900">Financial Settings</p>
                  <p className="text-sm text-gray-500">Manage payment methods & tax</p>
                </button>
                
                <button 
                  onClick={() => navigate('/restaurant/reports')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
                >
                  <div className="w-8 h-8 mx-auto mb-2" style={{ color: branding.primaryColor }}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900">Financial Reports</p>
                  <p className="text-sm text-gray-500">Generate revenue reports</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Financial Activity</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Financial activities will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Regular Dashboard Content for other roles */}
        {user?.role !== 'TransactionAdmin' && user?.role !== 'MenuManager' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Setup</h2>
          <p className="text-gray-600 mb-6">Get your restaurant ready to receive orders</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="font-semibold text-gray-900">Upload Logo</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Add your restaurant logo and brand colors</p>
              <button 
                onClick={() => navigate('/restaurant/settings')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Go to Settings
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="font-semibold text-gray-900">Create Menu</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Add categories and menu items</p>
              <button 
                onClick={() => navigate('/restaurant/menu-manager')}
                className="w-full text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Manage Menu
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">3</span>
                </div>
                <h3 className="font-semibold text-gray-900">Add Staff</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Create accounts for your team members</p>
              <button 
                onClick={() => navigate('/restauracnt/users')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Manage Users
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">4</span>
                </div>
                <h3 className="font-semibold text-gray-900">Set Hours</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Configure your operating hours</p>
              <button 
                onClick={() => navigate('/restaurant/settings')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Set Hours
              </button>
            </div>
          </div>
        </div>
        )}
        {/* Chat Panel Toggle */}
        {(user?.role === 'SuperAdmin' || user?.role === 'MenuManager') && (
          <div className="mb-6">
            <button
              onClick={() => setShowChatPanel(!showChatPanel)}
              className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: showChatPanel ? branding.primaryColor : '#6b7280' }}
            >
              {showChatPanel ? 'Hide Chat Panel' : 'Show Chat Panel'}
            </button>
          </div>
        )}

        {/* Chat Panel */}
        {showChatPanel && (user?.role === 'SuperAdmin' || user?.role === 'MenuManager') && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Support Chat</h2>
              <p className="text-gray-600">Manage customer chat requests and conversations</p>
            </div>
            <StaffChatPanel user={user} />
          </div>
        )}
        
        {/* Orders section - only for non-TransactionAdmin roles */}
        {user?.role !== 'TransactionAdmin' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Orders</h2>
              <p className="text-gray-600">Manage incoming orders and track progress</p>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: branding.primaryColor }}></div>
                <p className="text-gray-500 text-lg">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-gray-600">
                          {order.customerName} • Table {order.tableNumber} • {order.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.createdAt && typeof order.createdAt === 'string' ? 
                            new Date(order.createdAt).toLocaleString() : 
                            'Date not available'
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium capitalize">{order.status}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-gray-600"> × {item.quantity}</span>
                              {item.specialInstructions && (
                                <p className="text-sm text-orange-600 mt-1">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                            </div>
                            <span className="font-medium">{formatCurrency(item.totalPrice || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-bold">
                        Total: {formatCurrency(order.totalAmount || 0)}
                      </div>
                      <div className="flex gap-2">
                        {order.status === "pending" && !order.assignedTo ? (
                          <OrderActionButtons
                            orderId={order._id}
                            onAccept={handleAcceptOrder}
                            onReject={handleRejectOrder}
                          />
                        ) : getNextAction(order.status) ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id)}
                            disabled={loadingOrderId === order._id}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loadingOrderId === order._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                              </>
                            ) : (
                              getNextAction(order.status)
                            )}
                          </button>
                        ) : null}
                        
                        {/* Modify/Cancel buttons for accepted and preparing orders */}
                        {['accepted', 'Preparing'].includes(order.status) && (
                          <>
                            <button
                              onClick={() => window.open(`/restaurant/staff-orders?editOrder=${order._id}`, '_blank')}
                              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for cancellation:');
                                if (reason) handleCancelOrder(order._id, reason);
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Order Notification */}
      {showNotification && (
        <OrderNotification
          order={showNotification}
          onClose={() => setShowNotification(null)}
          onAccept={(orderId) => {
            setNotifications(prev => prev.filter(n => n.orderId !== orderId));
            refetch();
          }}
          onReject={(orderId) => {
            setNotifications(prev => prev.filter(n => n.orderId !== orderId));
            refetch();
          }}
        />
      )}
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Request Modal */}
      {}
      <ChatRequestModal
        isOpen={!!showChatRequest}
        chatRequest={showChatRequest}
        onAccept={handleAcceptChat}
        onDecline={handleDeclineChat}
      />
      
      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showPasswordModal}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default RestaurantDashboard;