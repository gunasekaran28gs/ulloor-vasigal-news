"use client";

import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";

type EditorProps = {
  content?: any;
  onChange: (html: string, json: any) => void;
};

export default function Editor({ content, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your story…" }),
    ],
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose-article min-h-[300px] focus:outline-none px-4 py-3",
      },
    },
  });

  async function handleImageFile(file: File, editorInstance: TiptapEditor) {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));

    setUploading(false);

    if (!res.ok) {
      alert(data.error || "Image upload failed.");
      return;
    }

    editorInstance.chain().focus().setImage({ src: data.url }).run();
  }

  if (!editor) return null;

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const setLink = () => {
    const url = window.prompt("Link URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-2 bg-gray-50 rounded-t-md">
        <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</ToolbarBtn>
        <ToolbarBtn onClick={addImage}>{uploading ? "Uploading…" : "Image"}</ToolbarBtn>
        <ToolbarBtn active={editor.isActive("link")} onClick={setLink}>Link</ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file, editor);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded ${
        active ? "bg-red-700 text-white" : "bg-white border border-gray-300 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
