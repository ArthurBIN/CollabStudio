import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/modules/authStore.tsx"; // 不需要 .ts 后缀

const store = configureStore({
    reducer: {
        auth: authReducer // 直接传入 reducer，而不是调用它
    }
});

// 定义 RootState 和 AppDispatch 类型，方便后续使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
