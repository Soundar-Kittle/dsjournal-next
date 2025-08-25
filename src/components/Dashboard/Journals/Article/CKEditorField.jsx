// // components/CKEditorField.js
// import React from 'react';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // ✅ Correct source

// export default function CKEditorField({ value, onChange, placeholder }) {
//   return (
//     <div className="space-y-1">
//       <label className="font-medium text-sm">References</label>
//       <div className="border rounded-md p-2">
//         <CKEditor
//           editor={ClassicEditor}
//           data={value}
//           onChange={(event, editor) => {
//             const data = editor.getData();
//             onChange(data);
//           }}
//           config={{
//             toolbar: [
//               'undo', 'redo', '|',
//               'heading', '|',
//               'bold', 'italic', 'underline', '|',
//               'link', 'blockQuote', 'mediaEmbed',
//               'outdent', 'indent', 'removeFormat'
//             ],
//             placeholder: placeholder || 'Enter article references...',
//           }}
//         />
//       </div>
//     </div>
//   );
// }


// // components/CKEditorField.jsx
// import React, { useEffect, useState } from 'react';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// const LICENSE_KEY = 'GPL'; // Replace with your valid key from dashboard.ckeditor.com

// export default function CKEditorField({ value, onChange, placeholder = 'Type here...' }) {
//   const [isLayoutReady, setIsLayoutReady] = useState(false);

//   useEffect(() => {
//     setIsLayoutReady(true);
//     return () => setIsLayoutReady(false);
//   }, []);

//   const editorConfig = {
//     licenseKey: LICENSE_KEY,
//     toolbar: {
//       items: [
//         'undo', 'redo', '|',
//         'heading', '|',
//         'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
//         'bold', 'italic', 'underline', 'subscript', 'superscript', 'code', 'removeFormat', '|',
//         'specialCharacters', 'mediaEmbed', 'blockQuote', '|',
//         'outdent', 'indent'
//       ],
//       shouldNotGroupWhenFull: false
//     },
//     fontSize: {
//       options: [10, 12, 14, 'default', 16, 18, 20, 22, 24, 28, 32],
//       supportAllValues: true
//     },
//     fontFamily: {
//       supportAllValues: true
//     },
//     heading: {
//       options: [
//         { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
//         { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
//         { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
//         { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
//         { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
//         { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
//         { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
//       ]
//     },
//     placeholder
//   };

//   return (
//     <div className="space-y-1">
//       <label className="font-medium text-sm">References</label>
//       <div className="border rounded-md p-2">
//         {isLayoutReady && (
//           <CKEditor
//             editor={ClassicEditor}
//             data={value}
//             config={editorConfig}
//             onChange={(event, editor) => {
//               const data = editor.getData();
//               onChange(data);
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// components/CKEditorField.jsx
import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const LICENSE_KEY = "GPL";

export default function CKEditorField({ value, onChange, placeholder = "Type here..." }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); return () => setReady(false); }, []);

  const getProcessor = (editor) =>
    (editor?.data && (editor.data.htmlProcessor || editor.data.processor)) || null;

  const escapeHtml = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Parse html/plain → <ol>…</ol> (or null to skip)
  const toOrderedListHTML = (htmlOrText) => {
    if (!htmlOrText) return null;

    // Normalize to plain lines
    let text = htmlOrText
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/(p|div)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00A0|&nbsp;/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();

    const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    // Numbered & bullets
    const numRe    = /^\s*(?:\[(\d+)\]|(\d+)[\.\)]\s+)(.*)$/;     // [1]  / 1.  / 1)
    const bulletRe = /^\s*(?:[•\u2022\u00B7·\-\.])\s+(.*)$/;      // • · - .

    const items = [];
    let current = null;
    let hasNumericLabels = false;

    for (const line of lines) {
      const mn = line.match(numRe);
      if (mn) {
        hasNumericLabels = true;
        items.push({ n: Number(mn[1] || mn[2] || 0), text: (mn[3] || "").trim() });
        current = items[items.length - 1];
        continue;
      }
      const mb = line.match(bulletRe);
      if (mb) {
        items.push({ n: 0, text: (mb[1] || "").trim() });
        current = items[items.length - 1];
        continue;
      }
      // continuation of previous ref (wrapped line)
      if (current) {
        current.text += (current.text ? " " : "") + line;
      } else {
        // treat as a new item; we might auto-number later
        items.push({ n: 0, text: line });
        current = items[items.length - 1];
      }
    }
    if (items.length < 2) return null;

    if (hasNumericLabels) {
      const start = items.find((it) => it.n > 0)?.n || 1;
      const lis = items.map((it) => `<li>${escapeHtml(it.text)}</li>`).join("");
      return `<ol${start !== 1 ? ` start="${start}"` : ""}>${lis}</ol>`;
    }

    // No labels → auto-number if it "looks like references"
    const yearRe = /\b(19|20)\d{2}\b/;
    const hintRe = /(doi|crossref|google scholar|publisher|vol\.|no\.|pp\.|https?:\/\/)/i;
    const longCount = items.filter((it) => it.text.length >= 40).length;
    const refyCount = items.filter((it) => yearRe.test(it.text) || hintRe.test(it.text)).length;
    const looksLikeRefs =
      items.length >= 3 && (longCount / items.length >= 0.6 || refyCount / items.length >= 0.4);
    if (!looksLikeRefs) return null;

    const lis = items.map((it) => `<li>${escapeHtml(it.text)}</li>`).join("");
    return `<ol>${lis}</ol>`;
  };

  const editorConfig = {
    licenseKey: LICENSE_KEY,
    toolbar: {
      items: [
        "undo","redo","|","heading","|",
        "fontSize","fontFamily","fontColor","fontBackgroundColor","|",
        "bold","italic","underline","subscript","superscript","code","removeFormat","|",
        "numberedList","bulletedList","blockQuote","link","specialCharacters","mediaEmbed","|",
        "outdent","indent",
      ],
      shouldNotGroupWhenFull: false,
    },
    list: { properties: { styles: true, startIndex: true, reversed: false } },
    fontSize: { options: [10,12,14,"default",16,18,20,22,24,28,32], supportAllValues: true },
    fontFamily: { supportAllValues: true },
    heading: {
      options: [
        { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
        { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
        { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
        { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
        { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
        { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
        { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
      ],
    },
    placeholder,
  };

  return (
    <div className="space-y-2">
      <label className="font-medium text-sm">References</label>

      <div className="border rounded-md p-2">
        {ready && (
          <CKEditor
            editor={ClassicEditor}
            data={value || ""}
            config={editorConfig}
            onReady={(editor) => {
              const processor = getProcessor(editor);
              const toView = (html) => processor?.toView(html);

              // EARLY hook – catches plain text before CKEditor splits paragraphs
              editor.editing.view.document.on("clipboardInput", (evt, data) => {
                const html = data.dataTransfer.getData("text/html");
                const plain = !html && data.dataTransfer.getData("text/plain");
                const candidate = html || plain;
                const ol = toOrderedListHTML(candidate);
                if (!ol) return;
                // Replace content to be inserted
                data.content = toView(ol);
              });

              // LATE hook – safety net if above didn’t catch
              const pipeline = editor.plugins.get("ClipboardPipeline");
              pipeline.on("inputTransformation", (evt, data) => {
                // Only act if content is not already a list
                const currentHtml = (data.content && processor?.toData(data.content)) || "";
                if (/<ol|<ul/i.test(currentHtml)) return;

                const html = data.dataTransfer.getData("text/html");
                const plain = !html && data.dataTransfer.getData("text/plain");
                const candidate = html || plain;
                const ol = toOrderedListHTML(candidate);
                if (!ol) return;
                data.content = toView(ol);
              });
            }}
            onChange={(_, editor) => onChange(editor.getData())}
          />
        )}
      </div>
    </div>
  );
}
