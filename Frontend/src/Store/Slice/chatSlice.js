import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Lib/axios";
import toast from "react-hot-toast";

// thunks

// get all the users for side bar
export const getUsers = createAsyncThunk(
  "chat/getUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/auth/users");
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// send message to user
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (form, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const receiver = state.chat.selected._id;

      const response = await axiosInstance.post(
        `/chat/sendMessage/${receiver}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        console.log(response.data.message);
        return response.data.message;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get the message from selected user
export const getMessage = createAsyncThunk(
  "chat/getMessage",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const receiver = state.chat.selected._id;
      const response = await axiosInstance.get(`/chat/getMessages/${receiver}`);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  message: [],
  users: [],
  onlineUsers: [],
  selected: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selected = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMesasges: (state, action) => {
      state.message = [...state.message, action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isUsersLoading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUsersLoading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.message = [...state.message, action.payload];
      })
      .addCase(sendMessage.rejected, () => {
        toast.error("Unable to send message");
      })
      .addCase(getMessage.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessage.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.message = action.payload;
      })
      .addCase(getMessage.rejected, (state) => {
        state.isMessagesLoading = false;
      });
  },
});

export const { setSelectedUser, setOnlineUsers, setMesasges } =
  chatSlice.actions;
export default chatSlice.reducer;
