import React from "react";
import {
  FolderIcon,
  FileIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";

const FileItem = ({ file, onFileSelect, depth = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div style={{ marginLeft: `${depth * 12}px` }}>
      <div
        className="flex items-center p-2 hover:bg-gray-700 cursor-pointer rounded text-gray-300"
        onClick={() => {
          if (file.type === "folder") {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(file);
          }
        }}
      >
        {file.type === "folder" ? (
          <>
            {isOpen ? (
              <ChevronDownIcon size={16} />
            ) : (
              <ChevronRightIcon size={16} />
            )}
            <FolderIcon size={16} className="mr-2 text-blue-400" />
          </>
        ) : (
          <FileIcon size={16} className="mr-2 text-gray-400" />
        )}
        <span className="text-sm">{file.name}</span>
      </div>

      {file.type === "folder" &&
        isOpen &&
        file.children?.map((child, index) => (
          <FileItem
            key={index}
            file={child}
            onFileSelect={onFileSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  );
};

export function FileExplorer({ files, onFileSelect }) {
  return (
    <div className="h-full overflow-y-auto bg-gray-800 rounded-lg">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Files</h2>
        {files.map((file, index) => (
          <FileItem key={index} file={file} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
}
