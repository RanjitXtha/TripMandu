import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user";
const initialUser: User = {
  fName: "",
  lName: "",
  email: "",
  id: "",
  profile: ""
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUser,
  reducers: {
    setUser(_, action: PayloadAction<User>) {
      return action.payload;
    },
    clearUser: () => initialUser,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
