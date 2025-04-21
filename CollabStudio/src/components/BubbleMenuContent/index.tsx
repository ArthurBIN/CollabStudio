import './index.scss';
import { BubbleMenu } from '@tiptap/react';
import React from 'react';
import { Dropdown, message, theme as antdTheme, ConfigProvider } from 'antd';
import { marked } from 'marked';  // 引入 marked
interface AIOption {
    label: string;
    prompt: string;
}

// 支持子菜单结构
const aiOptions: (AIOption | { label: string; children: AIOption[] })[] = [
    { label: '润色', prompt: '请对以下内容进行润色：' },
    { label: '扩写', prompt: '请扩写以下内容：' },
    { label: '总结', prompt: '请总结以下内容：' },
    {
        label: '翻译',
        children: [
            { label: '英文', prompt: '请将以下内容直接翻译为英文：' },
            { label: '法文', prompt: '请将以下内容直接翻译为法文：' },
            { label: '日文', prompt: '请将以下内容直接翻译为日文：' },
            { label: '韩文', prompt: '请将以下内容直接翻译为韩文：' },
        ],
    },
];

const BubbleMenuContent = ({ editor }) => {

    // 非流式
    const handleAIInteraction = async (option: AIOption) => {
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        );

        if (!selectedText) {
            message.warning('请先选中一段文本');
            return;
        }

        // 通过 message.loading 获取返回的实例
        const loadingMessage = message.loading('正在进行AI生成', 0); // 0 表示不自动关闭

        // 禁用编辑器交互
        editor.setEditable(false);
        try {

            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_MOONSHOT_KEY}`,
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k',
                    messages: [
                        { role: 'system', content: '你是一个擅长中文写作助手' },
                        { role: 'user', content: `${option.prompt}${selectedText}` },
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.statusText}`);
            }

            if (!response.body) throw new Error('无响应流');

            const data = await response.json();
            const fullText = data.choices?.[0]?.message?.content;

            if (fullText) {
                // 使用 marked 解析完整的文本内容
                const htmlContent = marked(fullText);
                // 插入处理过的 HTML 内容到编辑器
                editor.commands.insertContent(htmlContent);
            }

        } catch (err) {
            console.error('AI流式请求失败:', err);
            message.error(`AI 请求失败: ${err.message || '请稍后再试'}`);
        } finally {
            // 恢复编辑器交互
            editor.setEditable(true);
            loadingMessage();
        }
    };

    const items = aiOptions.map((option) => {
        if ('children' in option) {
            return {
                key: option.label,
                label: option.label,
                children: option.children.map((child) => ({
                    key: `${option.label}-${child.label}`,
                    label: child.label,
                    onClick: () => handleAIInteraction(child),
                })),
            };
        }

        return {
            key: option.label,
            label: option.label,
            onClick: () => handleAIInteraction(option),
        };
    });

    return (
        <div className="bubble_menu_content">
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                <div className="bubble-menu">
                    <ConfigProvider
                        theme={{
                            algorithm: antdTheme.darkAlgorithm,
                        }}
                    >
                        <Dropdown menu={{ items }} placement="bottomLeft" trigger={['click']}>
                            <div className={'bubble_AIBtn'}>
                                <div>
                                    <i className={'iconfont icon-zhinengyouhua'}></i>
                                    人工智能工具
                                    <i className="ri-arrow-down-s-line"></i>
                                </div>
                            </div>
                        </Dropdown>
                    </ConfigProvider>
                </div>
            </BubbleMenu>
        </div>
    );
};

export default BubbleMenuContent;
