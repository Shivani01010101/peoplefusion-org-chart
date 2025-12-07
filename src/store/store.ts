import { configureStore } from "@reduxjs/toolkit";
import orgChartReducer from "./slices/orgChartSlice";

export const store = configureStore({
  reducer: {
    orgChart: orgChartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
