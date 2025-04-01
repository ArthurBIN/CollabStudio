import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { getDocumentItem } from "@/store/modules/documentItemStore.tsx";

import BulletList from '@tiptap/extension-bullet-list'
import Document1 from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import ListKeymap from '@tiptap/extension-list-keymap'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import './index.scss';


const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="control-group">
            <div className="button-group">
                <input
                    type="color"
                    onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                    value={editor.getAttributes('textStyle').color}
                    data-testid="setColor"
                />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                >
                    Toggle bullet list
                </button>
                <button
                    onClick={() => editor.chain().focus().splitListItem('listItem').run()}
                    disabled={!editor.can().splitListItem('listItem')}
                >
                    Split list item
                </button>
                <button
                    onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                    disabled={!editor.can().sinkListItem('listItem')}
                >
                    Sink list item
                </button>
                <button
                    onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                    disabled={!editor.can().liftListItem('listItem')}
                >
                    Lift list item
                </button>
            </div>
        </div>
    );
};

const Document = () => {
    const {document_id} = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const documentData = useSelector(state => state.document_item.items);
    const [isEditable, setIsEditable] = useState(true);

    const editor = useEditor({
        extensions: [
            Document1,
            Paragraph,
            Text,
            BulletList,
            ListItem,
            ListKeymap,
            TextStyle,
            Color.configure({ types: ['textStyle'] }) // 确保 Color 扩展应用到 textStyle
        ],
        content: `<p>加载中...</p>`,
        editable: isEditable,
    });


    useEffect(() => {
        handleGetDocument();
    }, []);

    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditable);
        }
    }, [isEditable, editor]);

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

    return (
        <div className="document_All">
            <h2>{documentData?.title || "加载中..."}</h2>
            <div>
                <label>
                    <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)}/> 可编辑
                </label>
            </div>
            <MenuBar editor={editor}/>
            <EditorContent editor={editor}/>
        </div>
    );
};

export default Document;
