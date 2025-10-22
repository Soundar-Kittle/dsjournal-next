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
// import React, { useEffect, useState } from "react";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// const LICENSE_KEY = "GPL";

// export default function CKEditorField({ value, onChange, placeholder = "Type here..." }) {
//   const [ready, setReady] = useState(false);
//   useEffect(() => { setReady(true); return () => setReady(false); }, []);

//   const getProcessor = (editor) =>
//     (editor?.data && (editor.data.htmlProcessor || editor.data.processor)) || null;

//   const escapeHtml = (s) =>
//     String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

//   // Parse html/plain → <ol>…</ol> (or null to skip)
//   const toOrderedListHTML = (htmlOrText) => {
//     if (!htmlOrText) return null;

//     // Normalize to plain lines
//     let text = htmlOrText
//       .replace(/<!--[\s\S]*?-->/g, "")
//       .replace(/<\/(p|div)>/gi, "\n")
//       .replace(/<br\s*\/?>/gi, "\n")
//       .replace(/<[^>]+>/g, "")
//       .replace(/\u00A0|&nbsp;/g, " ")
//       .replace(/[ \t]+/g, " ")
//       .trim();

//     const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
//     if (lines.length < 2) return null;

//     // Numbered & bullets
//     const numRe    = /^\s*(?:\[(\d+)\]|(\d+)[\.\)]\s+)(.*)$/;     // [1]  / 1.  / 1)
//     const bulletRe = /^\s*(?:[•\u2022\u00B7·\-\.])\s+(.*)$/;      // • · - .

//     const items = [];
//     let current = null;
//     let hasNumericLabels = false;

//     for (const line of lines) {
//       const mn = line.match(numRe);
//       if (mn) {
//         hasNumericLabels = true;
//         items.push({ n: Number(mn[1] || mn[2] || 0), text: (mn[3] || "").trim() });
//         current = items[items.length - 1];
//         continue;
//       }
//       const mb = line.match(bulletRe);
//       if (mb) {
//         items.push({ n: 0, text: (mb[1] || "").trim() });
//         current = items[items.length - 1];
//         continue;
//       }
//       // continuation of previous ref (wrapped line)
//       if (current) {
//         current.text += (current.text ? " " : "") + line;
//       } else {
//         // treat as a new item; we might auto-number later
//         items.push({ n: 0, text: line });
//         current = items[items.length - 1];
//       }
//     }
//     if (items.length < 2) return null;

//     if (hasNumericLabels) {
//       const start = items.find((it) => it.n > 0)?.n || 1;
//       const lis = items.map((it) => `<li>${escapeHtml(it.text)}</li>`).join("");
//       return `<ol${start !== 1 ? ` start="${start}"` : ""}>${lis}</ol>`;
//     }

//     // No labels → auto-number if it "looks like references"
//     const yearRe = /\b(19|20)\d{2}\b/;
//     const hintRe = /(doi|crossref|google scholar|publisher|vol\.|no\.|pp\.|https?:\/\/)/i;
//     const longCount = items.filter((it) => it.text.length >= 40).length;
//     const refyCount = items.filter((it) => yearRe.test(it.text) || hintRe.test(it.text)).length;
//     const looksLikeRefs =
//       items.length >= 3 && (longCount / items.length >= 0.6 || refyCount / items.length >= 0.4);
//     if (!looksLikeRefs) return null;

//     const lis = items.map((it) => `<li>${escapeHtml(it.text)}</li>`).join("");
//     return `<ol>${lis}</ol>`;
//   };

//   const editorConfig = {
//     licenseKey: LICENSE_KEY,
//     toolbar: {
//       items: [
//         "undo","redo","|","heading","|",
//         "fontSize","fontFamily","fontColor","fontBackgroundColor","|",
//         "bold","italic","underline","subscript","superscript","code","removeFormat","|",
//         "numberedList","bulletedList","blockQuote","link","specialCharacters","mediaEmbed","|",
//         "outdent","indent",
//       ],
//       shouldNotGroupWhenFull: false,
//     },
//     list: { properties: { styles: true, startIndex: true, reversed: false } },
//     fontSize: { options: [10,12,14,"default",16,18,20,22,24,28,32], supportAllValues: true },
//     fontFamily: { supportAllValues: true },
//     heading: {
//       options: [
//         { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
//         { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
//         { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
//         { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
//         { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
//         { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
//         { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
//       ],
//     },
//     placeholder,
//   };

//   return (
//     <div className="space-y-2">
//       <label className="font-medium text-sm">References</label>

//       <div className="border rounded-md p-2">
//         {ready && (
//           <CKEditor
//             editor={ClassicEditor}
//             data={value || ""}
//             config={editorConfig}
//             onReady={(editor) => {
//               const processor = getProcessor(editor);
//               const toView = (html) => processor?.toView(html);

//               // EARLY hook – catches plain text before CKEditor splits paragraphs
//               editor.editing.view.document.on("clipboardInput", (evt, data) => {
//                 const html = data.dataTransfer.getData("text/html");
//                 const plain = !html && data.dataTransfer.getData("text/plain");
//                 const candidate = html || plain;
//                 const ol = toOrderedListHTML(candidate);
//                 if (!ol) return;
//                 // Replace content to be inserted
//                 data.content = toView(ol);
//               });

//               // LATE hook – safety net if above didn’t catch
//               const pipeline = editor.plugins.get("ClipboardPipeline");
//               pipeline.on("inputTransformation", (evt, data) => {
//                 // Only act if content is not already a list
//                 const currentHtml = (data.content && processor?.toData(data.content)) || "";
//                 if (/<ol|<ul/i.test(currentHtml)) return;

//                 const html = data.dataTransfer.getData("text/html");
//                 const plain = !html && data.dataTransfer.getData("text/plain");
//                 const candidate = html || plain;
//                 const ol = toOrderedListHTML(candidate);
//                 if (!ol) return;
//                 data.content = toView(ol);
//               });
//             }}
//             onChange={(_, editor) => onChange(editor.getData())}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, useRef, useMemo } from 'react';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import {
// 	ClassicEditor,
// 	Alignment,
// 	Autoformat,
// 	AutoLink,
// 	Autosave,
// 	BlockQuote,
// 	Bold,
// 	Code,
// 	Essentials,
// 	FindAndReplace,
// 	FontBackgroundColor,
// 	FontColor,
// 	FontFamily,
// 	FontSize,
// 	Fullscreen,
// 	GeneralHtmlSupport,
// 	Heading,
// 	Highlight,
// 	HorizontalLine,
// 	ImageEditing,
// 	ImageUtils,
// 	Indent,
// 	IndentBlock,
// 	Italic,
// 	Link,
// 	List,
// 	ListProperties,
// 	Paragraph,
// 	PasteFromOffice,
// 	RemoveFormat,
// 	SourceEditing,
// 	SpecialCharacters,
// 	SpecialCharactersArrows,
// 	SpecialCharactersCurrency,
// 	SpecialCharactersEssentials,
// 	SpecialCharactersLatin,
// 	SpecialCharactersMathematical,
// 	SpecialCharactersText,
// 	Strikethrough,
// 	Style,
// 	Subscript,
// 	Superscript,
// 	Table,
// 	TableCaption,
// 	TableCellProperties,
// 	TableColumnResize,
// 	TableProperties,
// 	TableToolbar,
// 	TextTransformation,
// 	TodoList,
// 	Underline
// } from 'ckeditor5';

// import 'ckeditor5/ckeditor5.css';


// /**
//  * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
//  */

// const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

// export default function CKEditorField({ value, onChange, placeholder = "Type here..." }) {
// 	const editorContainerRef = useRef(null);
// 	const editorRef = useRef(null);
// 	const [isLayoutReady, setIsLayoutReady] = useState(false);

// useEffect(() => {
//     setIsLayoutReady(true);
//     return () => setIsLayoutReady(false);
//   }, []);

//   const { editorConfig } = useMemo(() => {
//     if (!isLayoutReady) return {};

// 		return {
// 			editorConfig: {
// 				toolbar: {
// 					items: [
// 						'undo',
// 						'redo',
// 						'|',
// 						'sourceEditing',
// 						'findAndReplace',
// 						'fullscreen',
// 						'|',
// 						'heading',
// 						'style',
// 						'|',
// 						'fontSize',
// 						'fontFamily',
// 						'fontColor',
// 						'fontBackgroundColor',
// 						'|',
// 						'bold',
// 						'italic',
// 						'underline',
// 						'strikethrough',
// 						'subscript',
// 						'superscript',
// 						'code',
// 						'removeFormat',
// 						'|',
// 						'specialCharacters',
// 						'horizontalLine',
// 						'link',
// 						'insertTable',
// 						'highlight',
// 						'blockQuote',
// 						'|',
// 						'alignment',
// 						'|',
// 						'bulletedList',
// 						'numberedList',
// 						'todoList',
// 						'outdent',
// 						'indent'
// 					],
// 					shouldNotGroupWhenFull: false
// 				},
// 				plugins: [
// 					Alignment,
// 					Autoformat,
// 					AutoLink,
// 					Autosave,
// 					BlockQuote,
// 					Bold,
// 					Code,
// 					Essentials,
// 					FindAndReplace,
// 					FontBackgroundColor,
// 					FontColor,
// 					FontFamily,
// 					FontSize,
// 					Fullscreen,
// 					GeneralHtmlSupport,
// 					Heading,
// 					Highlight,
// 					HorizontalLine,
// 					ImageEditing,
// 					ImageUtils,
// 					Indent,
// 					IndentBlock,
// 					Italic,
// 					Link,
// 					List,
// 					ListProperties,
// 					Paragraph,
// 					PasteFromOffice,
// 					RemoveFormat,
// 					SourceEditing,
// 					SpecialCharacters,
// 					SpecialCharactersArrows,
// 					SpecialCharactersCurrency,
// 					SpecialCharactersEssentials,
// 					SpecialCharactersLatin,
// 					SpecialCharactersMathematical,
// 					SpecialCharactersText,
// 					Strikethrough,
// 					Style,
// 					Subscript,
// 					Superscript,
// 					Table,
// 					TableCaption,
// 					TableCellProperties,
// 					TableColumnResize,
// 					TableProperties,
// 					TableToolbar,
// 					TextTransformation,
// 					TodoList,
// 					Underline
// 				],
// 				fontFamily: {
// 					supportAllValues: true
// 				},
// 				fontSize: {
// 					options: [10, 12, 14, 'default', 18, 20, 22],
// 					supportAllValues: true
// 				},
// 				fullscreen: {
// 					onEnterCallback: container =>
// 						container.classList.add(
// 							'editor-container',
// 							'editor-container_classic-editor',
// 							'editor-container_include-style',
// 							'editor-container_include-fullscreen',
// 							'main-container'
// 						)
// 				},
// 				heading: {
// 					options: [
// 						{
// 							model: 'paragraph',
// 							title: 'Paragraph',
// 							class: 'ck-heading_paragraph'
// 						},
// 						{
// 							model: 'heading1',
// 							view: 'h1',
// 							title: 'Heading 1',
// 							class: 'ck-heading_heading1'
// 						},
// 						{
// 							model: 'heading2',
// 							view: 'h2',
// 							title: 'Heading 2',
// 							class: 'ck-heading_heading2'
// 						},
// 						{
// 							model: 'heading3',
// 							view: 'h3',
// 							title: 'Heading 3',
// 							class: 'ck-heading_heading3'
// 						},
// 						{
// 							model: 'heading4',
// 							view: 'h4',
// 							title: 'Heading 4',
// 							class: 'ck-heading_heading4'
// 						},
// 						{
// 							model: 'heading5',
// 							view: 'h5',
// 							title: 'Heading 5',
// 							class: 'ck-heading_heading5'
// 						},
// 						{
// 							model: 'heading6',
// 							view: 'h6',
// 							title: 'Heading 6',
// 							class: 'ck-heading_heading6'
// 						}
// 					]
// 				},
// 				htmlSupport: {
// 					allow: [
// 						{
// 							name: /^.*$/,
// 							styles: true,
// 							attributes: true,
// 							classes: true
// 						}
// 					]
// 				},
//         placeholder,
// 				initialData:value || "",
// 				licenseKey: LICENSE_KEY,
// 				link: {
// 					addTargetToExternalLinks: true,
// 					defaultProtocol: 'https://',
// 					decorators: {
// 						toggleDownloadable: {
// 							mode: 'manual',
// 							label: 'Downloadable',
// 							attributes: {
// 								download: 'file'
// 							}
// 						}
// 					}
// 				},
// 				list: {
// 					properties: {
// 						styles: true,
// 						startIndex: true,
// 						reversed: true
// 					}
// 				},
// 				placeholder: 'Type or paste your content here!',
// 				style: {
// 					definitions: [
// 						{
// 							name: 'Article category',
// 							element: 'h3',
// 							classes: ['category']
// 						},
// 						{
// 							name: 'Title',
// 							element: 'h2',
// 							classes: ['document-title']
// 						},
// 						{
// 							name: 'Subtitle',
// 							element: 'h3',
// 							classes: ['document-subtitle']
// 						},
// 						{
// 							name: 'Info box',
// 							element: 'p',
// 							classes: ['info-box']
// 						},
// 						{
// 							name: 'CTA Link Primary',
// 							element: 'a',
// 							classes: ['button', 'button--green']
// 						},
// 						{
// 							name: 'CTA Link Secondary',
// 							element: 'a',
// 							classes: ['button', 'button--black']
// 						},
// 						{
// 							name: 'Marker',
// 							element: 'span',
// 							classes: ['marker']
// 						},
// 						{
// 							name: 'Spoiler',
// 							element: 'span',
// 							classes: ['spoiler']
// 						}
// 					]
// 				},
// 				table: {
// 					contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
// 				}
// 			}
// 		};
// 	}, [isLayoutReady, value, placeholder]);

// 	return (
// 		<div className="main-container">
// 			<div
// 				className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-fullscreen"
// 				ref={editorContainerRef}
// 			>
// 				<div className="editor-container__editor">
// 					<div ref={editorRef}>{editorConfig && <CKEditor editor={ClassicEditor} config={editorConfig} />}</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

// "use client";

// import { useState, useEffect, useRef, useMemo } from "react";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import {
//   ClassicEditor,
//   Alignment,
//   Autoformat,
//   AutoLink,
//   Autosave,
//   BlockQuote,
//   Bold,
//   Code,
//   Essentials,
//   FindAndReplace,
//   FontBackgroundColor,
//   FontColor,
//   FontFamily,
//   FontSize,
//   Fullscreen,
//   GeneralHtmlSupport,
//   Heading,
//   Highlight,
//   HorizontalLine,
//   ImageEditing,
//   ImageUtils,
//   Indent,
//   IndentBlock,
//   Italic,
//   Link,
//   List,
//   ListProperties,
//   Paragraph,
//   PasteFromOffice,
//   RemoveFormat,
//   SourceEditing,
//   SpecialCharacters,
//   SpecialCharactersArrows,
//   SpecialCharactersCurrency,
//   SpecialCharactersEssentials,
//   SpecialCharactersLatin,
//   SpecialCharactersMathematical,
//   SpecialCharactersText,
//   Strikethrough,
//   Style,
//   Subscript,
//   Superscript,
//   Table,
//   TableCaption,
//   TableCellProperties,
//   TableColumnResize,
//   TableProperties,
//   TableToolbar,
//   TextTransformation,
//   TodoList,
//   Underline
// } from "ckeditor5";

// import "ckeditor5/ckeditor5.css";

// // Use your real key if you have one; "GPL" works for GPL builds.
// const LICENSE_KEY = "GPL";

// export default function CKEditorField({ value, onChange, placeholder = "Type here..." }) {
//   const editorContainerRef = useRef(null);
//   const editorRef = useRef(null);
//   const [isLayoutReady, setIsLayoutReady] = useState(false);

//   useEffect(() => {
//     setIsLayoutReady(true);
//     return () => setIsLayoutReady(false);
//   }, []);

//   // If parent changes `value`, reflect it in the editor
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const current = editor.getData ? editor.getData() : "";
//     if ((value || "") !== current) {
//       editor.setData(value || "");
//     }
//   }, [value]);

//   const editorConfig = useMemo(() => {
//     if (!isLayoutReady) return null;
//     return {
//       toolbar: {
//         items: [
//           "undo",
//           "redo",
//           "|",
//           "sourceEditing",
//           "findAndReplace",
//           "fullscreen",
//           "|",
//           "heading",
//           "style",
//           "|",
//           "fontSize",
//           "fontFamily",
//           "fontColor",
//           "fontBackgroundColor",
//           "|",
//           "bold",
//           "italic",
//           "underline",
//           "strikethrough",
//           "subscript",
//           "superscript",
//           "code",
//           "removeFormat",
//           "|",
//           "specialCharacters",
//           "horizontalLine",
//           "link",
//           "insertTable",
//           "highlight",
//           "blockQuote",
//           "|",
//           "alignment",
//           "|",
//           "bulletedList",
//           "numberedList",
//           "todoList",
//           "outdent",
//           "indent"
//         ],
//         shouldNotGroupWhenFull: false
//       },
//       plugins: [
//         Alignment,
//         Autoformat,
//         AutoLink,
//         Autosave,
//         BlockQuote,
//         Bold,
//         Code,
//         Essentials,
//         FindAndReplace,
//         FontBackgroundColor,
//         FontColor,
//         FontFamily,
//         FontSize,
//         Fullscreen,
//         GeneralHtmlSupport,
//         Heading,
//         Highlight,
//         HorizontalLine,
//         ImageEditing,
//         ImageUtils,
//         Indent,
//         IndentBlock,
//         Italic,
//         Link,
//         List,
//         ListProperties,
//         Paragraph,
//         PasteFromOffice,
//         RemoveFormat,
//         SourceEditing,
//         SpecialCharacters,
//         SpecialCharactersArrows,
//         SpecialCharactersCurrency,
//         SpecialCharactersEssentials,
//         SpecialCharactersLatin,
//         SpecialCharactersMathematical,
//         SpecialCharactersText,
//         Strikethrough,
//         Style,
//         Subscript,
//         Superscript,
//         Table,
//         TableCaption,
//         TableCellProperties,
//         TableColumnResize,
//         TableProperties,
//         TableToolbar,
//         TextTransformation,
//         TodoList,
//         Underline
//       ],
//       fontFamily: { supportAllValues: true },
//       fontSize: { options: [10, 12, 14, "default", 18, 20, 22], supportAllValues: true },
//       fullscreen: {
//         onEnterCallback: (container) =>
//           container.classList.add(
//             "editor-container",
//             "editor-container_classic-editor",
//             "editor-container_include-style",
//             "editor-container_include-fullscreen",
//             "main-container"
//           )
//       },
//       heading: {
//         options: [
//           { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
//           { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
//           { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
//           { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
//           { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
//           { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
//           { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" }
//         ]
//       },
//       htmlSupport: {
//         allow: [{ name: /^.*$/, styles: true, attributes: true, classes: true }]
//       },
//       placeholder,
//       licenseKey: LICENSE_KEY,
//       link: {
//         addTargetToExternalLinks: true,
//         defaultProtocol: "https://",
//         decorators: {
//           toggleDownloadable: {
//             mode: "manual",
//             label: "Downloadable",
//             attributes: { download: "file" }
//           }
//         }
//       },
//       list: { properties: { styles: true, startIndex: true, reversed: true } },
//       style: {
//         definitions: [
//           { name: "Article category", element: "h3", classes: ["category"] },
//           { name: "Title", element: "h2", classes: ["document-title"] },
//           { name: "Subtitle", element: "h3", classes: ["document-subtitle"] },
//           { name: "Info box", element: "p", classes: ["info-box"] },
//           { name: "CTA Link Primary", element: "a", classes: ["button", "button--green"] },
//           { name: "CTA Link Secondary", element: "a", classes: ["button", "button--black"] },
//           { name: "Marker", element: "span", classes: ["marker"] },
//           { name: "Spoiler", element: "span", classes: ["spoiler"] }
//         ]
//       },
//       table: {
//         contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"]
//       }
//     };
//   }, [isLayoutReady, placeholder]);

//   return (
//     <div className="main-container">
//       <div
//         className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-fullscreen"
//         ref={editorContainerRef}
//       >
//         <div className="editor-container__editor">
//           {editorConfig && (
//             <CKEditor
//               editor={ClassicEditor}
//               data={value || ""}                       // ⬅️ initial content
//               config={editorConfig}
//               onReady={(editor) => {
//                 editorRef.current = editor;           // keep instance
//                 // ensure initial value matches prop
//                 if ((value || "") !== editor.getData()) editor.setData(value || "");
//               }}
//               onChange={(_, editor) => {
//                 const html = editor.getData();        // ⬅️ HTML string
//                 onChange?.(html);                     // bubble to parent (e.g., setForm({ references: html }))
//               }}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NodgNARATAdCMA4KQIwgCxSgVgMxdxQAYV1t0QBOIonBWnfANgvSaOrwUqeQgFMAdsiJhgKMKNETpAXUhRKAEwCGSgGbYIsoA===
 */

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
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
	HtmlComment
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';


/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

export default function App() {
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const { editorConfig } = useMemo(() => {
		if (!isLayoutReady) {
			return {};
		}

		return {
			editorConfig: {
				toolbar: {
					items: [
						'undo',
						'redo',
						'|',
						'sourceEditing',
						'fullscreen',
						'|',
						'heading',
						'style',
						'|',
						'fontSize',
						'fontFamily',
						'fontColor',
						'fontBackgroundColor',
						'|',
						'bold',
						'italic',
						'underline',
						'strikethrough',
						'subscript',
						'superscript',
						'code',
						'|',
						'link',
						'insertTable',
						'highlight',
						'blockQuote',
						'codeBlock',
						'|',
						'alignment',
						'|',
						'bulletedList',
						'numberedList',
						'todoList',
						'outdent',
						'indent'
					],
					shouldNotGroupWhenFull: false
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
					Underline
				],
				fontFamily: {
					supportAllValues: true
				},
				fontSize: {
					options: [10, 12, 14, 'default', 18, 20, 22],
					supportAllValues: true
				},
				fullscreen: {
					onEnterCallback: container =>
						container.classList.add(
							'editor-container',
							'editor-container_classic-editor',
							'editor-container_include-style',
							'editor-container_include-fullscreen',
							'main-container'
						)
				},
				heading: {
					options: [
						{
							model: 'paragraph',
							title: 'Paragraph',
							class: 'ck-heading_paragraph'
						},
						{
							model: 'heading1',
							view: 'h1',
							title: 'Heading 1',
							class: 'ck-heading_heading1'
						},
						{
							model: 'heading2',
							view: 'h2',
							title: 'Heading 2',
							class: 'ck-heading_heading2'
						},
						{
							model: 'heading3',
							view: 'h3',
							title: 'Heading 3',
							class: 'ck-heading_heading3'
						},
						{
							model: 'heading4',
							view: 'h4',
							title: 'Heading 4',
							class: 'ck-heading_heading4'
						},
						{
							model: 'heading5',
							view: 'h5',
							title: 'Heading 5',
							class: 'ck-heading_heading5'
						},
						{
							model: 'heading6',
							view: 'h6',
							title: 'Heading 6',
							class: 'ck-heading_heading6'
						}
					]
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true,
							attributes: true,
							classes: true
						}
					]
				},
				initialData:
					'<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou\'ve successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What\'s next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor\'s\n\t\tconfiguration to match your application\'s style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don\'t hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<ul>\n\t<li>📝 <a href="https://portal.ckeditor.com/checkout?plan=free">Trial sign up</a>,</li>\n\t<li>📕 <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/index.html">Documentation</a>,</li>\n\t<li>⭐️ <a href="https://github.com/ckeditor/ckeditor5">GitHub</a> (star us if you can!),</li>\n\t<li>🏠 <a href="https://ckeditor.com">CKEditor Homepage</a>,</li>\n\t<li>🧑‍💻 <a href="https://ckeditor.com/ckeditor-5/demo/">CKEditor 5 Demos</a>,</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser\'s\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n',
				licenseKey: LICENSE_KEY,
				link: {
					addTargetToExternalLinks: true,
					defaultProtocol: 'https://',
					decorators: {
						toggleDownloadable: {
							mode: 'manual',
							label: 'Downloadable',
							attributes: {
								download: 'file'
							}
						}
					}
				},
				placeholder: 'Type or paste your content here!',
				style: {
					definitions: [
						{
							name: 'Article category',
							element: 'h3',
							classes: ['category']
						},
						{
							name: 'Title',
							element: 'h2',
							classes: ['document-title']
						},
						{
							name: 'Subtitle',
							element: 'h3',
							classes: ['document-subtitle']
						},
						{
							name: 'Info box',
							element: 'p',
							classes: ['info-box']
						},
						{
							name: 'CTA Link Primary',
							element: 'a',
							classes: ['button', 'button--green']
						},
						{
							name: 'CTA Link Secondary',
							element: 'a',
							classes: ['button', 'button--black']
						},
						{
							name: 'Marker',
							element: 'span',
							classes: ['marker']
						},
						{
							name: 'Spoiler',
							element: 'span',
							classes: ['spoiler']
						}
					]
				},
				table: {
					contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
				}
			}
		};
	}, [isLayoutReady]);

	return (
		<div className="main-container">
			<div
				className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-fullscreen"
				ref={editorContainerRef}
			>
				<div className="editor-container__editor">
					<div ref={editorRef}>{editorConfig && <CKEditor editor={ClassicEditor} config={editorConfig} />}</div>
				</div>
			</div>
		</div>
	);
}
