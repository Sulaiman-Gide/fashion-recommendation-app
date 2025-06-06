import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  token: string | null;
  isAuthReady: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasSeenOnboarding: false,
  token: null,
  isAuthReady: false,
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
    setAuthReady(state, action: PayloadAction<boolean>) {
      state.isAuthReady = action.payload;
    },
    rehydrate(state) {
      state.isAuthReady = true;
    },
  },
});

export const {
  setAuthenticated,
  setHasSeenOnboarding,
  setToken,
  setAuthReady,
  rehydrate,
} = authSlice.actions;
export default authSlice.reducer;
