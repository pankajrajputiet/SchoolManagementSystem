import { createSlice } from '@reduxjs/toolkit';

// ✅ Safe parsing
let user = null;
let token = null;

try {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser && storedUser !== "undefined") {
    user = JSON.parse(storedUser);
  }

  if (storedToken && storedToken !== "undefined") {
    token = storedToken;
  }
} catch (error) {
  console.error("LocalStorage parse error:", error);
}

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };

      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;