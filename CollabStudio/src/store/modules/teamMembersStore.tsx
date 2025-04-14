import {createSlice} from "@reduxjs/toolkit";
import {supabase} from "@/utils/supabaseClient.ts";
import {message} from "antd";
import {AppDispatch} from "@/store";

interface Item {
    id: string;
    user_id: string;
    role: string;
    email: string;
    joined_at: string;
    username: string
}

interface teamMemberState {
    items: Item[];
    loading: boolean;
}

const initialState: teamMemberState = {
    items: [],
    loading: false,
};


const teamMembersStore = createSlice({
    name: "teamMembers",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
    }
})

export const handleGetTeamMembers = (currentTeamId: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    try {
        const {data, error} = await supabase
            .from('members_with_users')
            .select('id, user_id, role, email, joined_at, username')
            .eq('team_id', currentTeamId)

        if (error) {
            message.error(error.message)
            return;
        }
        console.log(data)
        dispatch(setItems(data));

    } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : '未知错误';
        message.error(msg);
    }
    finally {
        dispatch(setLoading(false))
    }
}

export const {
    setItems,
    setLoading
} = teamMembersStore.actions

export default teamMembersStore.reducer