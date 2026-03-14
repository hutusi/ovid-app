import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { StatusBar } from "./components/StatusBar";
import { FileNode } from "./lib/types";
import { parseFrontmatter, joinFrontmatter } from "./lib/frontmatter";
import "./styles/global.css";
import "./App.css";

interface WorkspaceResult {
  name: string;
  rootPath: string;
  tree: FileNode[];
}

const SAVE_DELAY_MS = 750;

function App() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);

  const frontmatterRef = useRef<string>("");
  const selectedPathRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  async function handleOpenWorkspace() {
    const result = await invoke<WorkspaceResult | null>("open_workspace");
    if (result) {
      setTree(result.tree);
      setWorkspaceName(result.name);
      setSelectedFile(null);
      setFileContent("");
      setWordCount(0);
      frontmatterRef.current = "";
      selectedPathRef.current = null;
    }
  }

  async function handleSelectFile(node: FileNode) {
    // Flush any pending save for the outgoing file
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setSelectedFile(node);
    setFileContent("");
    setWordCount(0);
    selectedPathRef.current = node.path;

    try {
      const raw = await invoke<string>("read_file", { path: node.path });
      // Guard against stale response if user switched files rapidly
      if (selectedPathRef.current !== node.path) return;
      const { frontmatter, body } = parseFrontmatter(raw);
      frontmatterRef.current = frontmatter;
      setFileContent(body);
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  }

  function handleEditorChange(markdown: string) {
    if (!selectedFile) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const diskContent = joinFrontmatter(frontmatterRef.current, markdown);
      try {
        await invoke("write_file", { path: selectedFile.path, content: diskContent });
      } catch (err) {
        console.error("Failed to save file:", err);
      }
    }, SAVE_DELAY_MS);
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
          content={fileContent}
          onWordCount={setWordCount}
          onChange={handleEditorChange}
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
