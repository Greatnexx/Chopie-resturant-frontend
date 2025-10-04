import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { apiSlice } from "./apiSlice";
import currentUserReducer from "./currentUserSlice";
import uploadReducer from "./uploadSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  currentUser: currentUserReducer,
  upload: uploadReducer,
});

export default rootReducer;
