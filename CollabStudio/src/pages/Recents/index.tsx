import './index.scss'
import {useEffect, useState} from "react";
import {Button, Empty, Table, Typography} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {getDocumentsAndCanvases} from "@/store/modules/documentsStore.tsx";
import AddDocument from "@/components/AddDocument";
import AddCanvas from "@/components/AddCanvas";

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

interface titleProp {
    title: string
}

export const TitleBox = ({title}: titleProp) => {
    return (
        <>
            <div className={'recents_Topic'}>
                {title}
            </div>
        </>
    )
}

const Recents = () => {
    const [openCreateDocument, setOpenCreateDocument] = useState(false);
    const [openCreateCanvas, setOpenCreateCanvas] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
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

    return (
        <div className={'recents_All'}>
            <TitleBox title={'开始'} />
            {
                currentTeamId ? (
                    <>
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
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Typography.Text>
                                    请先创建笔记本
                                </Typography.Text>
                            }
                        >
                        </Empty>
                    </>
                )
            }


            {/*新建文档*/}
            <AddDocument open={openCreateDocument} onClose={() => setOpenCreateDocument(false)} />
            {/*新建画布*/}
            <AddCanvas open={openCreateCanvas} onClose={() => setOpenCreateCanvas(false)} />
        </div>

    )
}

export default Recents