import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "./components/Editor";
import { EmptyState } from "./components/EmptyState";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Sidebar } from "./components/Sidebar";
import { type SaveStatus, StatusBar } from "./components/StatusBar";
import {
  joinFrontmatter,
  type ParsedFrontmatter,
  parseFrontmatter,
  parseYamlFrontmatter,
} from "./lib/frontmatter";
import type { FileNode } from "./lib/types";
import { useTheme } from "./lib/useTheme";
import "./styles/global.css";
import "./App.css";

interface WorkspaceResult {
  name: string;
  rootPath: string;
  tree: FileNode[];
}

interface Toast {
  id: number;
  message: string;
}

const SAVE_DELAY_MS = 750;
const SIDEBAR_VISIBLE_KEY = "ovid:sidebarVisible";

function App() {
  const { resolvedTheme, setPreference } = useTheme();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [parsedFrontmatter, setParsedFrontmatter] = useState<ParsedFrontmatter>({});
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(
    () => localStorage.getItem(SIDEBAR_VISIBLE_KEY) !== "false"
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const frontmatterRef = useRef<string>("");
  const selectedPathRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stores the latest unsaved markdown so file switches can flush it
  const pendingMarkdownRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const flushPendingSave = useCallback(async () => {
    if (!saveTimerRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;

    const path = selectedPathRef.current;
    const markdown = pendingMarkdownRef.current;
    if (!path || markdown === null) return;

    pendingMarkdownRef.current = null;
    const diskContent = joinFrontmatter(frontmatterRef.current, markdown);
    try {
      await invoke("write_file", { path, content: diskContent });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Failed to flush pending save:", err);
      showToast("Failed to save — check console for details");
    }
  }, [showToast]);

  const handleCloseFile = useCallback(async () => {
    await flushPendingSave();
    setSelectedFile(null);
    setFileContent("");
    setWordCount(0);
    setParsedFrontmatter({});
    setSaveStatus("saved");
    frontmatterRef.current = "";
    selectedPathRef.current = null;
    pendingMarkdownRef.current = null;
  }, [flushPendingSave]);

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.metaKey) return;
      switch (e.key) {
        case "\\":
          e.preventDefault();
          setSidebarVisible((v) => {
            const next = !v;
            localStorage.setItem(SIDEBAR_VISIBLE_KEY, String(next));
            return next;
          });
          break;
        case "P":
          if (e.shiftKey) {
            e.preventDefault();
            setPropertiesOpen((v) => !v);
          }
          break;
        case "s":
          e.preventDefault();
          void flushPendingSave();
          break;
        case "w":
          e.preventDefault();
          void handleCloseFile();
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flushPendingSave, handleCloseFile]);

  async function handleOpenWorkspace() {
    await flushPendingSave();
    const result = await invoke<WorkspaceResult | null>("open_workspace");
    if (result) {
      setTree(result.tree);
      setWorkspaceName(result.name);
      setSelectedFile(null);
      setFileContent("");
      setWordCount(0);
      setParsedFrontmatter({});
      setSaveStatus("saved");
      frontmatterRef.current = "";
      selectedPathRef.current = null;
      pendingMarkdownRef.current = null;
    }
  }

  async function handleSelectFile(node: FileNode) {
    // Flush any pending save for the outgoing file before switching
    await flushPendingSave();

    setWordCount(0);
    setParsedFrontmatter({});
    setSaveStatus("saved");
    const prevPath = selectedPathRef.current;
    selectedPathRef.current = node.path;
    pendingMarkdownRef.current = null;

    try {
      const raw = await invoke<string>("read_file", { path: node.path });
      if (selectedPathRef.current !== node.path) return;
      const { frontmatter, body } = parseFrontmatter(raw);
      frontmatterRef.current = frontmatter;
      // Set selectedFile and fileContent together so the Editor mounts with
      // the new key only after content is ready. Tiptap's useEditor treats
      // `content` as an initialisation-only value, so the Editor must receive
      // the correct content on its first render or it will stay blank.
      setSelectedFile(node);
      setFileContent(body);
      setParsedFrontmatter(parseYamlFrontmatter(raw));
    } catch (err) {
      console.error("Failed to read file:", err);
      showToast("Failed to open file — check console for details");
      // Restore previous path so flushPendingSave doesn't write to the
      // failed file's path if the user continues editing the old file.
      if (selectedPathRef.current === node.path) selectedPathRef.current = prevPath;
    }
  }

  function handleEditorChange(markdown: string) {
    if (!selectedFile) return;
    // Capture path now — selectedFile state may change before timeout fires
    const pathToSave = selectedFile.path;
    setSaveStatus("unsaved");
    pendingMarkdownRef.current = markdown;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      pendingMarkdownRef.current = null;
      const diskContent = joinFrontmatter(frontmatterRef.current, markdown);
      try {
        await invoke("write_file", { path: pathToSave, content: diskContent });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save file:", err);
        showToast("Failed to save — check console for details");
      }
    }, SAVE_DELAY_MS);
  }

  const hasFrontmatter = Object.keys(parsedFrontmatter).length > 0;

  return (
    <div className="app">
      <div className="app-body">
        <Sidebar
          tree={tree}
          selectedPath={selectedFile?.path ?? null}
          onSelect={handleSelectFile}
          onOpenWorkspace={handleOpenWorkspace}
          workspaceName={workspaceName}
          visible={sidebarVisible}
        />
        <div className="editor-column">
          {selectedFile && hasFrontmatter && (
            <PropertiesPanel
              frontmatter={parsedFrontmatter}
              isOpen={propertiesOpen}
              onToggle={() => setPropertiesOpen((v) => !v)}
            />
          )}
          {selectedFile ? (
            <Editor
              key={selectedFile.path}
              content={fileContent}
              onWordCount={setWordCount}
              onChange={handleEditorChange}
            />
          ) : (
            <EmptyState workspaceOpen={tree.length > 0} onOpenWorkspace={handleOpenWorkspace} />
          )}
        </div>
      </div>
      <StatusBar
        fileName={selectedFile?.name ?? null}
        wordCount={wordCount}
        resolvedTheme={resolvedTheme}
        saveStatus={saveStatus}
        onToggleTheme={() => setPreference(resolvedTheme === "dark" ? "light" : "dark")}
      />
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
