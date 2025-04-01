import './index.scss'
import { useEffect } from "react";
import { getDocumentsAndCanvases } from "@/store/modules/documentsStore.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { Table, Button } from "antd";
import {useNavigate} from "react-router-dom";

interface iconType {
    type: string
}

const Type = (props: iconType) => {
    const { type } = props;

    return (
        <>
            {type === "document" ? (
                <div className={'type_All'} style={{ backgroundColor: "#1677FF" }}>
                    <i className={'iconfont icon-wenjian-L'}></i>
                </div>
            ) : type === "canvas" ? (
                <div className={'type_All'} style={{ backgroundColor: "#8D4BF6" }}>
                    <i className={'iconfont icon-huabi'}></i>
                </div>
            ) : null}
        </>
    );
};


const AllProjects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const loading = useSelector(state => state.documents.loading);
    const items = useSelector(state => state.documents.items);

    const storedAuth = JSON.parse(localStorage.getItem("sb-hwhmtdmefdcdhvqqmzgl-auth-token") || "{}");
    const userEmail = storedAuth?.user.email

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
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleTitle(record)}>{_}</Button>
                </>
            )
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
            width: 70,
            render: (type) => <Type type={type} />
        },
        {
            title: "创建者",
            dataIndex: "created_by_email",
            key: "created_by_email",
            render: (_, record) => (
                <>
                    {
                        _ === userEmail ? (
                            <>
                                我
                            </>
                        ) : (
                            <>
                                <Button type="link" onClick={() => handleCreater(record)}>{_}</Button>
                            </>
                        )
                    }
                </>
            )
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
            fixed: 'right',
            width: 170,
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

    // 处理点击文档
    const handleTitle = (record) => {
        console.log("执行操作：", record);
        if (record.type === "document") {
            navigate(`/document/${record.id}`)
        }
    }

    // 处理点击创建者
    const handleCreater = (record)  => {
        console.log("执行操作：", record);
    }

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
                    scroll={{x: '100vw', y: '450px'}}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default AllProjects;
