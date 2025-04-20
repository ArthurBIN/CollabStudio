import React, { useEffect, useRef, useState } from 'react'
import { BubbleMenu, EditorContent } from '@tiptap/react'
import MenuBar from "@/components/Menu/MenuBar.tsx"
import { useParams } from "react-router-dom"
import { debounce } from "lodash"

import './index.scss'
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "@/store"
import { getDocumentItem } from "@/store/modules/documentItemStore.tsx"
import { supabase } from "@/utils/supabaseClient.ts"
import { useDocumentPermission } from "@/hooks/useDocumentPermission.ts"
import { useCollaborativeEditor } from "@/hooks/useCollaborativeEditor.ts"
import {Button, ConfigProvider, Result, Spin, theme as antdTheme} from "antd"
import CollaboratorPopover from "@/components/CollaboratorPopover"
import BubbleMenuContent from "@/components/BubbleMenuContent";

const Document = () => {
    const { document_id } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const documentData = useSelector(state => state.document_item.items)
    const email = useSelector(state => state.auth.email)
    const userId = useSelector(state => state.auth.user_id)

    const [status, setStatus] = useState("未保存")
    const [hasInitializedContent, setHasInitializedContent] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true) // ✅ 统一初始化状态

    const { permission, loading: permissionLoading } = useDocumentPermission(document_id, userId)
    const { editor } = useCollaborativeEditor({
        permission,
        docId: document_id,
        user: { email }
    })

    const saveDocument = useRef(
        debounce(async (content) => {
            if (!document_id) return

            const { error } = await supabase
                .from("projects")
                .update([{ content }])
                .eq("id", document_id)

            if (error) {
                setStatus("保存失败")
                console.error("保存失败", error)
            } else {
                setStatus("已保存")
            }
        }, 3000)
    ).current

    // 获取文档内容
    useEffect(() => {
        if (permissionLoading) return

        const load = async () => {
            if (!document_id) return
            if (!permission) {
                // 没权限，直接结束 loading 状态
                setIsInitializing(false)
                return
            }
            try {
                await dispatch(getDocumentItem(document_id))
                setHasInitializedContent(true)
            } catch (err) {
                console.error("获取文档失败:", err)
            } finally {
                setIsInitializing(false)
            }
        }

        load()
    }, [permissionLoading, permission])


    // 初始化设置文档内容（仅执行一次）
    useEffect(() => {
        if (
            editor &&
            documentData.content &&
            hasInitializedContent
        ) {
            editor.commands.setContent(documentData.content)
        }
    }, [documentData, editor, hasInitializedContent])

    // 自动保存逻辑
    useEffect(() => {
        if (!editor || permission === "read" || !hasInitializedContent) return

        const updateHandler = () => {
            setStatus("正在保存中...")
            saveDocument(editor.getHTML())
        }

        editor.on("update", updateHandler)

        return () => {
            editor.off("update", updateHandler)
        }
    }, [editor, hasInitializedContent, permission])

    return (
        <div className="editor">
            {
                isInitializing ? (
                    <Spin tip="加载中..." size="large" fullscreen />
                ) : !permission ? (
                    <ConfigProvider
                        theme={{
                            algorithm: antdTheme.darkAlgorithm,
                        }}
                    >
                        <Result
                            status="warning"
                            title="抱歉，您无权限查看此笔记"
                            extra={<Button type="primary">返回</Button>}
                        />
                    </ConfigProvider>
                ) : (
                    <>
                        {/* 标题栏 */}
                        <div className="editor_TitileBar">
                            <div className="editor_TB_Title">
                                {documentData.title}
                            </div>
                            {
                                permission !== 'read' &&
                                <div className="editor_TB_Status">
                                    <i className="ri-cloud-line"></i>
                                    {status}
                                </div>
                            }

                            {
                                permission === 'owner' &&
                                <div className="editor_TB_Btn">
                                    <CollaboratorPopover />
                                </div>
                            }
                        </div>

                        {/* 工具栏 */}
                        {
                            editor && (permission === 'edit' || permission === 'owner') &&
                            <MenuBar editor={editor} />
                        }

                        {/* 气泡菜单 */}
                        {
                            editor &&
                            hasInitializedContent &&
                            editor.view &&
                            editor.state?.doc?.content?.size > 0 &&
                            <BubbleMenuContent editor={editor} />
                        }

                        {/* 编辑器内容 */}
                        <EditorContent className="editor__content" editor={editor} />
                    </>
                )
            }
        </div>
    )
}

export default Document
