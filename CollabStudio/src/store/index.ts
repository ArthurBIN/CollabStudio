import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/modules/authStore.tsx";
import teamsReducer from "@/store/modules/teamsStore.tsx";
import documentsReducer from "@/store/modules/documentsStore.tsx";
import documentItemReducer from "@/store/modules/documentItemStore.tsx";
import teamMembersReducer from "@/store/modules/teamMembersStore.tsx";
import collaborationNoteReducer from "@/store/modules/collaborationNoteStore.tsx";
import { thunk } from "redux-thunk";


const store = configureStore({
    reducer: {
        auth: authReducer,
        teams: teamsReducer,
        documents: documentsReducer,
        document_item: documentItemReducer,
        team_members: teamMembersReducer,
        collaboration_note: collaborationNoteReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

// 定义 RootState 和 AppDispatch 类型，方便后续使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
