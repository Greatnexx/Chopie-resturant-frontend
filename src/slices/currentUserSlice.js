import { createSlice } from '@reduxjs/toolkit';


const myData = sessionStorage.getItem("userInfo")
const userData = myData && JSON.parse(myData)

const initialState = {
  currentUser: userData
    ? userData
    : null
}

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
    
  },
});

export const { setCurrentUser } = currentUserSlice.actions;

export default currentUserSlice.reducer;
