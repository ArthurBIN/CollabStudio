import {Form, Input, message, Modal} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {addNewCanvas, getDocumentsAndCanvases} from "@/store/modules/documentsStore.tsx";
import {useState} from "react";

interface Props {
    open: boolean
    onClose: () => void;
}
const AddCanvas = ({open, onClose}: Props) => {
    const [form_addCanvas] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector(state => state.auth.user_id)
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const [confirmLoading_Canvas, setConfirmLoading_Canvas] = useState(false);

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
            closeOpen()
            setConfirmLoading_Canvas(false);
            form_addCanvas.resetFields();
        }
    };

    const closeOpen = () => {
        form_addCanvas.resetFields();
        onClose();  // 调用父组件传入的方法关闭弹窗
    }

    return (
        <>
            <Modal
                title="新建画布"
                open={open}
                onOk={handleCreateCanvasOk}
                confirmLoading={confirmLoading_Canvas}
                onCancel={closeOpen}
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
        </>
    )
}

export default AddCanvas