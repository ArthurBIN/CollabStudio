/**
 * 此结构为document和canvas的集合操作
**/

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/utils/supabaseClient.ts";
import { message } from "antd";
import { AppDispatch } from "@/store";

// 定义数据结构
interface Item {
    id: string;
    team_id: string;
    title: string;
    content?: string;
    introduce?: string;
    created_by: string;
    created_at: string;
    updated_at?: string;
    type: "document" | "canvas";
    user_info: {email: string, username: string}
}

interface DocumentState {
    items: Item[];
    loading: boolean;
}

// 初始状态
const initialState: DocumentState = {
    items: [],
    loading: false,
};

// 创建 Redux Slice
const documentsStore = createSlice({
    name: "documents",
    initialState,
    reducers: {
        setDocumentsAndCanvases: (state, action) => {
            state.items = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    }
});

// **获取文档 & 画布**
export const getDocumentsAndCanvases = (teamId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));

        const { data, error } = await supabase
            .from('projects')
            .select('*, user_info(email, username)')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log(data)

        dispatch(setDocumentsAndCanvases(data));
    } catch (err) {
        console.error("获取文档和画布列表出错：", err);
        message.error(err.message);
    } finally {
        dispatch(setLoading(false));
    }
};

// **新增文档**
export const addNewDocument = createAsyncThunk(
    "documents/addNewDocument",
    async ({ userId, docName, teamId, docDesc }:
               { userId: string; docName: string; teamId: string; docDesc?: string }) => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .insert([
                    {
                        team_id: teamId,
                        title: docName,
                        created_by: userId,
                        introduce: docDesc || "",
                        type: 'document'
                    },
                ])
                .select("id")
                .single();

            if (error) throw error;

            return data; // 返回新增的数据
        } catch (err) {
            console.error("创建文档出错：", err);
            message.error(err.message);
            throw err;
        }
    }
);

// **新增画布**
export const addNewCanvas = createAsyncThunk(
    "canvases/addNewCanvas",
    async ({ userId, canvasName, teamId }:
               { userId: string; canvasName: string; teamId: string;}) => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .insert([
                    {
                        team_id: teamId,
                        title: canvasName,
                        created_by: userId,
                        type: 'canvas'
                    },
                ])
                .select("id")
                .single();

            if (error) throw error;

            return data; // 返回新增的数据
        } catch (err) {
            console.error("创建画布出错：", err);
            message.error(err.message);
            throw err;
        }
    }
);

// 导出 actions
export const {
    setDocumentsAndCanvases,
    setLoading
} = documentsStore.actions;

// 导出 reducer
export default documentsStore.reducer;
