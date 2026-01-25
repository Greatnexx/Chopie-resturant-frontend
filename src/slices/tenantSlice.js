import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTenant: null,
  branding: null,
  isMultiTenant: false,
  routingType: null, // 'subdomain' or 'path'
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenant: (state, action) => {
      state.currentTenant = action.payload;
      state.branding = action.payload?.branding || null;
      state.isMultiTenant = !!action.payload;
    },
    clearTenant: (state) => {
      state.currentTenant = null;
      state.branding = null;
      state.isMultiTenant = false;
      state.routingType = null;
    },
    updateBranding: (state, action) => {
      if (state.currentTenant) {
        state.branding = action.payload;
        state.currentTenant.branding = action.payload;
      }
    },
    setRoutingType: (state, action) => {
      state.routingType = action.payload;
    },
  },
});

export const { setTenant, clearTenant, updateBranding, setRoutingType } = tenantSlice.actions;

// Selectors
export const selectCurrentTenant = (state) => state.tenant.currentTenant;
export const selectTenantBranding = (state) => state.tenant.branding;
export const selectIsMultiTenant = (state) => state.tenant.isMultiTenant;
export const selectRoutingType = (state) => state.tenant.routingType;

export default tenantSlice.reducer;