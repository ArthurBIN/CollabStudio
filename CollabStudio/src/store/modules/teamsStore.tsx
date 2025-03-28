import { createSlice } from "@reduxjs/toolkit";

interface TeamsState {
    team_id: string | null
    name: string | null
    loading: boolean
}

const initialState: TeamsState = {
    team_id: "",
    name: "",
    loading: false
};

const teamsStore = createSlice({
    name: "teams",
    initialState,
    reducers: {
        setTeam: () => {

        }
    },
});

export const { setTeam } = teamsStore.actions;
export default teamsStore.reducer;
