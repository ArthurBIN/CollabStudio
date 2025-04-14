import React, {useEffect, useRef, useState} from 'react'
import { EditorContent } from '@tiptap/react'
import MenuBar from "@/components/Menu/MenuBar.tsx";
import { useParams } from "react-router-dom";
import { debounce } from "lodash";

import './index.scss';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {getDocumentItem} from "@/store/modules/documentItemStore.tsx";
import {supabase} from "@/utils/supabaseClient.ts";
import {useDocumentPermission} from "@/hooks/useDocumentPermission.ts";
import {useCollaborativeEditor} from "@/hooks/useCollaborativeEditor.ts";
import {Spin} from "antd";
import CollaboratorPopover from "@/components/CollaboratorPopover";

const Document = () => {
    const { document_id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const documentData = useSelector(state => state.document_item.items);
    const [status, setStatus] = useState("未保存");
    const email = useSelector(state => state.auth.email)
    const userId = useSelector(state => state.auth.user_id)

    // 监测页面是否完成初始化
    const [hasInitializedContent, setHasInitializedContent] = useState(false);

    const { permission, loading: permissionLoading } = useDocumentPermission(document_id, userId);
    const [loading, setLoading] = useState<boolean>(true);
    // 使用自定义的 hook 来初始化编辑器
    const { editor } = useCollaborativeEditor({
        permission,
        docId: document_id,
        user: { email }
    });
    const handleGetDocument = async () => {
        if (document_id) {
            try {
                setLoading(true);
                await dispatch(getDocumentItem(document_id));
                setHasInitializedContent(true);
            } catch (error) {
                console.error("获取文档失败:", error);
            } finally {
                setLoading(false);
            }
        }
    };
    // 获取文章内容
    useEffect(() => {
        handleGetDocument();
    }, []);

    // 编辑文档内容
    useEffect(() => {
        if (
            editor &&
            documentData.content &&
            hasInitializedContent
        ) {
            editor.commands.setContent(documentData.content);
        }
    }, [documentData, editor]);


    // 自动保存
    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            if (!hasInitializedContent) return;
            setStatus("正在保存中...");
            saveDocument(editor.getHTML());
        };

        editor.on("update", updateHandler);

        return () => {
            editor.off("update", updateHandler);
        };
    }, [editor, hasInitializedContent]);
    const saveDocument = useRef(
        debounce(async (content) => {
            if (!document_id) return;

            const { error } = await supabase
                .from("projects")
                .update([{ content }])
                .eq('id', document_id);

            if (error) {
                setStatus("保存失败");
                console.error("保存失败", error);
            } else {
                setStatus("已保存");
            }
        }, 3000)
    ).current;

    return (
        <div className="editor">
            {
                // 加载中统一处理
                (permissionLoading || loading) ? (
                    <Spin tip="Loading..." size="large" fullscreen/>
                ) : permission !== 'owner' && permission !== 'edit' && permission !== 'view' ? (
                    // 无权限提示
                    <div className="editor_NoPermission">
                        <h2>您没有权限访问该文档</h2>
                    </div>
                ) : (
                    <>
                        {/* 标题栏 */}
                        <div className={'editor_TitileBar'}>
                            <div className={'editor_TB_Title'}>
                                {documentData.title}
                            </div>
                            <div className={'editor_TB_Status'}>
                                <i className="ri-cloud-line"></i>
                                {status}
                            </div>
                            <div className={'editor_TB_Btn'}>
                                <CollaboratorPopover />
                            </div>

                        </div>

                        {/* 工具栏 */}
                        {editor && (permission === 'edit' || permission === 'owner') && <MenuBar editor={editor}/>}

                        {/* 内容区域 */}
                        <EditorContent className="editor__content" editor={editor}/>
                    </>
                )
            }
        </div>
    );

};

export default Document;
