import { useState } from "react";
import { useLoginRestaurantMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ChefHat, Eye, EyeOff } from "lucide-react";
import { triggerBrandingRefresh } from "../Context/BrandingContext";

const RestaurantLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginRestaurant, { isLoading }] = useLoginRestaurantMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginRestaurant(formData).unwrap();
      // Store the entire result which includes the token
      sessionStorage.setItem("restaurantUser", JSON.stringify(result));
      // Trigger branding refresh to load restaurant's custom branding
      triggerBrandingRefresh();
      toast.success("Login successful!");
      navigate("/restaurant/dashboard");
    } catch (error) {
      toast.error(error?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Restaurant Login</h1>
          <p className="text-gray-600">Access your restaurant dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-200 disabled:opacity-50 font-medium"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-right">
            <Link to="/restaurant/forgot-password" className="text-sm text-red-500 hover:text-red-600">
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/restaurant/register" className="text-red-500 hover:text-red-600 font-medium">
              Register your restaurant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLogin;