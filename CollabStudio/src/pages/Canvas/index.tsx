import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { supabase } from "@/utils/supabaseClient.ts";
import { useParams } from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {Button, message, Result, Spin, Tag} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';

import './index.css'
import {useDocumentPermission} from "@/hooks/useDocumentPermission.ts";
import {useDispatch, useSelector} from "react-redux";
import {getDocumentItem} from "@/store/modules/documentItemStore.tsx";
const Canvas = () => {
    const { canvas_id } = useParams();
    const [status, setStatus] = useState(0); // 0加载最新状态，1已保存，2未保存，3保存中，-1保存错误
    const editorRef = useRef<any>(null); // 注意类型问题，用 any 简化
    const userId = useSelector(state => state.auth.user_id)
    const dispatch = useDispatch()
    const canvasData = useSelector(state => state.document_item.items);


    const { permission, loading: permissionLoading } = useDocumentPermission(canvas_id, userId);
    const [loading, setLoading] = useState<boolean>(false); //获取画布内容状态
    const [editorReady, setEditorReady] = useState(false);

    // 当 Tldraw 挂载完毕后，触发这个回调
    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
        setEditorReady(true);
        // ⬇️ 绑定 Ctrl+S 快捷键，只在挂载后绑定一次
        const handleKeyDown = async (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                await saveCanvas();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
    };

    // 获取画布内容
    const handleGetCanvas = async () => {
        if (canvas_id) {
            try {
                setLoading(true);
                await dispatch(getDocumentItem(canvas_id));
            } catch (error) {
                console.error("获取文档失败:", error);
                message.error(error.message)
            } finally {
                setLoading(false);
            }
        }
    };
    // 获取文章内容
    useEffect(() => {
        if (!permission) {
            return;
        }
        handleGetCanvas();
    }, [permission]);

    // 将数据库获取的添加至本地
    useEffect(() => {
        if (editorRef.current && canvasData?.content) {
            try {
                const snapshot = JSON.parse(canvasData.content);
                if (!snapshot.schema) {
                    throw new Error("快照缺少 schemaVersion！");
                }

                editorRef.current.loadSnapshot(snapshot);
            } catch (e) {
                console.error("🎨 加载画布数据失败:", e);
            }
        }
    }, [editorRef.current, canvasData]);



    // 保存画布内容
    const saveCanvas = async () => {
        if (!canvas_id || !editorRef.current) return;

        setStatus(3);

        try {
            const snapshot = editorRef.current.store.getSnapshot();

            if (!snapshot) {
                throw new Error("无法获取快照数据");
            }

            const content = JSON.stringify(snapshot);

            const { error } = await supabase
                .from("projects")
                .update({ content })
                .eq("id", canvas_id);

            if (error) {
                setStatus(-1);
                console.error("❌ 保存失败:", error);
            } else {
                setStatus(1);
                console.log("✅ 保存成功");
            }
        } catch (err) {
            setStatus(-1);
            console.error("保存失败（快照问题）:", err);
        }
    };




    return (
        <div className="canvas">
            {
                // 加载中统一处理
                (permissionLoading || loading) ? (
                    <Spin tip="加载中..." size="large" fullscreen/>
                ) : !permission ? (
                    <Result
                        status="warning"
                        title="抱歉，您无权限查看此笔记"
                        extra={
                            <Button type="primary" key="console">
                                返回
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div style={{position: "fixed", inset: 0}}>
                            <Tldraw
                                onMount={handleEditorMount}
                            />
                        </div>

                        <div className={'canvas_Status'}>
                            {
                                status === -1 && <Tag icon={<CloseCircleOutlined/>} color="error">保存失败</Tag> ||
                                status === 0 &&
                                <Tag icon={<ClockCircleOutlined/>} color="default">已加载至最新状态</Tag> ||
                                status === 1 && <Tag icon={<CheckCircleOutlined/>} color="success">已保存</Tag> ||
                                status === 2 && <Tag icon={<ExclamationCircleOutlined/>} color="warning">未保存</Tag> ||
                                status === 3 && <Tag icon={<SyncOutlined spin/>} color="processing">保存中</Tag>
                            }
                        </div>
                    </>
                )
            }

        </div>
    );
};

export default Canvas;
