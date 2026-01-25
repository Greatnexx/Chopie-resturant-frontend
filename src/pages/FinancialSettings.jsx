import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, CreditCard, Percent, Receipt, Save } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useBranding } from "../Context/BrandingContext";
import { toast } from "sonner";

const FinancialSettings = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    paymentMethods: { cash: true, transfer: true },
    taxRate: 0,
    currency: 'NGN',
    receiptSettings: {
      showTax: true,
      showServiceCharge: false,
      footerText: 'Thank you for dining with us!'
    }
  });
  const navigate = useNavigate();
  const { branding } = useBranding();

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

    fetchFinancialSettings();
  }, [navigate]);

  const fetchFinancialSettings = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
      const token = userData.data?.token || userData.token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/financial-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status) {
        setSettings(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch financial settings');
      }
    } catch (error) {
      toast.error('Error fetching financial settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethods = async () => {
    try {
      setSaving(true);
      const userData = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
      const token = userData.data?.token || userData.token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/payment-methods`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.paymentMethods)
      });

      const data = await response.json();
      if (data.status) {
        toast.success('Payment methods updated successfully');
      } else {
        toast.error(data.message || 'Failed to update payment methods');
      }
    } catch (error) {
      toast.error('Error updating payment methods');
    } finally {
      setSaving(false);
    }
  };

  const updateTaxRate = async () => {
    try {
      setSaving(true);
      const userData = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
      const token = userData.data?.token || userData.token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/tax-rate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taxRate: settings.taxRate })
      });

      const data = await response.json();
      if (data.status) {
        toast.success('Tax rate updated successfully');
      } else {
        toast.error(data.message || 'Failed to update tax rate');
      }
    } catch (error) {
      toast.error('Error updating tax rate');
    } finally {
      setSaving(false);
    }
  };

  const updateReceiptSettings = async () => {
    try {
      setSaving(true);
      const userData = JSON.parse(sessionStorage.getItem("restaurantUser") || "{}");
      const token = userData.data?.token || userData.token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/receipt-settings`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.receiptSettings)
      });

      const data = await response.json();
      if (data.status) {
        toast.success('Receipt settings updated successfully');
      } else {
        toast.error(data.message || 'Failed to update receipt settings');
      }
    } catch (error) {
      toast.error('Error updating receipt settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: branding.primaryColor }}></div>
          <p className="text-gray-500">Loading financial settings...</p>
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
        <div className="max-w-4xl mx-auto">
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Financial Settings</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage payment methods, tax rates, and receipt settings</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6" style={{ color: branding.primaryColor }} />
                <h2 className="text-xl font-semibold">Payment Methods</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cash Payments</h3>
                    <p className="text-sm text-gray-500">Allow customers to pay with cash</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.cash}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentMethods: { ...settings.paymentMethods, cash: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Bank Transfer</h3>
                    <p className="text-sm text-gray-500">Allow customers to pay via bank transfer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.transfer}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentMethods: { ...settings.paymentMethods, transfer: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <button
                  onClick={updatePaymentMethods}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Payment Methods'}
                </button>
              </div>
            </div>

            {/* Tax Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Percent className="w-6 h-6" style={{ color: branding.primaryColor }} />
                <h2 className="text-xl font-semibold">Tax Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:border-gray-400"
                    placeholder="Enter tax rate (e.g., 7.5)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter the tax rate as a percentage (0-100)</p>
                </div>
                <button
                  onClick={updateTaxRate}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Tax Rate'}
                </button>
              </div>
            </div>

            {/* Receipt Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-6 h-6" style={{ color: branding.primaryColor }} />
                <h2 className="text-xl font-semibold">Receipt Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Tax on Receipt</h3>
                    <p className="text-sm text-gray-500">Display tax breakdown on customer receipts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.receiptSettings.showTax}
                      onChange={(e) => setSettings({
                        ...settings,
                        receiptSettings: { ...settings.receiptSettings, showTax: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Service Charge</h3>
                    <p className="text-sm text-gray-500">Display service charge on receipts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.receiptSettings.showServiceCharge}
                      onChange={(e) => setSettings({
                        ...settings,
                        receiptSettings: { ...settings.receiptSettings, showServiceCharge: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer Text</label>
                  <textarea
                    value={settings.receiptSettings.footerText}
                    onChange={(e) => setSettings({
                      ...settings,
                      receiptSettings: { ...settings.receiptSettings, footerText: e.target.value }
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:border-gray-400"
                    rows="3"
                    placeholder="Thank you for dining with us!"
                  />
                </div>
                <button
                  onClick={updateReceiptSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Receipt Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;