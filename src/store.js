import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./slices/rootReducer";
import { apiSlice } from "./slices/apiSlice";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

// Log the initial state
//console.log('Initial State: ', store.getState());

// Log the state after each action
store.subscribe(() => {
  //console.log('State after dispatch: ', store.getState());
});

export default store;
