import {Outlet} from "react-router-dom";
import './index.scss'
const Home = () => {

    return (
        <div className={'All'}>
            1
            <Outlet />
        </div>
    )
}

export default Home