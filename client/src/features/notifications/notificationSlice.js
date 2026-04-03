import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
});

export const { setUnreadCount, decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
