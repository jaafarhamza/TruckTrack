import { createSlice } from "@reduxjs/toolkit";
import storage from "../../utils/storage";

// Initialize state from localStorage
const token = storage.getToken();
const user = storage.getUser();

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!(token && user),
  loading: true, // Start with loading true to prevent premature redirect
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
