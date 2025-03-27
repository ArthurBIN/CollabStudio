import { Outlet } from "react-router-dom";
import "./index.scss";
import Sidebar from "@/components/Sidebar";

const Home = () => {
    return (
        <div className="home_All">
            <div className="home_SiderBarBox">
                <Sidebar />
            </div>
            <div className="home_OutletContainer">
                <Outlet />
            </div>
        </div>
    );
};

export default Home;
