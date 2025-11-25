"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

/** Tiny wrapper so you can drop <TiptapEditor value onChange /> anywhere */
export default function TiptapEditor({ value = "", onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[120px] p-2",
      },
    },
    // 👇 prevent hydration errors in Next.js SSR
    injectCSS: false,
    autofocus: false,
    editable: true,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border rounded">
      <EditorContent editor={editor} />
    </div>
  );
}
