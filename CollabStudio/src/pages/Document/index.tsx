import React, {useEffect, useRef, useState} from 'react'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from "@/components/Menu/MenuBar.tsx";
import { useParams } from "react-router-dom";
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { debounce } from "lodash";

import './index.scss';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/store";
import {getDocumentItem} from "@/store/modules/documentItemStore.tsx";
import {supabase} from "@/utils/supabaseClient.ts";

const Document = () => {
    const { document_id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const documentData = useSelector(state => state.document_item.items);
    const [status, setStatus] = useState("未保存");
    const email = useSelector(state => state.auth.email)
    // 1️⃣ 使用 useRef() 让 ydoc 和 provider 只初始化一次
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    if (!ydocRef.current) {
        ydocRef.current = new Y.Doc();
        providerRef.current = new WebsocketProvider('ws://localhost:1234', document_id, ydocRef.current);
    }

    // 3️⃣ 初始化 Tiptap 编辑器
    const editor = useEditor({
        extensions: [
            StarterKit.configure(),
            Placeholder.configure({ placeholder: '请输入内容...' }),
            Highlight,
            TaskList,
            TaskItem,
            CharacterCount.configure({ limit: 10000 }),

            // ➕ 添加协作功能
            Collaboration.configure({ document: ydocRef.current }),

            // ➕ 显示用户光标
            CollaborationCursor.configure({ provider: providerRef.current })
        ],
    });
    useEffect(() => {
        handleGetDocument();
    }, []);

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(documentData.content);
        }
    }, [documentData, editor]);

    const handleGetDocument = async () => {
        if (document_id) {
            await dispatch(getDocumentItem(document_id));
        }
    };
    // 2️⃣ 获取协作文本状态（只初始化一次）
    useEffect(() => {
        const awareness = providerRef.current?.awareness;
        if (awareness) {
            awareness.setLocalStateField('user', {
                name: email || "匿名用户", // 避免空值
                color: `hsl(${Math.random() * 360}, 100%, 75%)`
            });
        }
    }, [documentData.user_info]); // 监听变化

    useEffect(() => {
        const provider = providerRef.current;
        if (provider) {
            provider.connect(); // 只在初始化时连接
        }

        return () => {
            provider?.disconnect(); // 组件卸载时断开连接，减少 WebSocket 负担
        };
    }, []);



    // 4️⃣ 仅在编辑器初始化后聚焦一次，避免重复 focus() 导致卡顿
    useEffect(() => {
        if (editor && !editor.isFocused) {
            editor.commands.focus();
        }
    }, [editor]);

    // 1️⃣ 自动保存（防抖）
    const saveDocument = useRef(
        debounce(async (content) => {
            if (!document_id) return;

            const { error } = await supabase
                .from("projects")
                .update([{ content: content }])
                .eq('id', document_id); // 🔄 存储内容

            if (error) {
                setStatus("保存失败");
                console.error("保存失败", error);
            } else {
                setStatus("已保存");
            }
        }, 3000)
    ).current;

    useEffect(() => {
        if (!editor) return;
        editor.on("update", () => {
            setStatus("正在保存中...");
            saveDocument(editor.getHTML());
        });
    }, [editor]);

    return (
        <div className="editor">
            <div className={'editor_TitileBar'}>
                <div className={'editor_TB_Title'}>
                    {documentData.title}
                </div>
                <div className={'editor_TB_Status'}>
                    <i className="ri-cloud-line"></i>
                    {status}
                </div>
            </div>
            {editor && <MenuBar editor={editor}/>}
            {/*<p>{status}</p>*/}
            <EditorContent className="editor__content" editor={editor}/>
        </div>
    )
};

export default Document;
