import './index.scss'
import {TitleBox} from "@/pages/Recents";
import {Button, Dropdown, Form, Input, message, Modal, Table, Tooltip} from "antd";
import {useSelector} from "react-redux";
import {supabase} from "@/utils/supabaseClient.ts";
import {useEffect, useState} from "react";

interface memberProps {
    user_id: string,
    role: string,
    email: string,
    joined_at: string
}

const TeamMembers = () => {
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const [loading, setLoading] = useState(false)
    const [membersList, setMembersList] = useState<memberProps[]>([])
    const [open, setOpen] = useState<boolean>(false)

    const userEmail = useSelector(state => state.auth.email)
    const userRole = useSelector(state => state.teams.currentTeamRole)
    const getTeamMembers = async () => {
        if (!currentTeamId) return;

        setLoading(true)
        try {
            const {data, error} = await supabase
                .from('members_with_users')
                .select('user_id, role, email, joined_at')
                .eq('team_id', currentTeamId)

            if (error) {
                message.error(error.message)
                return;
            }

            setMembersList(data)

        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : '未知错误';
            message.error(msg);
        }
        finally {
            setLoading(false)
        }
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
            render: (text: string) => <span>{text}</span>,
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
                render: (_: any, record: memberProps) => {
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
    refreshMembers: () => void; // 👈 新增这一行
}
const AddMember = ({ open, onClose, refreshMembers }: addMemberProps) => {
    const [form] = Form.useForm();
    const [searchResultList, setSearchResultList] = useState<{ email: string; user_id: string }[]>([]);
    const [selectedUser, setSelectedUser] = useState<null | { email: string; user_id: string }>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const handleSearchInput = async (value: string) => {
        setSelectedUser(null); // 清除已选中项
        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(async () => {
            if (!value) {
                setSearchResultList([]);
                return;
            }

            setSearchLoading(true);
            try {
                const { data, error } = await supabase
                    .from('user_info')
                    .select('id, email')
                    .ilike('email', `%${value}%`);

                if (error) {
                    message.error('搜索出错，请重试');
                    setSearchResultList([]);
                } else {
                    setSearchResultList(data.map((item: any) => ({
                        email: item.email,
                        user_id: item.id
                    })));
                }
            } catch (err) {
                console.log(err);
                message.error('网络异常');
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        setDebounceTimer(timer);
    };

    const handleSelectUser = (user: { email: string, user_id: string }) => {
        form.setFieldsValue({ userEmail: user.email });
        setSelectedUser(user);
        setSearchResultList([]);
    };

    const handleOk = async () => {
        if (!selectedUser) {
            message.warning("请从列表中选择一个用户");
            return;
        }

        try {
            setSearchLoading(true)
            const { error } = await supabase.from('team_members').insert({
                team_id: currentTeamId,
                user_id: selectedUser.user_id,
                role: 'read',
            });

            if (error) {
                message.error(error.message);
            } else {
                message.success("成员添加成功！");
                form.resetFields();
                setSelectedUser(null);
                onClose();
                refreshMembers();
            }
            setSearchLoading(false)
        } catch (err) {
            console.log(err)
            message.error("添加失败，请重试");
            setSearchLoading(false)
        }
    };

    const closeOpen = () => {
        form.resetFields();
        setSearchResultList([]);
        setSelectedUser(null);
        onClose();
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
            <Form form={form} layout="vertical">
                <Form.Item
                    label="邮箱"
                    name="userEmail"
                    rules={[{ required: true, message: '请输入邮箱' }]}
                >
                    <Input
                        placeholder="请输入邮箱"
                        onChange={(e) => handleSearchInput(e.target.value)}
                    />
                </Form.Item>
            </Form>

            {searchResultList.length > 0 && (
                <div className="search-dropdown" style={{ border: '1px solid #ddd', borderRadius: 4, padding: 10 }}>
                    {searchResultList.map((user) => (
                        <div
                            key={user.user_id}
                            style={{ padding: '6px 8px', cursor: 'pointer' }}
                            onClick={() => handleSelectUser(user)}
                        >
                            {user.email}
                        </div>
                    ))}
                </div>
            )}

            {selectedUser && (
                <div style={{ marginTop: 10, color: 'green' }}>
                    ✅ 已选用户：{selectedUser.email}
                </div>
            )}
        </Modal>
    );
};



export default TeamMembers