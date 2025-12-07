import { configureStore } from "@reduxjs/toolkit";
import orgChartReducer from "./slices/orgChartSlice";

/**
 * Redux store configuration
 * Configures the application's global state management
 */
export const store = configureStore({
  reducer: {
    orgChart: orgChartReducer,
  },
});

/**
 * TypeScript types for Redux store
 * These types enable type-safe access to the store state and dispatch
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
