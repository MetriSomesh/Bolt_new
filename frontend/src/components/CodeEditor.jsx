import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export function CodeEditor({ content, language }) {
  const [editorContent, setEditorContent] = useState(content);

  // Update content when prop changes
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  const handleEditorDidMount = (editor, monaco) => {
    // Trigger layout update after mount to prevent resize issues
    setTimeout(() => {
      editor.layout();
    }, 0);

    // Automatically detect language if not specified
    if (!language) {
      const model = editor.getModel();
      monaco.editor.setModelLanguage(
        model,
        monaco.languages.getLanguageIdentifier(model.getLanguageId()).language
      );
    }
  };

  // Determine language based on file extension
  const getLanguage = () => {
    if (language) return language;

    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      html: "html",
      css: "css",
      scss: "scss",
      py: "python",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
    };

    const ext = language || content.split(".").pop()?.toLowerCase();
    return languageMap[ext] || "typescript";
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={editorContent}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          readOnly: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          contextmenu: false,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
