import {Form, Input, message, Modal} from "antd";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {addNewDocument, getDocumentsAndCanvases} from "@/store/modules/documentsStore.tsx";

interface Props {
    open: boolean
    onClose: () => void;
}


const AddDocument = ({open, onClose}: Props) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector(state => state.auth.user_id)
    const currentTeamId = useSelector(state => state.teams.currentTeamId);

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
                closeOpen();
                setConfirmLoading(false);
                form.resetFields();
                // 触发获取文档列表，更新 UI
                dispatch(getDocumentsAndCanvases(currentTeamId));
            }
        } catch (error) {
            console.error(error);
            message.error("创建笔记失败！");
        }
    };

    const closeOpen = () => {
        form.resetFields();
        onClose();  // 调用父组件传入的方法关闭弹窗
    }

    return (
        <>
            <Modal
                title="新建笔记"
                open={open}
                onOk={handleCreateDocumentOk}
                confirmLoading={confirmLoading}
                onCancel={closeOpen}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="笔记名称"
                        name="docName"
                        rules={[{required: true, message: '请输入笔记名称'}]}
                    >
                        <Input placeholder="请输入笔记名称"/>
                    </Form.Item>
                    <Form.Item
                        label="笔记介绍"
                        name="docDesc"
                    >
                        <Input.TextArea placeholder="请输入笔记介绍" rows={4}/>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default AddDocument