import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/utils/supabaseClient.ts";
import { message } from "antd";
import { AppDispatch } from "@/store";

// 定义数据结构
interface Item {
    id: string;
    team_id: string;
    title: string;
    document_content?: string; // 文档内容
    canvas_content?: object;   // 画布内容
    introduce?: string;
    created_by: string;
    created_by_email: string;
    created_at: string;
    updated_at?: string;
    type: "document" | "canvas"; // 用于区分类型
}

interface DocumentState {
    documents: Item[]; // 只存文档
    canvases: Item[];  // 只存画布
    items: Item[];     // 存储所有数据
    loading: boolean;
}

// 初始状态
const initialState: DocumentState = {
    documents: [],
    canvases: [],
    items: [],
    loading: false,
};

// 创建 Redux Slice
const documentsStore = createSlice({
    name: "documents",
    initialState,
    reducers: {
        setDocumentsAndCanvases: (state, action) => {
            state.items = action.payload; // 存储所有数据

            // 根据 type 分开存储
            state.documents = action.payload.filter((item: Item) => item.type === "document");
            state.canvases = action.payload.filter((item: Item) => item.type === "canvas");
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
            .from('documents_and_canvases') // 视图
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });

        if (error) throw error;

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
                .from("documents")
                .insert([
                    {
                        team_id: teamId,
                        title: docName,
                        created_by: userId,
                        introduce: docDesc || "",
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
                .from("shared_canvases")
                .insert([
                    {
                        team_id: teamId,
                        title: canvasName,
                        created_by: userId,
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
