/**
 * 此结构为document的单独操作
 **/
import {createSlice} from "@reduxjs/toolkit";
import {supabase} from "@/utils/supabaseClient.ts";
import {message} from "antd";
import {AppDispatch} from "@/store";

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
    items: Item;
    loading: boolean;
}

// 初始状态
const initialState: DocumentState = {
    items: {} as Item,
    loading: false,
};


const documentItemStore = createSlice({
    name: "documents",
    initialState,
    reducers: {
        setDocument: (state, action) => {
            state.items = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    }
})

export const getDocumentItem = (document_id: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));

        const { data, error } = await supabase
            .from('projects')
            .select('*, user_info(email, username)')
            .eq('id', document_id)
            .single();

        if (error) throw error;
        dispatch(setDocument(data))

    } catch (err) {
        console.error("获取文档出错：", err);
        message.error(err.message);
    } finally {
        dispatch(setLoading(false));
    }
}

export const {
    setDocument,
    setLoading
} = documentItemStore.actions
export default documentItemStore.reducer


