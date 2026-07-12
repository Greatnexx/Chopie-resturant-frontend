import { apiSlice } from "./apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => {
        const hostname = window.location.hostname;
        const baseDomain = 'chopie-resturant-frontend.vercel.app';
        let subdomain = null;

        if (hostname.endsWith('.' + baseDomain)) {
          subdomain = hostname.replace('.' + baseDomain, '');
        } else if (window.location.pathname.split('/')[1] === 'r') {
          subdomain = window.location.pathname.split('/')[2];
        }

        return {
          url: "/order",
          method: "POST",
          body: orderData,
          headers: subdomain ? { 'X-Tenant-Subdomain': subdomain } : {},
        };
      },
    }),
    trackOrder: builder.query({
      query: (orderParam) => {
        // Support both old format (orderNumber) and new format (restaurantId/orderNumber)
        if (orderParam.includes('/')) {
          const [restaurantId, orderNumber] = orderParam.split('/');
          return `/order/${orderNumber}/track?restaurantId=${restaurantId}`;
        }
        return `/order/${orderParam}/track`;
      },
    }),
    searchOrder: builder.query({
      query: (searchParam) => {
        // Support both old format (searchTerm) and new format (restaurantId/searchTerm)
        if (searchParam.includes('/')) {
          const [restaurantId, searchTerm] = searchParam.split('/');
          return `/order/search/${searchTerm}?restaurantId=${restaurantId}`;
        }
        return `/order/search/${searchParam}`;
      },
    }),
    getAllOrders: builder.query({
      query: () => "/order",
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useTrackOrderQuery,
  useSearchOrderQuery,
  useGetAllOrdersQuery,
} = orderApiSlice;