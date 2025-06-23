// authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct way to import

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const token = action.payload.token;

      try {
        const decodedUser = jwtDecode(token);  // ✅ Correct function call
        state.user = decodedUser;
        state.token = token;

        // Save in localStorage
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },

    loadUserFromStorage: (state) => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          state.token = token;
          state.user = jwtDecode(token);  // ✅ Decode properly
        } catch (error) {
          console.error("Invalid token on load:", error);
          localStorage.removeItem("token");
          state.user = null;
          state.token = null;
        }
      }
    }
  },
});

export const { loginSuccess, logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;