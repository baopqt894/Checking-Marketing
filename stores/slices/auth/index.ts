// import { createSlice } from "@reduxjs/toolkit";

// import { authAPI } from "@/store/queries/auth";
// import webStorageClient from "@/utils/webStorageClient";
// import { constants } from "@/settings";

// interface AuthSlickInterface {
//   isAuthenticatedAccount: boolean;
//   userInfo: any;
//   access_token: any;
//   roles: [any];
//   currentSemester: string;
//   currentExamPeriod?: string;
// }

// const initialState: AuthSlickInterface = {
//   isAuthenticatedAccount: false,
//   userInfo: null,
//   access_token: null,
//   roles: [null],
//   currentSemester: webStorageClient.get(constants.CURRENT_SEMESTER) || "",
//   currentExamPeriod: webStorageClient.get(constants.CURRENT_EXAM_PERIOD) || "",
// };

// export const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     actionMicrosoftLogin: (state, action) => {
//       // Sửa logic để lấy dữ liệu đúng từ `result`
//       state.isAuthenticatedAccount = action?.payload?.status === 200;
//       state.userInfo = action?.payload?.result?.user;
//       state.access_token = action?.payload?.result?.token;
//       state.roles = action?.payload?.result?.roles;

//       // Lưu thông tin vào localStorage
//       webStorageClient.setToken(action?.payload?.result?.token);
//       webStorageClient.set(constants.USER_INFO, action?.payload?.result?.user);
//       webStorageClient.set(constants.IS_AUTH, action?.payload?.status === 200);
//       webStorageClient.set(constants.USER_ROLE, action?.payload?.result?.roles);
//     },
//     clearAuthState: (state) => {
//       state.isAuthenticatedAccount = false;
//       state.access_token = null;
//       state.userInfo = null;
//       state.roles = [null];
//     },
//     actionChangeCurrentSemester: (state, action) => {
//       state.currentSemester = action.payload;
//       webStorageClient.set(constants.CURRENT_SEMESTER, action?.payload);
//     },
//     actionChangeCurrentExamPeriod: (state, action) => {
//       state.currentExamPeriod = action.payload;
//       if (action.payload !== "") {
//         webStorageClient.set(constants.CURRENT_EXAM_PERIOD, action?.payload);
//       } else {
//         webStorageClient.remove(constants.CURRENT_EXAM_PERIOD);
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addMatcher(
//       authAPI.endpoints.signIn.matchFulfilled,
//       (state, action) => {
//         state.isAuthenticatedAccount = action.payload.isAuthenticated;
//         state.userInfo = action.payload.user;
//         state.access_token = action?.payload?.token;
//         state.roles = action?.payload?.roles;
//         webStorageClient.setToken(action?.payload?.token);
//         webStorageClient.set(constants.USER_INFO, action?.payload?.user);
//         webStorageClient.set(
//           constants.IS_AUTH,
//           action?.payload?.isAuthenticated,
//         );
//         webStorageClient.set(constants.USER_ROLE, action?.payload?.roles);
//       },
//     );
//   },
// });

// export const {
//   actionMicrosoftLogin,
//   clearAuthState,
//   actionChangeCurrentSemester,
//   actionChangeCurrentExamPeriod,
// } = authSlice.actions;

// export default authSlice.reducer;
