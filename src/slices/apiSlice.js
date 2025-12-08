import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

const getBaseUrl = () => {
  // Check for manual override in localStorage
  const useRemote = localStorage.getItem('USE_REMOTE_SERVER');
  
  if (useRemote === 'true') {
    return 'https://backend-chopie-project.onrender.com/api/v1';
  }
  
  // Check if running locally (localhost:3000 or localhost:5173)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api/v1';
  }
  
  const storedURL = localStorage.getItem('RENDER_URL');
  return import.meta.env.VITE_API_URL || storedURL || 'https://backend-chopie-project.onrender.com/api/v1';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  timeout: 60000, // 60 second timeout for Render cold starts
  prepareHeaders: (headers, { getState }) => {
    // Check for regular user token
    const userInfo = sessionStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        const token = parsedUserInfo?.data?.token;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("Error parsing sessionStorage userInfo:", error);
      }
    }

    // Check for restaurant user token
    const restaurantUser = sessionStorage.getItem("restaurantUser");
    if (restaurantUser) {
      try {
        const parsedRestaurantUser = JSON.parse(restaurantUser);
        const token = parsedRestaurantUser?.token;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("Error parsing sessionStorage restaurantUser:", error);
      }
    }

    // Also check for separate restaurant token
    const restaurantToken = sessionStorage.getItem("restaurantToken");
    if (restaurantToken && !headers.get("Authorization")) {
      headers.set("Authorization", `Bearer ${restaurantToken}`);
    }

    // ✅ Don't set Content-Type at all
    // fetchBaseQuery will automatically:
    // - Set 'application/json' for plain objects
    // - Leave it unset for FormData (browser adds multipart/form-data with boundary)
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Log errors for debugging
  if (result.error) {
    console.log('API Error:', {
      status: result.error.status,
      data: result.error.data,
      url: args.url || args,
      method: args.method || 'GET'
    });
  }

  if (result.error && result.error.status === 401) {
    // Retry the request once if unauthorized
    const retryResult = await baseQuery(args, api, extraOptions);

    if (retryResult.error && retryResult.error.status === 401) {
      // Handle second 401 (logout the user)
      toast.error("Unauthorized. Redirecting to login.");
      sessionStorage.removeItem("userInfo");
      sessionStorage.removeItem("expirationTime");
      sessionStorage.removeItem("restaurantUser");
      sessionStorage.removeItem("restaurantToken");
      // window.location.href = "/";
      return retryResult;
    }

    return retryResult;
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["base", "RestaurantOrders", "Users", "MenuItems", "Categories", "PaymentSummary"],
  endpoints: () => ({}),
});