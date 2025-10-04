import { apiSlice } from "./apiSlice";

// Handle the response using the responseInterceptor
const handleResponse = (response) => {
  return response;
};

export const baseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/register`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),
    confirmReg: builder.mutation({
      query: ({ data }) => ({
        url: `${
          import.meta.env.VITE_BASE_URL
        }/users/register/confirm-registration`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    login: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/auth`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    adminLogin: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/admin/auth`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    updateUser: builder.mutation({
      query: (id) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/${id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    updateUserProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/profile/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    validateAccount: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/validate-account`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    verifyOtp: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/verifyOtp`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    resetPassword: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/reset-password`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: handleResponse,
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${import.meta.env.VITE_BASE_URL}/users/logout`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token }`,
        },
      }),
      transformResponse: handleResponse,
    }),

    getCategories: builder.query({
      query: () => "/categories",
    }),

    getMenuItems: builder.query({
      query: (categoryId) => `/menus/${categoryId}`,
    }),

    trackOrder: builder.query({
      query: (orderNumber) => `/order/${orderNumber}/track`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterUserMutation,
  useValidateAccountMutation,
  useVerifyOtpMutation,
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
  useLazyTrackOrderQuery,
} = baseApiSlice;
