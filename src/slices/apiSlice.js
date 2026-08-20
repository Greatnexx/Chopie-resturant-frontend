import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

const getBaseUrl = () => {
  // Always use localhost when running locally
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
        // Token is at data.token in the response
        const token = parsedRestaurantUser?.data?.token;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          
        } else {
        }
        
        // Also set restaurant ID header if available
        const restaurantId = parsedRestaurantUser?.data?.user?.restaurantId || parsedRestaurantUser?.data?.restaurantId;
        if (restaurantId) {
          headers.set("X-Restaurant-ID", restaurantId);
        }
      } catch (error) {
        console.error("Error parsing sessionStorage restaurantUser:", error);
      }
    } else {
    }

    // Also check for separate restaurant token
    const restaurantToken = sessionStorage.getItem("restaurantToken");
    if (restaurantToken && !headers.get("Authorization")) {
      headers.set("Authorization", `Bearer ${restaurantToken}`);
    }

    // Extract subdomain from hostname (mama.localhost, mama.chopie.ng)
    // or from URL path (/r/mama)
    const hostname = window.location.hostname;
    const hostParts = hostname.split('.');
    const isChopieNg = hostname.endsWith('chopie.ng') && hostParts.length >= 3;
    const isLocalSubdomain = hostname.includes('localhost') && hostParts.length > 1 && hostParts[0] !== 'localhost';

    if (isChopieNg || isLocalSubdomain) {
      const subdomain = hostname.replace('.chopie.ng', '').split('.')[0];
      headers.set("X-Tenant-Subdomain", subdomain);
    } else {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/r/')) {
        const subdomain = currentPath.split('/')[2];
        if (subdomain) headers.set("X-Tenant-Subdomain", subdomain);
      }
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
  tagTypes: ["base", "RestaurantOrders", "Users", "MenuItems", "Categories", "PaymentSummary", "RestaurantPublicInfo"],
  endpoints: (builder) => ({
    getRestaurantPublicInfo: builder.query({
      query: (subdomain) => `/restaurant/public/${subdomain}`,
      providesTags: ["RestaurantPublicInfo"],
    }),
  }),
});
export const {
  useGetRestaurantPublicInfoQuery,
} = apiSlice;