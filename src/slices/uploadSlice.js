import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    uploadRequest: (state) => {
      state.loading = true;
      state.data = null;
      state.error = null;
    },
    uploadSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    uploadFailure: (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.payload;
    },
    uploadReset: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
});

export const { uploadRequest, uploadSuccess, uploadFailure, uploadReset } =
  uploadSlice.actions;

export const upload =
  ({ id, file }) =>
  async (dispatch) => {
    try {
      dispatch(uploadRequest());

      const formData = new FormData();
      formData.append("id", id);
      formData.append("file", file);

      const { data } = await axios.put(
        `${import.meta.env.RENDER_URL}/user/update-profile-picture/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.status) {
        dispatch(uploadSuccess(data.message));
      } else {
        dispatch(uploadFailure(data.message));
      }
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch(uploadFailure(message));
    }
  };

export default uploadSlice.reducer;
