import { createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/utils/supabaseClient.ts";
import { AppDispatch } from "@/store";
import {message} from "antd";

interface Team {
    team_id: string;
    name: string;
}

interface TeamsState {
    teams: Team[];  // 所有团队
    currentTeamId: string | null;  // 选中的团队 ID
    loading: boolean;
}

const initialState: TeamsState = {
    teams: [],
    currentTeamId: null, // 默认无选中的团队
    loading: false,
};

const teamsStore = createSlice({
    name: "teams",
    initialState,
    reducers: {
        setTeams: (state, action) => {
            state.teams = action.payload;
            if (action.payload.length > 0) {
                const savedTeamId = localStorage.getItem("currentTeamId");
                state.currentTeamId = savedTeamId || action.payload[0].team_id;
            }
        },
        setCurrentTeam: (state, action) => {
            state.currentTeamId = action.payload;
            localStorage.setItem("currentTeamId", action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const checkTeam = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));

        const storedAuth = JSON.parse(localStorage.getItem("sb-hwhmtdmefdcdhvqqmzgl-auth-token") || "{}");
        const user_id = storedAuth?.user?.id;

        if (!user_id) {
            dispatch(setLoading(false));
            return;
        }

        const { data: existingTeams, error } = await supabase
            .from("team_members")
            .select("team_id, teams(name)")
            .eq("user_id", user_id);

        if (error) {
            console.error("检查团队错误：", error);
            dispatch(setLoading(false));
            return;
        }

        if (existingTeams?.length > 0) {
            const teams = existingTeams?.map(team => ({
                team_id: team.team_id,
                name: team.teams?.name || "未知团队"
            }));

            dispatch(setTeams(teams));

            const savedTeamId = localStorage.getItem("currentTeamId");
            const matchedTeam = teams?.find(t => t.team_id === savedTeamId);

            if (savedTeamId && matchedTeam) {
                dispatch(setCurrentTeam(savedTeamId));
            } else {
                dispatch(setCurrentTeam(teams?.[0].team_id));
            }
        }
    } catch (err) {
        console.error("checkTeam 发生错误：", err);
        message.error(err.message);
    } finally {
        dispatch(setLoading(false));
    }
};


// 导出新添加的切换团队 action
export const {
    setTeams,
    setCurrentTeam,
    setLoading ,
} = teamsStore.actions;
export default teamsStore.reducer;
