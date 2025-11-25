"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CKEditorLoader = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic")).default;

    return ({ data, onChange, onBlur }) => (
      <CKEditor
        editor={ClassicEditor}
        data={data}
        onChange={onChange}
        onBlur={onBlur}
        config={{
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "bulletedList",
            "numberedList",
            "blockQuote",
          ],
        }}
      />
    );
  },
  { ssr: false }
);

export default function RichTextEditorWrapper(props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true); // force render after mount (fixes hydration errors)
  }, []);

  return loaded ? <CKEditorLoader {...props} /> : null;
}
