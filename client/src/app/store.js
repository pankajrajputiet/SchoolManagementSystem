import { configureStore } from '@reduxjs/toolkit';
import apiSlice from '@/api/apiSlice';
import authReducer from '@/features/auth/authSlice';
import uiReducer from './uiSlice';
import notificationReducer from '@/features/notifications/notificationSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
