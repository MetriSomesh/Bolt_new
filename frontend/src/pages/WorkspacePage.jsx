import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FileExplorer } from "../components/FileExplorer";
import { StepsList } from "../components/StepsList";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewPane } from "../components/PreviewPane";
import { Code, Eye } from "lucide-react";
// import { http://localhost:5000 } from "../config";
import axios from "axios";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";

export function WorkspacePage() {
  const location = useLocation();
  const prompt = location.state?.prompt;
  const webcontainer = useWebContainer();
  const StepType = {
    CreateFile: "CreateFile",
    CreateFolder: "CreateFolder",
    EditFile: "EditFile",
    DeleteFile: "DeleteFile",
    RunScript: "RunScript",
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("code");
  const [steps, setSteps] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [llmMessasges, setLlmMessages] = useState([]);
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            // console.log("CURRENT FOLDER: ", currentFolder);
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              ).children;
            }
          }
          originalFiles = finalAnswerRef;
          // console.log("ORIGINAL FILES: ", finalAnswerRef);
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
    // console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files) => {
      const mountStructure = {};

      const processFile = (file, isRootFolder) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log("WEB CONTAINERS: ", mountStructure);
    if (webcontainer) {
      webcontainer.mount(mountStructure);
    }
  }, [files, webcontainer]);

  const handleFileSelect = useCallback((file) => {
    if (file.type === "file") {
      setSelectedFile({
        ...file,
        content: file.content || "// No content",
      });
      setActiveTab("code");
    }
  }, []);

  async function init() {
    const res = await axios.post(`http://localhost:5000/template`, {
      prompt: prompt.trim(),
    });
    const prompts = res.data.prompt;
    const uiPrompts = res.data.uiPrompts;
    setSteps(
      parseXml(uiPrompts[0]).map((x) => ({
        ...x,
        status: "pending",
      }))
    );

    const stepsResponse = await axios.post(`http://localhost:5000/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });
    // console.log("stepRESPONSE IS : ", stepsResponse.data);
    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.message).map((x) => ({
        ...x,
        status: "pending",
      })),
    ]);

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }))
    );

    setLlmMessages((x) => [
      ...x,
      { role: "model", content: stepsResponse.data.message },
    ]);
  }
  useEffect(() => {
    init();
  }, []);

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 space-x-2 rounded-t-lg ${
        activeTab === id
          ? "bg-gray-800 text-gray-100"
          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      <div className="w-1/4 h-full p-4 border-r border-gray-700 flex flex-col">
        <div className="h-[70%] overflow-hidden">
          <StepsList steps={steps} />
        </div>
        <div className="h-[30%] flex flex-col">
          <textarea
            className="w-full flex-grow resize-none p-2 mt-3 bg-gray-800 text-white border border-gray-700 rounded"
            placeholder="Chat"
            name="chat"
            value={userPrompt}
            onChange={(e) => {
              setUserPrompt(e.target.value);
            }}
          />
          <button
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={async () => {
              const newMessage = {
                role: "user",
                content: userPrompt,
              };
              const stepsResponse = await axios.post(
                `http://localhost:5000/chat`,
                {
                  messages: [...llmMessasges, newMessage],
                }
              );
              setLlmMessages((x) => [...x, newMessage]);
              setLlmMessages((x) => [
                ...x,
                {
                  role: "model",
                  content: stepsResponse.data.message,
                },
              ]);
              setSteps((s) => [
                ...s,
                ...parseXml(stepsResponse.data.message).map((x) => ({
                  ...x,
                  status: "pending",
                })),
              ]);
            }}
          >
            Send
          </button>
        </div>
      </div>
      <div className="w-1/4 p-4 border-r border-gray-700 overflow-hidden">
        <FileExplorer files={files} onFileSelect={handleFileSelect} />
      </div>
      <div className="w-3/4 p-4 overflow-hidden">
        <div className="h-full bg-gray-800 rounded-lg overflow-hidden flex flex-col">
          <div className="flex space-x-2 p-2 bg-gray-700">
            <TabButton id="code" icon={Code} label="Code" />
            <TabButton id="preview" icon={Eye} label="Preview" />
          </div>

          {activeTab === "code" ? (
            selectedFile ? (
              <>
                <div className="p-2 bg-gray-700 text-gray-200 text-sm border-t border-gray-600">
                  {selectedFile.path}
                </div>
                <div className="h-[calc(100%-40px)]">
                  <CodeEditor
                    content={selectedFile.content}
                    language={selectedFile.path.split(".").pop()}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a file to view its contents
              </div>
            )
          ) : (
            <PreviewPane webContainer={webcontainer} files={files} />
          )}
        </div>
      </div>
    </div>
  );
}
