import { apiSlice } from "./apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/order",
        method: "POST",
        body: orderData,
      }),
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