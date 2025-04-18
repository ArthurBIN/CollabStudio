import './index.scss'
import {useEffect, useState} from "react";
import {Button, Empty, Table} from "antd";
import {useDispatch, useSelector} from "react-redux";
import AddDocument from "@/components/AddDocument";
import AddCanvas from "@/components/AddCanvas";
import {getCollaborationNote} from "@/store/modules/collaborationNoteStore.tsx";
import {Type} from "@/components/NoteItem";
import {useNavigate} from "react-router-dom";

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
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const userId = useSelector(state => state.auth.user_id)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // 所有协作笔记
    const collaborationNotes = useSelector(state => state.collaboration_note.items);
    const collaborationNotesLoading = useSelector(state => state.collaboration_note.loading);


    useEffect(() => {
        getCollaborationNotes()
    }, []);
    
    const getCollaborationNotes = async () => {
        await dispatch(getCollaborationNote(userId))
    }

    // 表格列
    const collaborationNotesColumns = [
        {
            title: '类型',
            dataIndex: ['projects', 'type'],
            key: 'type',
            width: 60,
            render: (text: string) => <Type type={text} />
        },
        {
            title: '标题',
            dataIndex: ['projects', 'title'],
            key: 'title',
            render: (_, record) => {
                const handleTitle = () => {
                    if (record.projects.type === "document") {
                        navigate(`/document/${record.project_id}`)
                    }
                }
                return (
                    <>
                        <Button
                            color="primary"
                            variant="link"
                            onClick={handleTitle}
                            style={{padding: 0}}
                        >
                            {record.projects.title}
                        </Button>
                    </>
                )
            }
        },
        {
            title: '权限',
            dataIndex: 'permission',
            key: 'permission',
            render: (text: string) => text === 'edit' ? '可编辑' : '可阅读'
        },
        {
            title: '加入时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: string) => new Date(text).toLocaleString()
        }
    ];
    
    return (
        <div className={'recents'}>
            <TitleBox title={'开始'} />
            {
                currentTeamId ?
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
                    :
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="请先创建笔记本">
                    </Empty>
            }

            <div className={'recents_Collaboration'}>
                <div className={'recents_Collaboration_Title'}>协作笔记</div>
                <div className={'recents_Collaboration_Table'}>
                    <Table
                        dataSource={collaborationNotes}
                        columns={collaborationNotesColumns}
                        rowKey="id"
                        pagination={false}
                        loading={collaborationNotesLoading}
                    />
                </div>
            </div>


            {/*新建文档*/}
            <AddDocument open={openCreateDocument} onClose={() => setOpenCreateDocument(false)}/>
            {/*新建画布*/}
            <AddCanvas open={openCreateCanvas} onClose={() => setOpenCreateCanvas(false)}/>
        </div>

    )
}

export default Recents