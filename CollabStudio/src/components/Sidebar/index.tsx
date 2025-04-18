import './index.scss'
import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {checkTeam, setCurrentTeam} from "@/store/modules/teamsStore.tsx";
import {Avatar, Button, Divider, Empty, Form, Input, message, Modal, Popover, Skeleton} from 'antd';
import {PlusOutlined, CheckOutlined, SettingOutlined, LogoutOutlined} from '@ant-design/icons';
import {supabase} from "@/utils/supabaseClient.ts";
import { UserOutlined } from '@ant-design/icons';
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
    const userId = useSelector(state => state.auth.user_id)
    const userName = useSelector(state => state.auth.username)
    const email = useSelector(state => state.auth.email)
    const bgc = useSelector(state => state.auth.bgc)
    const [openCreateTeam, setOpenCreateTeam] = useState(false);
    const [confirmLoading_Team, setConfirmLoading_Team] = useState(false);
    const [form_addTeam] = Form.useForm();

    const [dropdownVisible, setDropdownVisible] = useState(false); // 控制下拉菜单的显示状态

    useEffect(() => {
        dispatch(checkTeam());
    },[dispatch]);

    const currentTeam = teams.find(team => team.team_id === currentTeamId);
    const ToFilesRecents = () => {
        navigate("/files/recents");
    };

    const ToAllProjects = () => {
        if (currentTeam) {
            navigate(`/teams/all-projects`);
        }
    };

    const ToTeamMembers = () => {
        if (currentTeam) {
            navigate(`/team/team-members`);
        }
    }

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

    // 创建笔记本
    const handleCreateTeamOk = async () => {
        try {
            const values = await form_addTeam.validateFields(); // 获取表单数据
            setConfirmLoading_Team(true);

            const { data: newTeam, error } = await supabase
                .from("teams")
                .insert([
                    {
                        name: values.teamName,
                        created_by: userId
                    },
                ])
                .select()
                .single();

            if (error) {
                message.error(error.message);
            } else {
                await dispatch(setCurrentTeam(newTeam.id));
                await supabase
                    .from("team_members").
                    insert([
                        {
                            team_id: newTeam.id,
                            user_id: userId,
                            role: "owner"
                        },
                    ])
                    .select()
                    .single();
                await dispatch(checkTeam());
                message.success("创建成功！");
            }
        } catch (error) {
            console.error(error);
            message.error("创建笔记本失败！");
        } finally {
            setOpenCreateTeam(false);
            setConfirmLoading_Team(false);
            form_addTeam.resetFields();
            setDropdownVisible(false)
        }
    }

    const userInfoContent = (
        <div className={'userInfoContent'}>
            <div className={'userInfoContent_Avatar'}>
                <Avatar
                    style={{backgroundColor: `${bgc}`, cursor: "pointer"}}
                    icon={<UserOutlined/>}
                    size={36}
                />
                <div className={'userInfoContent_Avatar_UE'}>
                    <div>{userName}</div>
                    <div>{email}</div>
                </div>

            </div>

            <div style={{width: 284, margin: '0 auto'}}>
                <Divider style={{marginTop: 6, marginBottom: 6}}/>
            </div>

            <Button
                type="text"
                block
                icon={<SettingOutlined/>}
                size={'large'}
                style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    paddingLeft: 12,
                    fontSize: 14
                }}
            >
                设置
            </Button>

            <div style={{width: 284, margin: '0 auto'}}>
                <Divider style={{marginTop: 6, marginBottom: 6}}/>
            </div>

            <Button
                type="text"
                block
                icon={<LogoutOutlined />}
                size={'large'}
                danger
                style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    paddingLeft: 12,
                    fontSize: 14
                }}
            >
                退出登录
            </Button>
        </div>
    )

    return (
        <div className="sidebar_All">
            <div className="sidebar_Logo">
                CollabStudio
                <div className={'sidebar_User'}>
                    <Popover
                        placement="bottomLeft"
                        content={userInfoContent}
                        arrow={false}
                    >
                        <Avatar
                            style={{ backgroundColor: `${bgc}`, cursor: "pointer" }}
                            icon={<UserOutlined />}
                            size={24}
                        />
                    </Popover>

                </div>
            </div>
            <DivedLine />

            <LinkBox
                text="开始"
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
                                                    team.created_username === userName ?
                                                        <> (我)</>
                                                        :
                                                        <> ({team.created_username})</>
                                                }
                                                {}
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
                                            onClick={() => setOpenCreateTeam(true)}
                                        >
                                            创建笔记本
                                        </Button>

                                    </div>
                                )}
                            </div>

                            <LinkBox
                                text="所有笔记"
                                path={currentTeam ? `/teams/all-projects` : "/files/recents"}
                                handleClick={ToAllProjects}
                            >
                                <i className="iconfont icon-xiangmu"></i>
                            </LinkBox>

                            <LinkBox
                                text="成员管理"
                                path={"/team/team-members"}
                                handleClick={ToTeamMembers}
                            >
                                <i className="iconfont icon-chengyuan"></i>
                            </LinkBox>
                        </>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={() => setOpenCreateTeam(true)}>创建笔记本</Button>
                        </Empty>
                    )}


                </>
            )}

            <Modal
                title="新建笔记本"
                open={openCreateTeam}
                onOk={handleCreateTeamOk}
                confirmLoading={confirmLoading_Team}
                onCancel={() => setOpenCreateTeam(false)}
            >
                <Form form={form_addTeam} layout="vertical">
                    <Form.Item
                        label="笔记本名称"
                        name="teamName"
                        rules={[{required: true, message: '请输入笔记本名称'}]}
                    >
                        <Input placeholder="请输入笔记本名称"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Sidebar