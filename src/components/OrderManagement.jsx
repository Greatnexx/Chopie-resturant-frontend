import { useState } from "react";
import { useGetAllOrdersQuery } from "../slices/orderSlice";
import { useUpdatePaymentStatusMutation } from "../slices/restaurantSlice";
import { Clock, CheckCircle, ChefHat, XCircle, ArrowLeft, User, Receipt } from "lucide-react";
import { downloadReceipt } from "../utils/printReceipt";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";

const OrderManagement = () => {
  const { data: ordersData, isLoading, error, refetch } = useGetAllOrdersQuery();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();
  const [filter, setFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const navigate = useNavigate();
  const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser') || '{}');
  const restaurantName = restaurantUser?.data?.restaurantName || restaurantUser?.restaurantName || 'Restaurant';

  const orders = ordersData?.data || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "accepted": return <User className="w-5 h-5 text-blue-500" />;
      case "Preparing": return <ChefHat className="w-5 h-5 text-orange-500" />;
      case "served": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "served": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid": return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Paid</span>;
      case "partial": return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Partial</span>;
      default: return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">Unpaid</span>;
    }
  };

  const handleConfirmPayment = async ({ orderId, paymentStatus, cash, transfer }) => {
    setPaymentLoading(true);
    try {
      await updatePaymentStatus({ orderId, paymentStatus, cash, transfer }).unwrap();
      toast.success(`Payment marked as ${paymentStatus}`);
      setPaymentOrder(null);
    } catch {
      toast.error('Failed to update payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMarkAllPaid = async () => {
    const unpaidOrders = filteredOrders.filter(order => {
      const status = order.orderStatus || order.status;
      return ['served', 'completed'].includes(status) && order.paymentStatus !== 'paid';
    });

    if (unpaidOrders.length === 0) {
      toast.info('No unpaid orders to settle');
      return;
    }

    setBulkLoading(true);
    let successCount = 0;
    for (const order of unpaidOrders) {
      try {
        await updatePaymentStatus({ orderId: order._id, paymentStatus: 'paid', cash: order.totalAmount, transfer: 0 }).unwrap();
        successCount++;
      } catch {
        toast.error(`Failed to mark Order #${order.orderNumber} as paid`);
      }
    }
    if (successCount > 0) toast.success(`${successCount} order${successCount > 1 ? 's' : ''} marked as paid`);
    setBulkLoading(false);
  };

  const isFilterActive = tableFilter || customerFilter;

  const filteredOrders = orders.filter(order => {
    const effectiveStatus = order.orderStatus || order.status;
    const matchesStatus = filter === "all" || effectiveStatus === filter;
    const matchesTable = !tableFilter || (order.tableNumber || '').toLowerCase().includes(tableFilter.toLowerCase());
    const matchesCustomer = !customerFilter || (order.customerName || '').toLowerCase().includes(customerFilter.toLowerCase());
    return matchesStatus && matchesTable && matchesCustomer;
  });

  const grandTotal = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const unpaidCount = filteredOrders.filter(o => {
    const status = o.orderStatus || o.status;
    return ['served', 'completed'].includes(status) && o.paymentStatus !== 'paid';
  }).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading orders: {error.message}</p>
        <button 
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Management</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            placeholder="Filter by table (e.g. Table 5)"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 w-52"
          />
          <input
            type="text"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            placeholder="Filter by customer name"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 w-52"
          />
        </div>

        {/* Grand Total Summary Bar */}
        {isFilterActive && (
          <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-5 py-4 mb-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Orders</p>
                <p className="text-lg font-bold">{filteredOrders.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Grand Total</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(grandTotal)}</p>
              </div>
              {unpaidCount > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Unpaid</p>
                  <p className="text-lg font-bold text-red-400">{unpaidCount}</p>
                </div>
              )}
            </div>
            {unpaidCount > 0 && (
              <button
                onClick={handleMarkAllPaid}
                disabled={bulkLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? 'Processing...' : `Mark All Paid (${unpaidCount})`}
              </button>
            )}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "pending", "accepted", "Preparing", "served", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-gray-600">
                    {order.customerName} • Table {order.tableNumber} • {order.paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date not available'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(order.orderStatus || order.status)}`}>
                    {getStatusIcon(order.orderStatus || order.status)}
                    <span className="font-medium capitalize">{order.orderStatus || order.status}</span>
                  </div>
                  {getPaymentBadge(order.paymentStatus || 'unpaid')}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600"> × {item.quantity}</span>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  )}
                  {order.splitPayment && (order.splitPayment.cash > 0 || order.splitPayment.transfer > 0) && (
                    <p className="text-sm text-gray-500">
                      Paid: 💵 {formatCurrency(order.splitPayment.cash)} + 🏦 {formatCurrency(order.splitPayment.transfer)}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-xl font-bold text-gray-800">
                    Total: {formatCurrency(order.totalAmount)}
                  </p>
                  {['served', 'completed'].includes(order.orderStatus || order.status) && order.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => setPaymentOrder(order)}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => downloadReceipt(order, restaurantName)}
                    className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 flex items-center gap-1"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaymentModal
        order={paymentOrder}
        onConfirm={handleConfirmPayment}
        onClose={() => setPaymentOrder(null)}
        isLoading={paymentLoading}
      />
    </div>
  );
};

export default OrderManagement;