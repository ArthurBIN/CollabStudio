// 判断文档是否有权限

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

type Permission = 'owner' | 'edit' | 'read' | null;

export const useDocumentPermission = (documentId: string | undefined, userId: string | undefined) => {
    const [permission, setPermission] = useState<Permission>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!documentId || !userId) return;

        const fetchPermission = async () => {
            setLoading(true);

            // Step 1: 获取文档信息
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("id, team_id")
                .eq("id", documentId)
                .single();

            if (projectError || !project) {
                console.error("获取文档信息失败", projectError);
                setPermission(null);
                setLoading(false);
                return;
            }
            // Step 2: 是不是文档创建者（owner）
            // if (project.created_by === userId) {
            //     setPermission("owner");
            //     setLoading(false);
            //     return;
            // }

            // Step 3: 检查是否是协作者
            const { data: collaborator, error: collaboratorError } = await supabase
                .from("project_collaborators")
                .select("permission")
                .eq("project_id", documentId)
                .eq("user_id", userId)
                .maybeSingle();

            if (collaboratorError) {
                console.error("获取协作者权限失败", collaboratorError);
                setPermission(null);
                setLoading(false);
                return;
            }

            if (collaborator) {
                setPermission(collaborator.permission as Permission);
                setLoading(false);
                return;
            }

            // Step 4: 检查是否是团队成员（可选逻辑）
            const { data: teamMember } = await supabase
                .from("team_members")
                .select('*')
                .eq("team_id", project.team_id)
                .eq("user_id", userId)
                .maybeSingle();

            if (teamMember) {
                // 默认团队成员有 read 权限（也可以做配置化）
                setPermission(teamMember.role);
            } else {
                setPermission(null); // 非团队成员也不是协作者
            }

            setLoading(false);
        };

        fetchPermission();
    }, [documentId, userId]);

    return { permission, loading };
};
