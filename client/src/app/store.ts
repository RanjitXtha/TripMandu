import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/auth';
import planReducer from '../features/plan';

export const store = configureStore({
    reducer: {
        user: userReducer,
        plan: planReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

