import './index.scss'
import { useEffect } from "react";
import { getDocumentsAndCanvases } from "@/store/modules/documentsStore.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { Table, Button } from "antd";

const AllProjects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const loading = useSelector(state => state.documents.loading);
    const items = useSelector(state => state.documents.items);

    useEffect(() => {
        if (currentTeamId) {
            dispatch(getDocumentsAndCanvases(currentTeamId));
        }
    }, [currentTeamId, dispatch]);

    // 定义 Table 列
    const columns = [
        {
            title: "标题",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "创建者",
            dataIndex: "created_by_email",
            key: "created_by_email",
        },
        {
            title: "最后修改",
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

    return (
        <div className={'allprojects_All'}>
            <div className={'allprojects_Topic'}>
                所有项目
            </div>
            <div className="allprojects_List">
                <Table
                    columns={columns}
                    dataSource={items}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default AllProjects;
