import './index.scss'
import {BubbleMenu} from "@tiptap/react";
import React from "react";
import axios from "axios"

const BubbleMenuContent = ({ editor }) => {
    const [loading, setLoading] = React.useState(false)

    const handleAIInteraction = async () => {
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        )

        if (!selectedText) return

        setLoading(true)

        try {
            const response = await axios.post(
                "https://api.moonshot.cn/v1/chat/completions",
                {
                    model: "moonshot-v1-8k", // 或 v1-128k
                    messages: [
                        { role: "system", content: "你是一个擅长中文写作助手" },
                        { role: "user", content: `请对以下内容进行润色：${selectedText}` }
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${import.meta.env.VITE_MOONSHOT_KEY}`
                    }
                }
            )
            console.log(response)

            const reply = response.data.choices[0].message.content
            editor.commands.insertContent(`\nAI回复：${reply}\n`)
        } catch (err) {
            console.error("AI请求失败:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bubble_menu_content">
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                <div className="bubble-menu">
                    <button onClick={handleAIInteraction}>
                        {loading ? 'AI 处理中...' : '与 AI 对话'}
                    </button>
                </div>
            </BubbleMenu>
        </div>
    )
}


export default BubbleMenuContent