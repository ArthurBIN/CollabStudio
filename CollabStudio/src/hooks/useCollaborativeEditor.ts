import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const useCollaborativeEditor = ({ permission, docId, user }) => {
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    if (!ydocRef.current) {
        ydocRef.current = new Y.Doc();
        providerRef.current = new WebsocketProvider("ws://localhost:1234", docId, ydocRef.current);
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure(),
            Placeholder.configure({ placeholder: "请输入内容..." }),
            Highlight,
            TaskList,
            TaskItem,
            CharacterCount.configure({ limit: 10000 }),
            Collaboration.configure({ document: ydocRef.current }),
            CollaborationCursor.configure({ provider: providerRef.current })
        ],
        editable: false, // 初始化时不可编辑
    });

    // 监听 permission 变化来设置编辑器的可编辑状态
    useEffect(() => {
        if (editor && permission) {
            editor.setEditable(permission === "edit" || permission === "owner");
        }
    }, [editor, permission]);

    // 设置协作用户信息
    useEffect(() => {
        const awareness = providerRef.current?.awareness;
        if (awareness) {
            awareness.setLocalStateField("user", {
                name: user.email || "匿名用户",
                color: `hsl(${Math.random() * 360}, 100%, 75%)`,
            });
        }
    }, [user]);

    // 连接 WebSocket
    useEffect(() => {
        const provider = providerRef.current;
        if (provider) {
            provider.connect();
        }

        return () => {
            provider?.disconnect();
        };
    }, [docId]);

    return { editor };
};
