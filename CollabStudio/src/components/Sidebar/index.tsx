import './index.scss'
import {useLocation} from "react-router-dom";

interface LinkText {
    text: string
    children: React.ReactNode
    path: string // 添加 path 作为 props
}

const LinkBox = (props: LinkText) => {
    const { text, children, path } = props;
    const location = useLocation(); // 获取当前路由信息

    // 判断当前路由是否匹配，匹配则添加 `active` 类
    const isActive = location.pathname === path;

    return (
        <div className={`linkbox_All ${!isActive ? "linkbox_All_Hover" : ""} ${isActive ? "linkbox_All_Active" : ""}`}>
            <div className="linkbox_Icon">{children}</div>
            <div className="linkbox_Text">{text}</div>
        </div>
    )
}

const DivedLine = () => {
    return (
        <div className={'divedline_All'}></div>
    )
}

const Sidebar = () => {
    return (
        <div className="sidebar_All">
            <div className="sidebar_Logo">CollabStudio</div>
            <DivedLine />
            <LinkBox text="最近" path="/files/recents">
                <i className="iconfont icon-shijian"></i>
            </LinkBox>
            <DivedLine />
            <div className={'sidebar_TeamsName'}>
                <i className={'iconfont icon-pingtaiiconhuizong_huaban1fuben5'}></i>
                我的团队
            </div>
        </div>
    )
}

export default Sidebar