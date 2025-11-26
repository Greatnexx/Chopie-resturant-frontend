import { useState, useEffect } from "react";
import { useGetRestaurantOrdersQuery, useAcceptOrderMutation, useRejectOrderMutation, useUpdateOrderStatusMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { Bell, Clock, CheckCircle, ChefHat, User, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import RestaurantSidebar from "../components/RestaurantSidebar";
import OrderNotification from "../components/OrderNotification";
import OrderActionButtons from "../components/OrderActionButtons";

const RestaurantDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [showNotification, setShowNotification] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const navigate = useNavigate();
  
  const { data: ordersData, isLoading: ordersLoading, refetch } = useGetRestaurantOrdersQuery(undefined, { skip: !user });
  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder] = useRejectOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    const userData = sessionStorage.getItem("restaurantUser");
    if (!userData) {
      navigate("/restaurant/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Only create Socket.IO connection for order management if user can accept orders
    if (parsedUser.role === 'SuperAdmin' || parsedUser.role === 'MenuManager') {
      const socketUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
      console.log('🔌 RestaurantDashboard connecting to Socket.IO server:', socketUrl, 'User:', parsedUser.name, 'Role:', parsedUser.role);
      
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      socket.on('connect', () => {
        console.log('✅ RestaurantDashboard Socket.IO connected successfully:', socket.id, 'for user:', parsedUser.name);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('❌ RestaurantDashboard Socket.IO disconnected:', reason);
        if (reason === 'io server disconnect') {
          socket.connect()
        }
      });
      
      socket.on('connect_error', (error) => {
        console.error('🚨 RestaurantDashboard Socket.IO connection error:', error);
      });
      
      socket.on('newOrder', (orderData) => {
        console.log('📦 RestaurantDashboard received new order for', parsedUser.role, ':', orderData);
        setNotifications(prev => [...prev, { ...orderData, type: 'new', timestamp: Date.now() }]);
        setShowNotification(orderData);
        refetch();
      });

      socket.on('orderAccepted', (data) => {
        console.log('✅ Order accepted:', data);
        setNotifications(prev => prev.filter(n => n.orderId !== data.orderId));
        if (showNotification?.orderId === data.orderId) {
          setShowNotification(null);
        }
        refetch();
      });

      socket.on('orderRejected', (data) => {
        console.log('❌ Order rejected:', data);
        refetch();
      });
      
      socket.on('orderStatusUpdated', (data) => {
        console.log('🔄 Order status updated:', data);
        refetch();
      });

      socket.on('orderAccepted', (data) => {
        console.log('✅ Order accepted:', data);
        setNotifications(prev => prev.filter(n => n.orderId !== data.orderId));
        if (showNotification?.orderId === data.orderId) {
          setShowNotification(null);
        }
        refetch();
      });

      socket.on('orderRejected', (data) => {
        console.log('❌ Order rejected:', data);
        refetch();
      });
      
      socket.on('orderStatusUpdated', (data) => {
        console.log('🔄 Order status updated:', data);
        refetch();
      });

      return () => {
        console.log('🔌 RestaurantDashboard disconnecting Socket.IO for user:', parsedUser.name);
        socket.disconnect();
      };
    }
  }, [navigate, refetch]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId).unwrap();
      toast.success("Order accepted!");
      setNotifications(prev => prev.filter(n => n.orderId !== orderId));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to accept order");
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await rejectOrder(orderId).unwrap();
      toast.info("Order rejected");
      setNotifications(prev => prev.filter(n => n.orderId !== orderId));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reject order");
    }
  };

  const handleUpdateStatus = async (orderId) => {
    setLoadingOrderId(orderId);
    try {
      await updateOrderStatus(orderId).unwrap();
      toast.success("Order status updated!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    } finally {
      setLoadingOrderId(null);
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

  // SuperAdmins can access both Dashboard and Analytics pages

  const orders = ordersData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar user={user} onLogout={confirmLogout} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications now handled by sidebar */}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Orders</h2>
          <p className="text-gray-600">Manage incoming orders and track progress</p>
        </div>

        {ordersLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
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
                      {order.customerName} • Table {order.tableNumber}
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
                        <span className="font-medium">${item.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-lg font-bold">
                    Total: ${order.totalAmount?.toFixed(2) || '0.00'}
                  </div>
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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default RestaurantDashboard;