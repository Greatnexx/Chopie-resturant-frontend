import { useState } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  MapPin,
  Phone,
  Mail,
  RefreshCcwDot,
  MessageCircle,
} from "lucide-react";
import { useSearchOrderQuery } from "../slices/orderSlice";
import LoadingBtn from "../components/LoadingBtn";
import SimpleLiveChat from "../components/SimpleLiveChat";

const TrackOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // RTK Query hook - skip until search is triggered
  const { data: trackingData, isLoading: isSearching, error: trackingError, refetch } = useSearchOrderQuery(
    searchTerm.trim(),
    { skip: !searchTriggered || !searchTerm.trim() }
  );

  // Extract search result and error from RTK Query response
  const searchResult = trackingData?.status ? trackingData.data : null;

  // Handle different types of errors
  const getErrorMessage = () => {
    if (!searchTerm.trim() && isSearching) {
      return "Please enter an order number, email, or phone number";
    }
    if (trackingError) {
      if (trackingError.status === 404) {
        return (
          trackingError?.data?.message ||
          "Order not found. Please check your order number, email, or phone number and try again."
        );
      }
      return (
        trackingError?.data?.message ||
        "Unable to connect to server. Please try again later."
      );
    }
    return "";
  };

  const error = getErrorMessage();

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "Preparing":
        return <ChefHat className="w-6 h-6 text-orange-500" />;
      case "completed":
        return <Truck className="w-6 h-6 text-green-600" />;
      case "cancelled":
        return <Package className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-green-100 text-green-800 border-green-200";
      case "Preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSearchTriggered(true);
    }
  };

  const handleRefresh = async () => {
    if (!searchTerm.trim() || !refetch) return;
    setIsRefreshing(true);

    try {
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

 

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your order number, email address, or phone number to track your order status.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Order Number, Email, or Phone
            </label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter order number, email, or phone"
                  className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={isSearching}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-600 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Track Order
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {searchResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Order found! See details below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Order #{searchResult.orderNumber}
                    </h2>
                    <p className="opacity-90 mt-1">
                      Placed at {searchResult.orderTime}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full border-2 border-white/30 backdrop-blur-sm ${getStatusColor(
                      searchResult.status
                    )} bg-white/20 text-white border-white/50`}
                  >
                    <span className="font-semibold capitalize">
                      {searchResult.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-gray-600">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {searchResult.customerInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">Table:</span>{" "}
                        {searchResult.customerInfo.table}
                      </p>
                      {searchResult.customerInfo.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {searchResult.customerInfo.phone}
                        </p>
                      )}
                      {searchResult.customerInfo.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {searchResult.customerInfo.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {searchResult.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-700">{item}</span>
                        </div>
                      )) || (
                        <p className="text-gray-500 italic">No items found</p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">
                        Total: ₦{searchResult.total}
                      </span>
                      <span className="text-blue-600 font-medium">
                        {searchResult.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">
                Order Timeline
              </h3>
              <div className="space-y-8">
                {searchResult.statusHistory?.map((step, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div
                      className={`flex-shrink-0 ${
                        step.completed ? "" : "opacity-30"
                      }`}
                    >
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-semibold text-lg capitalize ${
                            step.completed ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {step.status === "pending"
                            ? "Order Confirmed"
                            : step.status === "Preparing"
                            ? "Being Prepared"
                            : step.status === "completed"
                            ? "Order Completed"
                            : step.status}
                        </h4>
                        <span
                          className={`text-sm font-medium ${
                            step.completed ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {step.time || "Pending"}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          step.completed ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                      {index < searchResult.statusHistory.length - 1 && (
                        <div
                          className={`w-px h-12 ml-3 mt-4 ${
                            step.completed ? "bg-gray-300" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 italic">
                    No status history available
                  </p>
                )}
              </div>
            </div>
            {/* Action Buttons */}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className=" sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 text-white rounded-lg focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCcwDot className="w-5 h-5 animate-spin-slow" />
                      Refresh Status
                    </>
                  )}
                </button>

                {/* <button
                  onClick={() => setOrderNumber("")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Track Another Order
                </button> */}
              </div>
            </div>
            {/* Support Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about your order, our support team
                  is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+2348012345678"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                  <button
                    onClick={() => setShowChat(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Live Chat */}
      <SimpleLiveChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        customerName={searchResult?.customerInfo?.name || `Customer-${searchTerm}`}
        customerEmail={searchResult?.customerInfo?.email || ''}
        orderNumber={searchResult?.orderNumber || searchTerm}
      />
    </div>
  );
};

export default TrackOrder;
