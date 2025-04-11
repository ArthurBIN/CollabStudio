import './index.scss'
import {useEffect, useState} from "react";
import {Empty, Typography} from "antd";
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

    useEffect(() => {
        if (currentTeamId) {
            dispatch(getDocumentsAndCanvases(currentTeamId));
        }
    }, [currentTeamId, dispatch]);

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