import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { StatusBar } from "./components/StatusBar";
import { FileNode } from "./lib/types";
import "./styles/global.css";
import "./App.css";

interface WorkspaceResult {
  name: string;
  rootPath: string;
  tree: FileNode[];
}

function App() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [wordCount, setWordCount] = useState(0);

  async function handleOpenWorkspace() {
    const result = await invoke<WorkspaceResult | null>("open_workspace");
    if (result) {
      setTree(result.tree);
      setWorkspaceName(result.name);
      setSelectedFile(null);
      setWordCount(0);
    }
  }

  function handleSelectFile(node: FileNode) {
    setSelectedFile(node);
    setWordCount(0);
  }

  return (
    <div className="app">
      <div className="app-body">
        <Sidebar
          tree={tree}
          selectedPath={selectedFile?.path ?? null}
          onSelect={handleSelectFile}
          onOpenWorkspace={handleOpenWorkspace}
          workspaceName={workspaceName}
        />
        <Editor
          key={selectedFile?.path ?? "empty"}
          onWordCount={setWordCount}
        />
      </div>
      <StatusBar
        fileName={selectedFile?.name ?? null}
        wordCount={wordCount}
      />
    </div>
  );
}

export default App;
