import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // <-- Fixed import

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
