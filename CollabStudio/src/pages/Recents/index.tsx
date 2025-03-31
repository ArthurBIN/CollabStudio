import './index.scss'
import {useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, Table} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {addNewCanvas, addNewDocument, getDocumentsAndCanvases} from "@/store/modules/documentsStore.tsx";

interface CreateBtnProps {
    text: string;
    children: React.ReactNode;
    iconBgColor: string;
    handleClick?: () => void;
}

const CreateBtn = (props: CreateBtnProps) => {
    const { text, children,iconBgColor,  handleClick } = props

    return (
        <div className={'createbtn_All'} onClick={() => handleClick?.()}>
            <div
                className={'createbtn_Icon'}
                style={{ backgroundColor: iconBgColor }}
            >{children}</div>
            <div className={'createbtn_Text'}>{text}</div>
        </div>
    )
}

const Recents = () => {
    const [openCreateDocument, setOpenCreateDocument] = useState(false);
    const [openCreateCanvas, setOpenCreateCanvas] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmLoading_Canvas, setConfirmLoading_Canvas] = useState(false);
    const [form] = Form.useForm();
    const [form_addCanvas] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const userId = useSelector(state => state.auth.user_id)
    const items = useSelector(state => state.documents.items)
    const loading = useSelector(state => state.documents.loading)

    useEffect(() => {
        if (currentTeamId) {
            dispatch(getDocumentsAndCanvases(currentTeamId));
        }
    }, [currentTeamId, dispatch]);

    const columns = [
        {
            title: "标题",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "更新时间",
            dataIndex: "updated_at",
            key: "updated_at",
            render: (text) => text ? new Date(text).toLocaleString() : "暂无更新时间"
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleDetail(record)}>详情</Button>
                    <Button type="link" danger onClick={() => handleAction(record)}>操作</Button>
                </>
            )
        }
    ];

    // 处理详情点击事件
    const handleDetail = (record) => {
        console.log("查看详情：", record);
    };

    // 处理操作按钮点击事件
    const handleAction = (record) => {
        console.log("执行操作：", record);
    };

    // 点击新建文档的ok
    const handleCreateDocumentOk = async () => {
        try {
            const values = await form.validateFields(); // 获取表单数据
            setConfirmLoading(true);

            const res = await dispatch(
                addNewDocument({
                    userId,
                    docName: values?.docName,
                    teamId: currentTeamId,
                    docDesc: values?.docDesc,
                })
            ).unwrap();

            console.log(res);
            if (res.id) {
                message.success("创建成功！");
                // 触发获取文档列表，更新 UI
                dispatch(getDocuments(currentTeamId));
            }
        } catch (error) {
            console.error(error);
            message.error("创建文档失败！");
        } finally {
            setOpenCreateDocument(false);
            setConfirmLoading(false);
            form.resetFields();
        }
    };

    const handleCreateCanvasOk = async () => {
        try {
            const values = await form_addCanvas.validateFields(); // 获取表单数据
            setConfirmLoading_Canvas(true);

            const res = await dispatch(
                addNewCanvas({
                    userId,
                    canvasName: values?.canvasName,
                    teamId: currentTeamId,
                })
            ).unwrap();

            console.log(res);
            if (res.id) {
                message.success("创建成功！");
                // 触发获取文档列表，更新 UI
                dispatch(getDocumentsAndCanvases(currentTeamId));
            }
        } catch (error) {
            console.error(error);
            message.error("创建画布失败！");
        } finally {
            setOpenCreateCanvas(false);
            setConfirmLoading_Canvas(false);
            form_addCanvas.resetFields();
        }
    };

    return (
        <div className={'recents_All'}>
            <div className={'recents_Topic'}>
                最近
            </div>

            <div className={'recents_CreateBtn'}>
                <CreateBtn
                    text={'新建文档'}
                    iconBgColor={'#1677FF'}
                    handleClick={() => setOpenCreateDocument(true)}
                >
                    <i className={'iconfont icon-wenjian-L'}></i>
                </CreateBtn>
                <CreateBtn
                    text={'新建画布'}
                    iconBgColor={'#8D4BF6'}
                    handleClick={() => setOpenCreateCanvas(true)}
                >
                    <i className={'iconfont icon-huabi'}></i>
                </CreateBtn>
            </div>
            <div className="recents_List">
                <Table
                    columns={columns}
                    dataSource={items}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>


            {/*新建文档*/}
            <Modal
                title="新建文档"
                open={openCreateDocument}
                onOk={handleCreateDocumentOk}
                confirmLoading={confirmLoading}
                onCancel={() => setOpenCreateDocument(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="文档名称"
                        name="docName"
                        rules={[{required: true, message: '请输入文档名称'}]}
                    >
                        <Input placeholder="请输入文档名称"/>
                    </Form.Item>
                    <Form.Item
                        label="文档介绍"
                        name="docDesc"
                    >
                        <Input.TextArea placeholder="请输入文档介绍" rows={4}/>
                    </Form.Item>
                </Form>
            </Modal>
            {/*新建画布*/}
            <Modal
                title="新建画布"
                open={openCreateCanvas}
                onOk={handleCreateCanvasOk}
                confirmLoading={confirmLoading_Canvas}
                onCancel={() => setOpenCreateCanvas(false)}
            >
                <Form form={form_addCanvas} layout="vertical">
                    <Form.Item
                        label="画布名称"
                        name="canvasName"
                        rules={[{required: true, message: '请输入文档名称'}]}
                    >
                        <Input placeholder="请输入文档名称"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>

    )
}

export default Recents