import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import React, {useState} from "react";
import {handleGetTeamMembers} from "@/store/modules/teamMembersStore.tsx";
import {supabase} from "@/utils/supabaseClient.ts";
import {AutoComplete, Avatar, Input, Modal, Popover, Tooltip} from "antd";
import './index.scss'

const CollaboratorPopover = () => {
    const dispatch = useDispatch();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const { document_id } = useParams();
    const userId = useSelector(state => state.auth.user_id)

    const [popoverVisible, setPopoverVisible] = useState(false);

    const teamMembersList = useSelector(state => state.team_members.items);


    const getTeamMembers = async () => {
        console.log(currentTeamId)
        if (!currentTeamId) return;
        console.log(1)
        await dispatch(handleGetTeamMembers(currentTeamId));
    };

    const handlePopoverChange = (visible: boolean) => {
        setPopoverVisible(visible);
        if (visible) {
            getTeamMembers(); // 仅在Popover打开时调用
        }
    };


    // 协作者信息文档
    const [options, setOptions] = useState([]);

    // 处理输入协作者邮箱查询逻辑
    const handleCollaboratorsSearch = async (searchText: string) => {
        if (!searchText) {
            setOptions([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_info')
                .select('id, email')
                .ilike('email', `%${searchText}%`);

            if (error) {
                console.error("搜索用户邮箱失败:", error);
                setOptions([]);
                return;
            }

            if (!(data) || data.length === 0) {
                setOptions([
                    {
                        label: <span style={{ color: '#999' }}>未找到相关用户</span>,
                        value: 'no_result',
                        disabled: true
                    }
                ]);
                return;
            }

            const formattedOptions = data.map(item => {
                const isTeamMember = teamMembersList.some(member => member.email === item.email);
                return {
                    label: (
                        <span style={isTeamMember ? { color: '#aaa' } : {}}>
                        {item.email} {isTeamMember ? '(团队成员)' : ''}
                    </span>
                    ),
                    value: item.email,
                    user_id: item.id,
                    disabled: isTeamMember
                };
            });

            setOptions(formattedOptions);
        } catch (err) {
            console.error("搜索异常:", err);
            setOptions([
                {
                    label: <span style={{ color: '#999' }}>搜索失败，请稍后重试</span>,
                    value: 'error',
                    disabled: true
                }
            ]);
        }
    };

    // 处理添加协作者逻辑
    const handleAddCollaborators = (email: string, user_id: string) => {
        Modal.confirm({
            title: `确认邀请该用户？`,
            content: `您将邀请 ${email} 成为该文档的协作者，权限为只读（read）。`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const { data, error } = await supabase
                        .from("project_collaborators")
                        .insert([{
                            project_id: document_id,
                            user_id: user_id,
                            permission: 'read',
                            invited_by: userId
                        }]);

                    if (error) {
                        console.error("添加协作者失败:", error);
                        if (error.message === 'duplicate key value violates unique constraint "project_collaborators_project_id_user_id_key"') {
                            Modal.error({
                                title: "添加失败",
                                content: "该用户已经添加为该文档协作者",
                            });
                        } else {
                            Modal.error({
                                title: "添加失败",
                                content: error.message,
                            });
                        }

                    } else {
                        console.log("协作者添加成功:", data);
                        Modal.success({
                            title: "邀请成功",
                            content: `${email} 已被成功邀请为协作者。`
                        });
                    }
                } catch (err) {
                    console.error("添加协作者异常:", err);
                    Modal.error({
                        title: "发生错误",
                        content: "无法添加协作者，请稍后再试。",
                    });
                }
            }
        });
    };


    const addCollaboratorsContent = (
        <div>
            <AutoComplete
                popupMatchSelectWidth={252}
                style={{ width: 300 }}
                options={options}
                onSelect={(value) => {
                    const selectedOption = options.find(option => option.value === value);
                    if (selectedOption && !selectedOption.disabled) {
                        handleAddCollaborators(selectedOption.value, selectedOption.user_id);
                    }
                }}

                onSearch={handleCollaboratorsSearch}
                size="large"
            >
                <Input size="middle" placeholder="输入用户邮箱邀请协作" />
            </AutoComplete>
            <TeamMembers memberList={teamMembersList} />
        </div>
    );


    return (
        <Popover
            placement="bottomRight"
            title="文档协作者"
            content={addCollaboratorsContent}
            trigger="click"
            open={popoverVisible}
            onOpenChange={handlePopoverChange}
        >
            <Tooltip placement="bottom" title="协作" color="purple">
                <div className={'editor_TB_BtnItem'}>
                    <i className="ri-user-add-line"></i>
                </div>
            </Tooltip>
        </Popover>
    );
};


interface DocumentMemberItemProps {
    id: string;
    role: string;
    email: string;
    username: string
}

interface DocumentMemberListProps {
    memberList: DocumentMemberItemProps[];
}
const TeamMembers = (props: DocumentMemberListProps) => {
    const {memberList} = props

    return (
        <div>
            {
                memberList.map(item => (
                    <TeamMemberItem
                        key={item.id}
                        id={item.id}
                        role={item.role}
                        email={item.email}
                        username={item.username}
                    />
                ))
            }
        </div>
    )
}
const TeamMemberItem = ({id, role, email, username}: DocumentMemberItemProps) => {

    return (
        <div className={'team_member_item'}>
            <div className={'team_member_item_Info'}>
                <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>U</Avatar>
                <div className={'team_member_item_Info_UE'}>
                    <div>{username}</div>
                    <div>{email}</div>
                </div>
                <div className={'team_member_item_Info_Role'}>{
                    role === 'owner' ? '可管理' :
                    role === 'read' ? '可阅读' :
                    role === 'edit' ? '可编辑' : '未知'
                }</div>
            </div>
        </div>
    )
}


export default CollaboratorPopover