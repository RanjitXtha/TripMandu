// src/features/favourites.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface FavouriteState {
  items: number[]; // List of favourited destination IDs
  loading: boolean;
}

const initialState: FavouriteState = {
  items: [],
  loading: false,
};

// --- Fetch Favourites ---
export const fetchFavourites = createAsyncThunk(
  "favourites/fetchFavourites",
  async (userId: string) => {
    const response = await axios.get(
      `http://localhost:8080/api/destination/getfavorites/${userId}`
    );

    // Extract and map destination IDs
    const favorites = response.data.favorites || [];
    return favorites.map((fav: { destinationId: number }) => fav.destinationId);
  }
);

// --- Add Favourite ---
export const addFavourite = createAsyncThunk(
  "favourites/addFavourite",
  async ({ userId, destinationId }: { userId: string; destinationId: number }) => {
    const response = await axios.post(
      "http://localhost:8080/api/destination/favorites",
      { userId, destinationId }
    );

    return response.data.favorite.destinationId; // The backend returns { favorite }
  }
);

// --- Remove Favourite ---
export const removeFavourite = createAsyncThunk(
  "favourites/removeFavourite",
  async ({ userId, destinationId }: { userId: string; destinationId: number }) => {
    // Use the same base URL style as addFavourite
    await axios.delete("http://localhost:8080/api/destination/favorites", {
      data: { userId, destinationId },
    });
    return destinationId;
  }
);

// --- Slice ---
const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch favourites
      .addCase(fetchFavourites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavourites.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchFavourites.rejected, (state) => {
        state.loading = false;
      })

      // Add favourite
      .addCase(addFavourite.fulfilled, (state, action: PayloadAction<number>) => {
        if (!state.items.includes(action.payload)) {
          state.items.push(action.payload);
        }
      })

      // Remove favourite
      .addCase(removeFavourite.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((id) => id !== action.payload);
      });
  },
});

export default favouritesSlice.reducer;
