"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autosave,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Link,
  AutoLink,
  Fullscreen,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Highlight,
  BlockQuote,
  Heading,
  CodeBlock,
  Indent,
  IndentBlock,
  Alignment,
  Style,
  GeneralHtmlSupport,
  List,
  TodoList,
  Table,
  TableToolbar,
  TableCaption,
  SourceEditing,
  HtmlComment,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

const LICENSE_KEY = "GPL";

export default function CKEditorField({ value = "", onChange, placeholder }) {
  const editorContainerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    return () => setIsReady(false);
  }, []);

  const editorConfig = useMemo(() => {
    if (!isReady) return {};

    return {
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "sourceEditing",
          "fullscreen",
          "|",
          "heading",
          "style",
          "|",
          "fontSize",
          "fontFamily",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "code",
          "|",
          "link",
          "insertTable",
          "highlight",
          "blockQuote",
          "codeBlock",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "todoList",
          "outdent",
          "indent",
        ],
        shouldNotGroupWhenFull: false,
      },
      plugins: [
        Alignment,
        AutoLink,
        Autosave,
        BlockQuote,
        Bold,
        Code,
        CodeBlock,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Fullscreen,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HtmlComment,
        Indent,
        IndentBlock,
        Italic,
        Link,
        List,
        Paragraph,
        SourceEditing,
        Strikethrough,
        Style,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableToolbar,
        TodoList,
        Underline,
      ],
      fontFamily: {
        supportAllValues: true,
      },
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 22],
        supportAllValues: true,
      },
      licenseKey: LICENSE_KEY,
      placeholder: placeholder || "Type or paste your content here…",
      htmlSupport: {
        allow: [
          {
            name: /^.*$/,
            styles: true,
            attributes: true,
            classes: true,
          },
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
    };
  }, [isReady, placeholder]);

  if (!isReady) {
    return (
      <div className="border border-gray-200 rounded-md p-3 text-gray-400 text-sm bg-gray-50">
        Loading editor…
      </div>
    );
  }

  return (
    <div
      ref={editorContainerRef}
      className="border rounded-md bg-white overflow-hidden"
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        onChange={(_, editor) => onChange?.(editor.getData())}
      />
    </div>
  );
}
