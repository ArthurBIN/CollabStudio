import './index.scss'
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {checkTeam, setCurrentTeam} from "@/store/modules/teamsStore.tsx";
import {Button, Modal, Skeleton} from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
interface LinkText {
    text: string;
    children: React.ReactNode;
    path: string;
    handleClick?: () => void;
}
// 跳转连接按钮
const LinkBox = ({ text, children, path, handleClick }: LinkText) => {
    const location = useLocation(); // 获取当前路由信息
    const isActive = location.pathname === path;

    return (
        <div
            className={`linkbox_All 
                ${!isActive ? "linkbox_All_Hover" : ""} 
                ${isActive ? "linkbox_All_Active" : ""}`}
            onClick={() => handleClick?.()} // 这里绑定事件
        >
            <div className="linkbox_Icon">{children}</div>
            <div className="linkbox_Text">{text}</div>
        </div>
    );
};
// 分割线
const DivedLine = () => {
    return (
        <div className={'divedline_All'}></div>
    )
}

const LoadingBox = () => {
    return (
        <div>
            <Skeleton.Button
                active={true}
                size={'default'}
                block={true}
                style={{ width: 110, marginTop: 10 }}
            />
            <Skeleton.Button
                active={true}
                size={'default'}
                block={true}
                shape={'default'}
                style={{ marginTop: 5 }}
            />
            <Skeleton.Button
                active={true}
                size={'default'}
                block={true}
                shape={'default'}
                style={{ marginTop: 5 }}
            />
        </div>
    )
}

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const teams = useSelector(state => state.teams.teams);
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const loading = useSelector(state => state.teams.loading);

    const [dropdownVisible, setDropdownVisible] = useState(false); // 控制下拉菜单的显示状态

    useEffect(() => {
        dispatch(checkTeam());
    }, [dispatch]);

    const currentTeam = teams.find(team => team.team_id === currentTeamId);

    const ToFilesRecents = () => {
        navigate("/files/recents");
    };

    const ToAllProjects = () => {
        if (currentTeam) {
            navigate(`/teams/all-projects`);
        }
    };

    const handleChangeTeam = (teamId: string) => {
        if (teamId === currentTeamId) return; // 避免重复点击

        Modal.confirm({
            title: "切换团队",
            content: "确定要切换到该团队吗？",
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                dispatch(setCurrentTeam(teamId));
                navigate(`/teams/all-projects`);
            }
        });
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <div className="sidebar_All">
            <div className="sidebar_Logo">CollabStudio</div>
            <DivedLine />

            <LinkBox
                text="最近"
                path="/files/recents"
                handleClick={ToFilesRecents}
            >
                <i className="iconfont icon-shijian"></i>
            </LinkBox>

            <DivedLine />

            {loading ? (
                <LoadingBox />
            ) : (
                <>
                    {currentTeam ? (
                        <>
                            <div className={'sidebar_Teams'}>
                                <div className={`sidebar_TeamsName ${dropdownVisible ? "sidebar_TeamsName_Active" : ""}`}
                                     onClick={toggleDropdown}
                                >
                                    <i className={'iconfont icon-pingtaiiconhuizong_huaban1fuben5'}></i>
                                    {currentTeam.name}
                                </div>
                                {dropdownVisible && (
                                    <div className={'sidebar_DropDown'}>
                                        {teams.map((team) => (
                                            <div
                                                className={
                                                    `sidebar_DropDown_Item
                                                 ${team.team_id === currentTeamId ? 'sidebar_DropDown_Item_Active' : ''}`
                                                }
                                                key={team.team_id}
                                                onClick={() => handleChangeTeam(team.team_id)}
                                            >
                                                <i className={'iconfont icon-pingtaiiconhuizong_huaban1fuben5'}></i>
                                                {team.name}
                                                {
                                                    team.team_id === currentTeamId ?
                                                        <div className={'sidebar_DropDown_Item_Right'}>
                                                            <CheckOutlined/>
                                                        </div>
                                                        :
                                                        <></>
                                                }

                                            </div>
                                        ))}

                                        {/*分割线*/}
                                        <div className={'sidebar_DropDown_Line'}></div>

                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined/>}
                                            style={{width: '100%', fontSize: 12}}
                                        >
                                            创建团队
                                        </Button>

                                    </div>
                                )}
                            </div>

                            <LinkBox
                                text="所有项目"
                                path={currentTeam ? `/teams/all-projects` : "/files/recents"}
                                handleClick={ToAllProjects}
                            >
                                <i className="iconfont icon-xiangmu"></i>
                            </LinkBox>
                        </>
                    ) : (
                        <p>没有加入任何团队</p>
                    )}


                </>
            )}
        </div>
    );
};

export default Sidebar