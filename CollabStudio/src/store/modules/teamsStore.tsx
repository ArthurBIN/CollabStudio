import { createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/utils/supabaseClient.ts";
import { AppDispatch } from "@/store";

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
            console.log("所有团队数据:", action.payload);
            state.teams = action.payload;
            if (action.payload.length > 0) {
                const savedTeamId = localStorage.getItem("currentTeamId");
                state.currentTeamId = savedTeamId || action.payload[0].team_id;
            }
        },
        setCurrentTeam: (state, action) => {
            console.log("切换团队:", action.payload);
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
            console.log("用户所属团队列表: ", existingTeams);

            const teams = existingTeams?.map(team => ({
                team_id: team.team_id,
                name: team.teams?.name || "未知团队"
            }));

            dispatch(setTeams(teams));
        }
    } catch (err) {
        console.error("checkTeam 发生错误：", err);
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
