import { apiSlice } from "./apiSlice";

export const restaurantApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginRestaurant: builder.mutation({
      query: (credentials) => ({
        url: "/restaurant/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getRestaurantOrders: builder.query({
      query: () => "/restaurant/orders",
      providesTags: ["RestaurantOrders"],
    }),
    acceptOrder: builder.mutation({
      query: (orderId) => ({
        url: `/restaurant/orders/${orderId}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["RestaurantOrders"],
    }),
    rejectOrder: builder.mutation({
      query: (orderId) => ({
        url: `/restaurant/orders/${orderId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["RestaurantOrders"],
    }),
    updateOrderStatus: builder.mutation({
      query: (orderId) => ({
        url: `/restaurant/orders/${orderId}/status`,
        method: "PATCH",
      }),
      invalidatesTags: ["RestaurantOrders"],
    }),
    getRestaurantOrder: builder.query({
      query: (orderId) => `/restaurant/orders/${orderId}`,
    }),
    getAllUsers: builder.query({
      query: () => "/restaurant/users",
      providesTags: ["Users"],
    }),
    toggleUserStatus: builder.mutation({
      query: ({ userId, isActive }) => ({
        url: `/restaurant/users/${userId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Users"],
    }),
    awardStar: builder.mutation({
      query: (userId) => ({
        url: `/restaurant/users/${userId}/star`,
        method: "PATCH",
      }),
      invalidatesTags: ["Users"],
    }),
    getAnalytics: builder.query({
      query: (period = "day") => `/restaurant/analytics?period=${period}`,
    }),
    getAuditLogs: builder.query({
      query: () => "/restaurant/audit",
    }),
    searchOrders: builder.query({
      query: (searchTerm) => `/restaurant/orders/search?q=${searchTerm}`,
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/restaurant/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    getAllMenuItems: builder.query({
      query: () => "/restaurant/menus",
      providesTags: ["MenuItems"],
    }),
    toggleMenuAvailability: builder.mutation({
      query: ({ menuId, available }) => ({
        url: `/restaurant/menus/${menuId}/toggle`,
        method: "PATCH",
        body: { available },
      }),
      invalidatesTags: ["MenuItems"],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/restaurant/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    createMenuItem: builder.mutation({
      query: (formData) => ({
        url: "/menu",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MenuItems"],
    }),
    updateMenuItem: builder.mutation({
      query: ({ menuId, body }) => ({
        url: `/menu/${menuId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MenuItems"],
    }),

    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/restaurant/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    getUserCredentials: builder.query({
      query: (userId) => `/restaurant/users/${userId}/credentials`,
    }),
    resetUserPassword: builder.mutation({
      query: (userId) => ({
        url: `/restaurant/users/${userId}/reset-password`,
        method: "PATCH",
      }),
      invalidatesTags: ["Users"],
    }),
    firstTimePasswordChange: builder.mutation({
      query: (data) => ({
        url: "/restaurant/first-time-password",
        method: "PATCH",
        body: data,
      }),
    }),
    getPaymentSummary: builder.query({
      query: (date) => `/order/payment-summary${date ? `?date=${date}` : ''}`,
      providesTags: ["PaymentSummary"],
    }),
  }),
});

export const {
  useLoginRestaurantMutation,
  useGetRestaurantOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useUpdateOrderStatusMutation,
  useGetRestaurantOrderQuery,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
  useAwardStarMutation,
  useGetAnalyticsQuery,
  useCreateUserMutation,
  useGetAuditLogsQuery,
  useSearchOrdersQuery,
  useChangePasswordMutation,
  useGetAllMenuItemsQuery,
  useToggleMenuAvailabilityMutation,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useGetCategoriesQuery,
  useDeleteUserMutation,
  useGetUserCredentialsQuery,
  useResetUserPasswordMutation,
  useFirstTimePasswordChangeMutation,
  useGetPaymentSummaryQuery,
} = restaurantApiSlice;