import './index.scss'
import {useEffect, useState} from "react";
import { getDocumentsAndCanvases } from "@/store/modules/documentsStore.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import NoteItem from "@/components/NoteItem";
import {Dropdown, Empty, Spin} from "antd";
import AddDocument from "@/components/AddDocument";
import AddCanvas from "@/components/AddCanvas";

const AllProjects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTeamId = useSelector(state => state.teams.currentTeamId);
    const loading = useSelector(state => state.documents.loading);
    const items = useSelector(state => state.documents.items);
    const currentTeamRole = useSelector(state => state.teams.currentTeamRole)
    const [openCreateDocument, setOpenCreateDocument] = useState(false);
    const [openCreateCanvas, setOpenCreateCanvas] = useState(false);


    useEffect(() => {
        if (currentTeamId) {
            dispatch(getDocumentsAndCanvases(currentTeamId));
        }
    }, [currentTeamId, dispatch]);

    const downItem = [
        {
            label: (
                <div onClick={() => setOpenCreateDocument(true)}>
                    新建笔记
                </div>
            ),
            key: '0',
        },
        {
            label: (
                <div onClick={() => setOpenCreateCanvas(true)}>
                    新建画布
                </div>
            ),
            key: '1',
        },
    ];
    return (
        <div className={'allprojects_All'}>
            <div className={'allprojects_Topic'}>
                所有笔记
                {
                    currentTeamRole !== "read" &&
                        <Dropdown menu={{ items: downItem }} trigger={['click']}>
                            <div className={'allprojects_Add'} onClick={(e) => e.preventDefault()}>
                                <i className="ri-add-line"></i>
                            </div>
                        </Dropdown>
                }



            </div>
            {
                loading ? (
                    <>
                        <div className={'allprojects_Loading'}>
                            <Spin />
                        </div>
                    </>
                ) : (
                    <>
                        {
                            items.length > 0 ? (
                                <>
                                    <div className="allprojects_List">
                                        {items.map(item =>
                                            <NoteItem
                                                title={item.title}
                                                type={item.type}
                                                key={item.id}
                                                created_by_email={item.user_info.email}
                                                created_by_username={item.user_info.username}
                                                updated_at={item.updated_at}
                                                id={item.id}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </>
                            )
                        }
                    </>
                )
            }

            {/*新建文档*/}
            <AddDocument open={openCreateDocument} onClose={() => setOpenCreateDocument(false)} />
            {/*新建画布*/}
            <AddCanvas open={openCreateCanvas} onClose={() => setOpenCreateCanvas(false)} />

        </div>
    );
};

export default AllProjects;
