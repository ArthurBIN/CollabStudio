import {createSlice} from "@reduxjs/toolkit";
import {AppDispatch} from "@/store";
import {supabase} from "@/utils/supabaseClient.ts";
import {message} from "antd";

interface Item {
    id: string;
    project_id: string;
    permission: string;
    invited_by: string;
    created_at: string;
    projects: {type: string, title: string};
    user_info: {email: string, username: string}
}

interface CollaborationNoteState {
    items: Item[];
    loading: boolean;
}

// 初始状态
const initialState: CollaborationNoteState = {
    items: [],
    loading: false,
};


const collaborationNoteStore = createSlice({
    name: 'collaborationNote',
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const getCollaborationNote = (userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));

        const { data, error } = await supabase
            .from('project_collaborators')
            .select('id, project_id, permission, invited_by, created_at, projects:project_id(title, type), user_info:invited_by(username, email)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log(data)
        dispatch(setItems(data));

    } catch (err) {
        console.error("获取协作笔记出错：", err);
        message.error(err.message);
    } finally {
        dispatch(setLoading(false));
    }
};

export const {
    setItems,
    setLoading,

} = collaborationNoteStore.actions

export default collaborationNoteStore.reducer