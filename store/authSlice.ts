import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasSeenOnboarding: false,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setHasSeenOnboarding(state, action: PayloadAction<boolean>) {
      state.hasSeenOnboarding = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
});

export const { setAuthenticated, setHasSeenOnboarding, setToken } =
  authSlice.actions;
export default authSlice.reducer;
