import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import React, {useState} from "react";
import {handleGetTeamMembers} from "@/store/modules/teamMembersStore.tsx";
import {supabase} from "@/utils/supabaseClient.ts";
import {AutoComplete, Avatar, Dropdown, Empty, Input, message, Modal, Popover, Spin, Tooltip} from "antd";
import './index.scss'

const CollaboratorPopover = () => {
    const dispatch = useDispatch();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const { document_id } = useParams();
    const userId = useSelector(state => state.auth.user_id)

    const [popoverVisible, setPopoverVisible] = useState(false);

    // teamMembers
    const teamMembersList = useSelector(state => state.team_members.items);
    const loading = useSelector(state => state.team_members.loading)

    // 查询协作者信息文档
    const [options, setOptions] = useState([]);

    // 协作者集合
    const [collaboratorsList, setCollaboratorsList] = useState([])
    // 获取协作者信息文档状态
    const [collaboratorsLoading, setCollaboratorsLoading] = useState<boolean>(false)


    const [inputValue, setInputValue] = useState('');

    // 获取文档团队成员信息
    const getTeamMembers = async () => {
        if (!currentTeamId) return;
        await dispatch(handleGetTeamMembers(currentTeamId));
    };
    const handlePopoverChange = (visible: boolean) => {
        setPopoverVisible(visible);
        if (visible) {
            getTeamMembers(); // 仅在Popover打开时调用
            handleGetCollaborators();
        }
    };

    // 获取协作者信息
    const handleGetCollaborators = async () => {
        try {
            if (!document_id) {
                message.error("文档 ID 无效");
                return;
            }
            setCollaboratorsLoading(true)

            const {data, error} = await supabase
                .from('project_collaborators')
                .select('id, user_id, permission, user_info:user_id(email, username)')
                .eq('project_id', document_id)

            if (error) {
                message.error(error.message)
                return;
            }
            setCollaboratorsList(data || []);

        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : '未知错误';
            message.error(msg);
        } finally {
            setCollaboratorsLoading(false)
        }
    }

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
    const handleAddCollaborators = async (email: string, user_id: string) => {
        // Modal.confirm({
        //     title: `确认邀请该用户？`,
        //     content: `您将邀请 ${email} 成为该文档的协作者，权限为只读（read）。`,
        //     okText: '确认',
        //     cancelText: '取消',
        //     onOk: async () => {
        //
        //     }
        // });
        try {
            const {data, error} = await supabase
                .from("project_collaborators")
                .insert([{
                    project_id: document_id,
                    user_id: user_id,
                    permission: 'read',
                    invited_by: userId
                }]);

            if (error) {
                console.error("添加协作者失败:", error);
                if (error.code === '23505') {
                    message.error("该用户已经添加为该文档协作者")
                } else {
                    message.error(error.message)
                }

            } else {
                console.log("协作者添加成功:", data);
                await handleGetCollaborators();
                message.success("邀请成功")
            }
        } catch (err) {
            console.error("添加协作者异常:", err);
            message.error("发生错误")
        }
    };


    const addCollaboratorsContent = (
        <div>
            <AutoComplete
                popupMatchSelectWidth={252}
                style={{width: 400}}
                options={options}
                value={inputValue}
                onChange={setInputValue}
                onSelect={(value) => {
                    const selectedOption = options.find(option => option.value === value);
                    if (selectedOption && !selectedOption.disabled) {
                        handleAddCollaborators(selectedOption.value, selectedOption.user_id);
                    }
                    setInputValue(''); // 清空输入
                }}

                onSearch={handleCollaboratorsSearch}
                size="large"
            >
                <Input size="middle" placeholder="输入用户邮箱邀请协作"/>
            </AutoComplete>
            <div className={'team_member_Title'}>文档协作者</div>

            <LoadingWrapper loading={collaboratorsLoading}>
                <DocumentCollaborators
                    collaboratorsList={collaboratorsList}
                    onUpdateCollaborators={handleGetCollaborators}
                />
            </LoadingWrapper>

            <div className={'team_member_Title'}>文档团队成员</div>
            <LoadingWrapper loading={loading}>
                <TeamMemberList  memberList={teamMembersList}/>
            </LoadingWrapper>
        </div>
    );


    return (
        <Popover
            placement="bottomRight"
            title="添加协作者"
            content={addCollaboratorsContent}
            trigger="click"
            arrow={false}
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

// 协作者内容
interface DocumentCollaboratorsItemProps {
    id: string;
    permission: string;
    user_info: {
        email: string,
        username: string
    }
    onUpdateCollaborators: () => void;
}
interface DocumentCollaboratorsListProps {
    collaboratorsList: DocumentCollaboratorsItemProps[];
    onUpdateCollaborators: () => void;
}

const DocumentCollaborators = (props: DocumentCollaboratorsListProps) => {
    const {collaboratorsList, onUpdateCollaborators} = props;

    return (
        <div>
            {
                collaboratorsList.length > 0 ?
                    (
                        <>
                            {collaboratorsList.map(item => (
                                <DocumentCollaboratorsItem
                                    key={item.id}
                                    id={item.id}
                                    permission={item.permission}
                                    user_info={item.user_info}
                                    onUpdateCollaborators={onUpdateCollaborators}
                                />
                            ))}
                        </>
                    ) :
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                暂无协作者
                            </div>
                        }
                    />
            }

        </div>
    );
};

const DocumentCollaboratorsItem = ({id, permission, user_info, onUpdateCollaborators}: DocumentCollaboratorsItemProps) => {
    const myUserName = useSelector(state => state.auth.username)

    const dropdownItems = permission === 'read'
        ? [{ label: '可编辑', key: '1' },{ label: '移除', key: '-1', danger: true,}]
        : [{ label: '可阅读', key: '0' },{ label: '移除', key: '-1', danger: true,}];

    const handleEditCollaboratorsPermission = async ({ key }: { key: string }) => {
        if (key === '-1') {
            const { error } = await supabase
                .from('project_collaborators')
                .delete()
                .eq('id', id);

            if (error) {
                message.error(`移除失败：${error.message}`);
            } else {
                message.success('协作者已移除');
                await onUpdateCollaborators()
            }
        } else {
            const newPermission = key === '0' ? 'read' : 'edit';
            const { error } = await supabase
                .from('project_collaborators')
                .update({ permission: newPermission })
                .eq('id', id);

            if (error) {
                message.error(`更新权限失败：${error.message}`);
            } else {
                message.success('权限已更新');
                await onUpdateCollaborators()
            }
        }
    };


    return (
        <div className={'team_member_item'}>
            <div className={'team_member_item_Info'}>
                <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>
                    {user_info.email.charAt(0)}
                </Avatar>
                <div className={'team_member_item_Info_UE'}>
                    <div>{user_info.username === myUserName ? '我' : user_info.username}</div>
                    <div>{user_info.email}</div>
                </div>
                <Dropdown
                    menu={{
                        items: dropdownItems,
                        onClick: handleEditCollaboratorsPermission,
                    }}
                    trigger={['click']}
                >
                    <div className={'team_member_item_Info_Role'}>
                        {
                            permission === 'read' ? '可阅读' :
                            permission === 'edit' ? '可编辑' : '未知'
                        }
                        <i className="ri-arrow-down-s-line"></i>
                    </div>
                </Dropdown>

            </div>
        </div>
    )
}

interface TeamMemberItemProps {
    id: string;
    user_id: string;
    role: string;
    email: string;
    joined_at: string;
    username: string
}

interface TeamMemberListProps {
    memberList: TeamMemberItemProps[]
}
const TeamMemberList = ({memberList}: TeamMemberListProps) => {
    const myUserName = useSelector(state => state.auth.username)

    return (
        <div style={{marginTop: 10}}>
            <Avatar.Group>
                {
                    memberList.map(item => (
                        <Tooltip key={item.id} title={item.username === myUserName ? '我' : item.username} placement="top">
                            <Avatar
                                style={{ backgroundColor: '#f56a00', cursor: "pointer" }}
                            >
                                {item.email.charAt(0)}
                            </Avatar>
                        </Tooltip>
                    ))
                }

            </Avatar.Group>
        </div>
    )
}
const LoadingWrapper = ({ loading, children }) => {
    return loading ? <div className={'team_member_Loading'}><Spin/></div> : children;
};

export default CollaboratorPopover