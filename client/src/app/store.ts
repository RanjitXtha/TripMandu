import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/auth';
import planReducer from "../features/plan"
import favouriteReducer from '../features/favourites';

export const store = configureStore({
    reducer: {
        user: userReducer,
        plan: planReducer,
        favourites: favouriteReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

