import './index.scss'
import {TitleBox} from "@/pages/Recents";
import {AutoComplete, Button, Dropdown, Form, Input, message, Modal, Table, Tooltip} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {supabase} from "@/utils/supabaseClient.ts";
import React, {useEffect, useState} from "react";
import {handleGetTeamMembers} from "@/store/modules/teamMembersStore.tsx";

interface memberProps {
    user_id: string,
    role: string,
    email: string,
    joined_at: string,
    username: string
}

const TeamMembers = () => {
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const [open, setOpen] = useState<boolean>(false)

    // 获取teamMemberStore中的状态
    const loading = useSelector(state => state.team_members.loading)
    const membersList = useSelector(state => state.team_members.items)

    const dispatch = useDispatch()

    const userRole = useSelector(state => state.teams.currentTeamRole)
    const myName = useSelector(state => state.auth.username)
    const userEmail = useSelector(state => state.auth.email)

    const getTeamMembers = async () => {
        if (!currentTeamId) return;
        await dispatch(handleGetTeamMembers(currentTeamId))
    }

    useEffect(() => {
        getTeamMembers()
    }, [currentTeamId]);

    // 处理移除用户
    const handleRemove = async (member: memberProps) => {
        Modal.confirm({
            title: '确认移除成员？',
            content: `将移除 ${member.email} 的团队成员身份`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const { error } = await supabase
                        .from('team_members')
                        .delete()
                        .eq('user_id', member.user_id)
                        .eq('team_id', currentTeamId);

                    if (error) {
                        message.error('移除失败');
                    } else {
                        message.success('成员已移除');
                        await getTeamMembers();
                    }
                } catch (err) {
                    console.error(err);
                    message.error('移除失败');
                }
            },
        });
    };

    // 处理编辑用户权限
    const handleEditMemberRole = (key: string, record: memberProps) => {
        const downItem = [
            {
                label: "可阅读",
                key: '0',
            },
            {
                label: "可编辑",
                key: '1',
            },
        ];

        const roleKey = key === '0' ? 'read' : 'edit';
        Modal.confirm({
            title: '确认修改用户权限？',
            content: `将修改 ${record.email} 成员权限为 ${downItem[key].label}`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const {  error } = await supabase
                        .from('team_members')
                        .update({ role: roleKey })
                        .eq('user_id', record.user_id)
                        .eq('team_id', currentTeamId);

                    if (error) {
                        message.error('编辑失败');
                    } else {
                        message.success('编辑成功');
                        await getTeamMembers();
                    }
                } catch (err) {
                    console.error(err);
                    message.error('编辑失败');
                }
            },
        });

    };

    // 表格字段
    const columns = [
        {
            title: '用户',
            dataIndex: 'email',
            key: 'email',
            render: (_, record: memberProps) => (
                <>
                    {
                        record.username === myName ?
                            <Button
                                color="default"
                                variant="link"
                            >
                                我
                            </Button>
                            :
                            <Tooltip placement="top" title={record.email}>
                                <Button
                                    color="default"
                                    variant="link"
                                >
                                    {record.username}
                                </Button>
                            </Tooltip>
                    }
                </>
            )
        },
        {
            title: '权限',
            dataIndex: 'role',
            key: 'role',
            render: (text: string) => (
                <>
                    {
                        text === 'owner' && <div>可管理</div>
                    }
                    {
                        text === 'read' && <div>可阅读</div>
                    }
                    {
                        text === 'edit' && <div>可编辑</div>
                    }
                </>
            )
        },
        {
            title: '加入时间',
            dataIndex: 'joined_at',
            key: 'joined_at',
            render: (text) => text ? new Date(text).toLocaleString('zh-CN', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : "暂无加入时间"

        },
        ...(userRole === 'owner' ? [
            {
                title: '操作',
                key: 'operation',
                render: (_, record: memberProps) => {
                    if (userEmail === record.email) return null;

                    const dropdownItems = record.role === 'read'
                        ? [{ label: '可编辑', key: '1' }]
                        : [{ label: '可阅读', key: '0' }];

                    return (
                        <>
                            <Dropdown
                                menu={{
                                    items: dropdownItems,
                                    onClick: ({ key }) => handleEditMemberRole(key, record),
                                }}
                                trigger={['click']}
                            >
                                <Tooltip placement="top" title="编辑">
                                    <Button
                                        color="default"
                                        variant="link"
                                    >
                                        <i className="ri-edit-box-line" style={{ fontSize: 18 }}></i>
                                    </Button>
                                </Tooltip>
                            </Dropdown>

                            <Tooltip placement="top" title="移除">
                                <Button
                                    color="default"
                                    variant="link"
                                    onClick={() => handleRemove(record)}
                                >
                                    <i className="ri-delete-bin-line" style={{ fontSize: 18 }}></i>
                                </Button>
                            </Tooltip>
                        </>
                    );
                }

            }
        ] : [])

    ];

    return (
        <div className={'teammember_All'}>
            <TitleBox title={'成员管理'} />
            <div className={'teammember_Table'}>
                {
                    userRole === "owner" && (
                        <>
                            <div className={'teammember_AddBtn'}>
                                <Button onClick={() => setOpen(true)}>添加</Button>
                            </div>
                        </>
                    )
                }
                <Table
                    columns={columns}
                    dataSource={membersList}
                    rowKey="user_id"
                    // rowSelection={{ type: 'checkbox' }}
                    loading={loading}
                    pagination={false}
                />
            </div>

            {/*添加成员模态框*/}
            <AddMember
                open={open}
                onClose={() => setOpen(false)}
                refreshMembers={getTeamMembers}
            />


        </div>
    )
}


interface addMemberProps {
    open: boolean;
    onClose: () => void;
    refreshMembers: () => void;
}
const AddMember = ({ open, onClose, refreshMembers }: addMemberProps) => {
    const [searchLoading, setSearchLoading] = useState(false);
    const currentTeamId = useSelector(state => state.teams.currentTeamId);

    // 查询团队成员文档
    const [options, setOptions] = useState([]);

    // 团队成员
    const teamMembersList = useSelector(state => state.team_members.items)

    // 输入内容
    const [inputValue, setInputValue] = useState('');

    // 选中的userid
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleOk = async () => {
        if (!selectedUserId) {
            message.warning("请先选择一个用户邮箱");
            return;
        }

        try {
            setSearchLoading(true);
            const { error } = await supabase.from('team_members').insert({
                team_id: currentTeamId,
                user_id: selectedUserId,
                role: 'read',
            });

            if (error) {
                message.error(error.message);
            } else {
                message.success("成员添加成功！");
                onClose();
                setInputValue('');
                setSelectedUserId(null);
                setOptions(null)
                await refreshMembers();
            }
        } catch (err) {
            console.error(err);
            message.error("添加失败，请重试");
        } finally {
            setSearchLoading(false);
        }
    };


    const closeOpen = () => {
        onClose();
    };

    // 处理输入协作者邮箱查询逻辑
    const handleTeamMemberSearch = async (searchText: string) => {
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

    return (
        <Modal
            title="搜索邮箱添加"
            open={open}
            onOk={handleOk}
            onCancel={closeOpen}
            okText="添加"
            cancelText="取消"
            confirmLoading={searchLoading}
        >
            <AutoComplete
                popupMatchSelectWidth={252}
                style={{width: '100%'}}
                options={options}
                value={inputValue}
                onChange={(value, option) => {
                    setInputValue(value);
                    setSelectedUserId(option?.user_id || null);
                }}
                onSearch={handleTeamMemberSearch}
                size="large"
            >
                <Input size="middle" placeholder="输入用户邮箱邀请协作"/>
            </AutoComplete>

        </Modal>
    );
};



export default TeamMembers