import {createSlice} from "@reduxjs/toolkit";
import {AppDispatch} from "@/store";
import {supabase} from "@/utils/supabaseClient.ts";
import { message } from 'antd';
interface AuthState {
    user_id: string | null;
    token: string | null;
    loading: boolean;
}

const storedAuth = JSON.parse(localStorage.getItem('sb-hwhmtdmefdcdhvqqmzgl-auth-token') || '{}');

const initialState: AuthState = {
    user_id: storedAuth?.user?.id || null,
    token: storedAuth?.access_token || null,
    loading: false,
};



const authStore = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user_id = null;
            state.token = null;
            localStorage.removeItem("auth"); // 清除存储的用户数据
        },
        setUser: (state, action) => {
            state.user_id = action.payload?.user?.id || null;
            state.token = action.payload?.session?.access_token || null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    }
});


export const registerUser = (form: { email: string; password: string }) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true)); // 请求开始时设置 loading 为 true
    try {
        const { data, error } = await supabase.auth.signUp(form);
        if (error) {
            message.error(error.message);
            dispatch(setLoading(false));
            return;
        }
        if (data) {
            message.success("注册成功！")
            dispatch(setLoading(false)); // 请求结束时设置 loading 为 false
            return true;
        }
    } catch (err) {
        message.error(err.message);
        dispatch(setLoading(false)); // 请求结束时设置 loading 为 false
        return;
    }
};

// 登录功能
export const loginUser = (form: { email: string; password: string }) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true)); // 请求开始时设置 loading 为 true
    try {
        const { data, error } = await supabase.auth.signInWithPassword(form);
        if (error) {
            message.error(error.message);
            dispatch(setLoading(false));
            return;
        }
        if (data) {
            message.success("登录成功！")
            dispatch(setUser(data)); // 成功后更新用户信息
            dispatch(setLoading(false));
            return true;
        }
    } catch (err) {
        message.error(err.message);
        dispatch(setLoading(false)); // 请求结束时设置 loading 为 false
        return;
    }
};

export const { logout, setUser, setLoading } = authStore.actions

const authReducer = authStore.reducer

export default authReducer