import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch } from "@/store";
import { supabase } from "@/utils/supabaseClient.ts";
import { message } from "antd";

interface AuthState {
    user_id: string | null;
    token: string | null;
    loading: boolean;
}

const storedAuth = JSON.parse(localStorage.getItem("sb-hwhmtdmefdcdhvqqmzgl-auth-token") || "{}");

const initialState: AuthState = {
    user_id: storedAuth?.user?.id || null,
    token: storedAuth?.access_token || null,
    loading: false,
};

const authStore = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user_id = null;
            state.token = null;
            state.team_id = null;
            localStorage.removeItem("sb-hwhmtdmefdcdhvqqmzgl-auth-token"); // 清除存储的用户数据
        },
        setUser: (state, action) => {
            state.user_id = action.payload?.user?.id || null;
            state.token = action.payload?.session?.access_token || null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

// **用户注册**
export const registerUser = (form: { email: string; password: string }) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const { error } = await supabase.auth.signUp(form);
        if (error) {
            message.error(error.message);
        } else {
            message.success("注册成功！");
            return true;
        }
    } catch (err) {
        message.error(err.message);
    }
    dispatch(setLoading(false));
};

// **用户登录**
export const loginUser = (form: { email: string; password: string }) => async (dispatch: AppDispatch) => {
        dispatch(setLoading(true));
        try {
            const { data, error } = await supabase.auth.signInWithPassword(form);
            if (error) {
                message.error(error.message);
            } else {
                dispatch(setUser(data)); // 更新 Redux
                // ✅ 这里直接调用 checkAndCreateTeam 获取团队 ID
                await dispatch(checkAndCreateTeam(data.user?.id));

                message.success("登录成功！");
                return true;
            }
        } catch (err) {
            message.error(err.message);
        }
        dispatch(setLoading(false));
    };

// **检查并创建默认团队**
export const checkAndCreateTeam = (userId?: string) => async () => {
    if (!userId) return;

    // 1️⃣ 检查用户是否已有团队
    const { data: existingTeams, error } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", userId);

    if (error) {
        console.error("检查团队错误：", error);
        return;
    }

    if (existingTeams?.length > 0) {
        return; // 已有团队，返回 team_id
    }

    // 2️⃣ 创建默认团队
    const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert([{ name: "我的团队", created_by: userId }])
        .select()
        .single();

    if (teamError) {
        console.error("创建团队失败：", teamError);
        return;
    }

    // 3️⃣ 将用户加入该团队
    await supabase.from("team_members").insert([
        { team_id: newTeam.id, user_id: userId },
    ]);

    return; // 返回新创建的团队 ID
};

export const { logout, setUser, setLoading, setTeamId } = authStore.actions;
export default authStore.reducer;
