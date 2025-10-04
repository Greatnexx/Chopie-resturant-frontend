  import { createSlice } from '@reduxjs/toolkit';

  const initialState= {
    userInfo: sessionStorage.getItem('userInfo')
      ? JSON.parse(sessionStorage.getItem('userInfo')?? '{}')
      : null
  }


  const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      setCredentials: (state, action) => {
        state.userInfo = action.payload;
        sessionStorage.setItem('userInfo', JSON.stringify(action.payload));

        const expirationTime = new Date().getTime() + 10 * 60 * 1000;
        sessionStorage.setItem('expirationTime', expirationTime);
      },
      
      logout: (state) => {
        state.userInfo = null;
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('expirationTime');
      },
    },
  });

  export const { setCredentials, logout } = authSlice.actions;

  export default authSlice.reducer;
