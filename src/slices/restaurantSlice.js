import { apiSlice } from "./apiSlice";

export const restaurantApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerRestaurant: builder.mutation({
      query: (restaurantData) => ({
        url: "/restaurant/register",
        method: "POST",
        body: restaurantData,
      }),
    }),
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
    modifyOrder: builder.mutation({
      query: ({ orderId, items, totalAmount, customerNotes }) => ({
        url: `/order/${orderId}`,
        method: "PUT",
        body: { items, totalAmount, customerNotes },
      }),
      invalidatesTags: ["RestaurantOrders"],
    }),
    cancelOrderMutation: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/order/${orderId}/cancel`,
        method: "POST",
        body: { reason },
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
      query: (params) => {
        if (typeof params === 'object' && params.startDate && params.endDate) {
          return `/restaurant/analytics?startDate=${params.startDate}&endDate=${params.endDate}`;
        }
        return `/restaurant/analytics?period=${params || 'day'}`;
      },
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
    deleteMenuItem: builder.mutation({
      query: (menuId) => ({
        url: `/menu/${menuId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MenuItems"],
    }),

    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/category",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Categories"],
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
    getRestaurantSettings: builder.query({
      query: () => "/restaurant/settings",
      providesTags: ["RestaurantSettings"],
    }),
    updateRestaurantSettings: builder.mutation({
      query: (settingsData) => ({
        url: "/restaurant/settings",
        method: "PUT",
        body: settingsData,
      }),
      invalidatesTags: ["RestaurantSettings"],
    }),
  }),
});

export const {
  useRegisterRestaurantMutation,
  useLoginRestaurantMutation,
  useGetRestaurantOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useUpdateOrderStatusMutation,
  useModifyOrderMutation,
  useCancelOrderMutationMutation,
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
  useDeleteMenuItemMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteUserMutation,
  useGetUserCredentialsQuery,
  useResetUserPasswordMutation,
  useFirstTimePasswordChangeMutation,
  useGetPaymentSummaryQuery,
  useGetRestaurantSettingsQuery,
  useUpdateRestaurantSettingsMutation,
} = restaurantApiSlice;