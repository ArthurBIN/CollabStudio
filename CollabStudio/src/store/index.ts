import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/modules/authStore.tsx";
import teamsReducer from "@/store/modules/teamsStore.tsx";

const store = configureStore({
    reducer: {
        auth: authReducer,
        teams: teamsReducer
    },
});

// 定义 RootState 和 AppDispatch 类型，方便后续使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
