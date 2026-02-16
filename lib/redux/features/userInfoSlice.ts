import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { userInfoApi } from "./userInfoApi";

type UserInfoState = {
  role: string | null;
};

const initialState: UserInfoState = {
  role: null,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    clearUserRole: (state) => {
      state.role = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userInfoApi.endpoints.getUserInfo.matchFulfilled,
      (state, action) => {
        state.role = action.payload.role ?? null;
      }
    );
  },
});

export const { clearUserRole } = userInfoSlice.actions;

export const selectUserRole = (state: RootState) => state.userInfo.role;

export default userInfoSlice.reducer;
