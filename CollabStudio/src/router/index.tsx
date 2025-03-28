import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import {JSX} from "react";
import {useSelector} from "react-redux";
import Recents from "@/pages/Recents";
import Teams from "@/pages/Teams";
import AllProjects from "@/pages/AllProjects";

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
    const { token } = useSelector(state => state.auth)
    return token ? element : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute element={<Home />} />,
        children: [
            {
                index: true,
                element: <Navigate to="/files/recents" replace />
            },
            {
                path: "teams/:team_id",
                element: <Teams />
            },
            {
                path: "files/recents",
                element: <Recents />
            },
            {
                path: "teams/:team_id/all-projects",
                element: <AllProjects />
            },
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
]);
