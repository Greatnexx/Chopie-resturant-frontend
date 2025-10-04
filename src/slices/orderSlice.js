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
      query: (orderNumber) => `/order/${orderNumber}/track`,
    }),
    getAllOrders: builder.query({
      query: () => "/order",
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useTrackOrderQuery,
  useGetAllOrdersQuery,
} = orderApiSlice;