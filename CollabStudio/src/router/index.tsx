import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import {JSX} from "react";
import {useSelector} from "react-redux";
import Recents from "@/pages/Recents";

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
                element: <Navigate to="/recents" replace />
            },
            {
                path: "recents",
                element: <Recents />
            }
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
]);
